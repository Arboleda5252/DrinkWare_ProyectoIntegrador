"use client";

import * as React from "react";
import {
  FaSpinner,
  FaClipboardCheck,
  FaBan,
  FaShoppingCart,
  FaTrash,
  FaMinus,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

const FALLBACK_PEDIDO_ID = 1;
const PEDIDO_CARRITO_ID = (() => {
  const raw = process.env.NEXT_PUBLIC_PEDIDO_ID;
  const parsed = raw !== undefined ? Number(raw) : Number.NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : FALLBACK_PEDIDO_ID;
})();

type Producto = {
  id: number;
  nombre: string;
  categoria: string | null;
  precio: number;
  stock: number;
  estado: string | null;
  descripcion: string | null;
  imagen: string | null;
};

type ProductoApi = Omit<Producto, "estado"> & {
  estados: string | null;
};

type ItemCarrito = {
  id: number;
  nombre: string;
  precio: number;
  imagen: string | null;
  cantidad: number;
};

export default function Page() {
  const router = useRouter();

  // ------------------------
  // ESTADOS
  // ------------------------
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busqueda, setBusqueda] = React.useState("");

  // FILTROS
  const [categoriaFiltro, setCategoriaFiltro] = React.useState("");
  const [precioMin, setPrecioMin] = React.useState("");
  const [precioMax, setPrecioMax] = React.useState("");
  const [orden, setOrden] = React.useState("");

  // PAGINACION
  const [pagina, setPagina] = React.useState(1);
  const productosPorPagina = 8;

  // MODAL DETALLES
  const [modalProducto, setModalProducto] = React.useState<Producto | null>(null);

  // CARRITO
  const [carrito, setCarrito] = React.useState<ItemCarrito[]>([]);
  const [drawerAbierto, setDrawerAbierto] = React.useState(false);

  // ------------------------
  // CARGA DE PRODUCTOS
  // ------------------------
  React.useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        setCargando(true);
        const res = await fetch("/api/productos", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error ?? "Respuesta inválida");

        if (!cancelado) {
          const disponibles = (json.data as ProductoApi[])
            .filter(
              (producto) =>
                (producto.estados ?? "").toLowerCase() === "disponible"
            )
            .map(({ estados, ...producto }) => ({
              ...producto,
              estado: estados,
            }));

          setProductos(disponibles);
        }
      } catch (e: any) {
        if (!cancelado) setError(e?.message ?? "Error al cargar productos");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  // ------------------------
  // FILTRADO DE PRODUCTOS
  // ------------------------
  const productosFiltrados = React.useMemo(() => {
    let lista = [...productos];

    const termino = busqueda.trim().toLowerCase();
    if (termino) {
      lista = lista.filter((p) =>
        p.nombre.toLowerCase().includes(termino)
      );
    }

    if (categoriaFiltro) {
      lista = lista.filter(
        (p) =>
          p.categoria?.toLowerCase() === categoriaFiltro.toLowerCase()
      );
    }

    if (precioMin) {
      const min = Number(precioMin);
      if (!Number.isNaN(min)) lista = lista.filter((p) => p.precio >= min);
    }

    if (precioMax) {
      const max = Number(precioMax);
      if (!Number.isNaN(max)) lista = lista.filter((p) => p.precio <= max);
    }

    if (orden === "nombre-asc") lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === "nombre-desc") lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
    if (orden === "precio-asc") lista.sort((a, b) => a.precio - b.precio);
    if (orden === "precio-desc") lista.sort((a, b) => b.precio - a.precio);

    return lista;
  }, [productos, busqueda, categoriaFiltro, precioMin, precioMax, orden]);

  const categorias = React.useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      const cat = p.categoria?.trim();
      if (cat) set.add(cat);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [productos]);

  // ------------------------
  // PAGINACIÓN
  // ------------------------
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  const productosPagina = React.useMemo(() => {
    const inicio = (pagina - 1) * productosPorPagina;
    return productosFiltrados.slice(inicio, inicio + productosPorPagina);
  }, [productosFiltrados, pagina]);

  // =========================================================
  // MANEJO DE CARRITO
  // =========================================================

  const registrarDetallePedido = React.useCallback(
    async (producto: Producto, cantidad: number) => {
      try {
        const response = await fetch("/api/Detallepedido", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pedidoId: PEDIDO_CARRITO_ID,
            productoId: producto.id,
            cantidad,
            precioProducto: producto.precio,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const mensaje = payload?.error ?? response.statusText;
          console.error("[Detallepedido] no se pudo registrar el producto:", mensaje);
        }
      } catch (error) {
        console.error("[Detallepedido] error al registrar el producto", error);
      }
    },
    []
  );

  const agregarAlCarrito = (producto: Producto) => {
    let cantidadRegistrada = 1;
    setCarrito((prev) => {
      const existente = prev.find((p) => p.id === producto.id);
      cantidadRegistrada = existente ? existente.cantidad + 1 : 1;
      if (existente) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad: 1,
        },
      ];
    });
    void registrarDetallePedido(producto, cantidadRegistrada);
  };

  const aumentar = (id: number) => {
    setCarrito((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p
      )
    );
  };

  const disminuir = (id: number) => {
    setCarrito((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, cantidad: Math.max(1, p.cantidad - 1) } : p
        )
        .filter((p) => p.cantidad > 0)
    );
  };

  const eliminar = (id: number) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const vaciarCarrito = () => setCarrito([]);

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      {/* BOTÓN DEL CARRITO */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setDrawerAbierto(true)}
          className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 flex items-center gap-2 text-lg"
        >
          <FaShoppingCart />
          <span>{carrito.length}</span>
        </button>
      </div>

      <h1 className="text-5xl font-bold text-center text-indigo-700 mb-8">
        Catálogo de Productos
      </h1>

      {/* BÚSQUEDA */}
      <div className="mx-auto mb-8 max-w-xl">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Busca por nombre..."
          className="w-full rounded-lg border px-4 py-2 shadow-sm"
        />
      </div>

      {/* FILTROS */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mb-10">
        <select
          className="p-2 border rounded"
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Categoria</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          placeholder="Precio minimo"
          className="p-2 border rounded"
          value={precioMin}
          onChange={(e) => setPrecioMin(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Precio maximo"
          className="p-2 border rounded"
          value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)}
        />

        <select
          className="p-2 border rounded"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
        >
          <option value="">Ordenar</option>
          <option value="nombre-asc">A - Z</option>
          <option value="nombre-desc">Z - A</option>
          <option value="precio-asc">Precio menor a mayor</option>
          <option value="precio-desc">Precio mayor a menor</option>
        </select>
      </div>

      {/* MENSAJES */}
      {cargando && (
        <div className="flex justify-center items-center text-purple-600 text-xl">
          <FaSpinner className="animate-spin mr-2" /> Cargando productos...
        </div>
      )}

      {error && <div className="text-center text-red-600">{error}</div>}

      {!cargando && !error && productosFiltrados.length === 0 && (
        <div className="text-center text-gray-600 text-xl mt-10 border p-6 rounded-lg bg-white">
          No se encontraron productos.
        </div>
      )}

      {/* GRID DE PRODUCTOS (10 por página) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productosPagina.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-xl shadow-md overflow-hidden text-center flex flex-col h-full"
          >
            <div className="relative bg-gray-50 h-64 flex items-center justify-center">
              <Image
                src={producto.imagen || "/no-image.png"}
                alt={producto.nombre}
                width={220}
                height={220}
                className="h-56 w-auto object-contain"
              />

              <button
                onClick={() => agregarAlCarrito(producto)}
                className="absolute top-2 right-2 bg-black text-white p-2 rounded-full"
              >
                <FaShoppingCart />
              </button>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {producto.nombre}
              </h2>

              <p className="mt-1 text-lg font-semibold text-slate-700">
                ${producto.precio.toLocaleString("es-CO")}
              </p>

              <button
                onClick={() => setModalProducto(producto)}
                className="mt-auto w-full bg-black text-white py-2 rounded transition-colors hover:bg-sky-500"
              >
                <FaClipboardCheck className="inline mr-2" /> Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINACIÓN */}
      <div className="flex justify-center gap-3 mt-10">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina((p) => p - 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-40"
        >
          Anterior
        </button>

        {[...Array(totalPaginas)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPagina(i + 1)}
            className={`px-4 py-2 rounded ${
              pagina === i + 1
                ? "bg-black text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina((p) => p + 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL DETALLES */}
      {/* ========================================================= */}
      {modalProducto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white w-[90%] md:w-[600px] rounded-xl shadow-xl p-6 relative">
            {/* Cerrar */}
            <button
              onClick={() => setModalProducto(null)}
              className="absolute top-4 right-4 text-gray-700 hover:text-black"
            >
              <FaTimes size={22} />
            </button>

            <div className="flex flex-col items-center">
              <Image
                src={modalProducto.imagen || "/no-image.png"}
                width={300}
                height={300}
                alt={modalProducto.nombre}
                className="rounded-lg mb-4"
              />

              <h2 className="text-3xl font-bold text-indigo-600 mb-3">
                {modalProducto.nombre}
              </h2>

              <p className="text-lg text-gray-700 mb-2">
                <strong>Precio:</strong> ${modalProducto.precio.toLocaleString("es-CO")}
              </p>

              <p className="text-lg text-gray-700 mb-2">
                <strong>Categoría:</strong> {modalProducto.categoria}
              </p>

              <p className="text-lg text-gray-700 mb-2">
                <strong>Stock:</strong> {modalProducto.stock}
              </p>

              <p className="text-lg text-gray-700 mb-4">
                <strong>Descripción:</strong> {modalProducto.descripcion}
              </p>

              <button
                onClick={() => {
                  agregarAlCarrito(modalProducto);
                  setModalProducto(null);
                }}
                className="mt-4 bg-black text-white px-6 py-2 rounded-lg"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER CARRITO */}
      {/* ========================================================= */}
      {drawerAbierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setDrawerAbierto(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl p-6 z-50 transform transition-transform duration-300 ${
          drawerAbierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaShoppingCart /> Carrito
        </h2>

        {carrito.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Tu carrito está vacío
          </p>
        ) : (
          <>
            <ul className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
              {carrito.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 border-b pb-3"
                >
                  <Image
                    src={item.imagen || "/no-image.png"}
                    alt={item.nombre}
                    width={60}
                    height={60}
                    className="rounded"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{item.nombre}</p>
                    <p className="text-sm text-gray-600">
                      ${item.precio.toLocaleString("es-CO")}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="p-1 bg-gray-200 rounded"
                        onClick={() => disminuir(item.id)}
                      >
                        <FaMinus />
                      </button>
                      <span>{item.cantidad}</span>
                      <button
                        className="p-1 bg-gray-200 rounded"
                        onClick={() => aumentar(item.id)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>

                  <button
                    className="text-red-600"
                    onClick={() => eliminar(item.id)}
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <p className="text-xl font-bold">
                Total: ${total.toLocaleString("es-CO")}
              </p>

              <button
                onClick={vaciarCarrito}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded"
              >
                Vaciar Carrito
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
