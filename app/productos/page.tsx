"use client";

import * as React from "react";
import { FaSpinner, FaClipboardCheck, FaBan } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaShoppingCart } from "react-icons/fa";

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

export default function Page() {
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busqueda, setBusqueda] = React.useState("");
  const router = useRouter();

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
            .filter((producto) => (producto.estados ?? "").toLowerCase() === "disponible")
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

  const productosFiltrados = React.useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return productos;
    return productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(termino)
    );
  }, [productos, busqueda]);

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-5xl font-bold text-center text-indigo-700 mb-8">
        Catálogo de Productos
      </h1>

      <div className="mx-auto mb-8 max-w-xl">
        <label className="sr-only" htmlFor="busqueda-productos">
          Buscar productos por nombre
        </label>
        <input
          id="busqueda-productos"
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Busca por nombre..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>

      {cargando && (
        <div className="flex justify-center items-center text-purple-600 text-xl">
          <FaSpinner className="animate-spin mr-2" />
          Cargando productos...
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center text-red-600 text-lg">
          <FaBan className="mr-2" />
          {error}
        </div>
      )}

      {!cargando && !error && productos.length === 0 && (
        <div className="text-center text-gray-500">No hay productos disponibles.</div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productosFiltrados.map((producto) => {
          const esDisponible = (producto.estado ?? "").toLowerCase() === "disponible";
          const stockAgotado = (producto.stock ?? 0) <= 0;
          const estadoMostrado = stockAgotado ? "Agotado" : (producto.estado ?? "Desconocido");
          const claseEstado = stockAgotado
            ? "text-orange-500"
            : esDisponible
              ? "text-green-600"
              : "text-red-500";
          return (
            <div
              key={producto.id}
              className="bg-white rounded-xl shadow-md overflow-hidden text-center hover:shadow-lg transition-shadow"
            >
              <div className="relative flex justify-center items-center p-4 bg-gray-50">
                <div>
                  {producto.imagen ? (
                    <Image
                      src={producto.imagen}
                      alt={producto.nombre}
                      width={300}
                      height={300}
                      className="h-80 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="absolute top-0 right-0 p-4 text-black hover:text-slate-700 text-3xl">
                  <FaShoppingCart />
                </div>
              </div>


              <div className="p-4">
                <h2 className="text-xl font-semibold text-indigo-500">{producto.nombre}</h2>
                <p className="text-sm text-gray-600">{producto.descripcion}</p>
                <p className="mt-2 text-green-600 font-bold text-lg">
                  ${producto.precio.toLocaleString("es-CO")}
                </p>
                <p className="text-sm text-gray-500">
                  Stock: {producto.stock} | Estado:{" "}
                  <span
                    className={`font-semibold ${claseEstado}`}
                  >
                    {estadoMostrado}
                  </span>
                </p>
                <button
                  onClick={() => router.push(`/productos/${producto.id}`)}
                  className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-sky-700 transition-colors flex items-center justify-center"
                >
                  <FaClipboardCheck className="mr-2" />
                  Ver detalles
                </button>
              </div>
            </div>
          );
        })}
        {!cargando && !error && productos.length > 0 && productosFiltrados.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-white py-10 text-center text-gray-500">
            No encontramos productos que coincidan con "{busqueda.trim()}".
          </div>
        )}
      </div>
    </main>
  );
}
