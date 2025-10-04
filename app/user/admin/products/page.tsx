"use client";

import * as React from "react";
import { FaSpinner, FaClipboardCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FaBan } from "react-icons/fa";
import Image from "next/image";

type Producto = {
  id: number;
  nombre: string;
  categoria: string | null;
  precio: number;
  stock: number;
  estados: string | null;
};

type ProductoDetalle = Producto & {
  descripcion: string | null;
  imagen: string | null;
  id_proveedor: number | null;
};

const ICON = "h-4 w-4";
const Eye = () => (
  <svg className={ICON} viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const Trash = () => (
  <svg className={ICON} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const Search = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const MONEDA = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export default function ProductsPage() {
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [filtroCategoria, setFiltroCategoria] = React.useState<string>("Todas");
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modal Info e Inactivar
  const [modalVerAbierto, setModalVerAbierto] = React.useState(false);
  const [productoVer, setProductoVer] = React.useState<ProductoDetalle | null>(null);
  const [modalInactivarAbierto, setModalInactivarAbierto] = React.useState(false);
  const [productoInactivar, setProductoInactivar] = React.useState<Producto | null>(null);
  const [guardandoInactivar, setGuardandoInactivar] = React.useState(false);
  const [errorInactivar, setErrorInactivar] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        setCargando(true);
        const res = await fetch("/api/productos", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error ?? "Respuesta inválida");
        if (!cancelado) setProductos(json.data as Producto[]);
      } catch (e: any) {
        if (!cancelado) setError(e?.message ?? "Error al cargar productos");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  const categorias = React.useMemo(() => {
    const set = new Set<string>(productos.map(p => p.categoria ?? "Sin categoría"));
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b, "es"))];
  }, [productos]);

  const filtrados = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return productos.filter((p) => {
      const texto = [p.nombre ?? "", p.categoria ?? "Sin categoría", String(p.precio ?? ""), String(p.stock ?? "")]
        .join(" ").toLowerCase();
      const coincideTexto = q ? texto.includes(q) : true;
      const coincideCat = filtroCategoria === "Todas" ? true : (p.categoria ?? "Sin categoría") === filtroCategoria;
      return coincideTexto && coincideCat;
    });
  }, [productos, query, filtroCategoria]);

  // Ver producto 
  const verProducto = async (p: Producto) => {
    setProductoVer(null);
    setModalVerAbierto(true);
    try {
      const res = await fetch(`/api/productos/${p.id}`, { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json?.ok && json.data) {
        setProductoVer(json.data as ProductoDetalle);
      } else {
        setProductoVer({ ...p, descripcion: null, imagen: null, id_proveedor: null });
      }
    } catch {
      setProductoVer({ ...p, descripcion: null, imagen: null, id_proveedor: null });
    }
  };
  const cerrarModalVer = () => { setModalVerAbierto(false); setProductoVer(null); };

  // Abrir modal de inactivar 
  const abrirInactivar = (p: Producto) => {
    setProductoInactivar(p);
    setErrorInactivar(null);
    setModalInactivarAbierto(true);
  };
  const cerrarInactivar = () => {
    setModalInactivarAbierto(false);
    setProductoInactivar(null);
    setGuardandoInactivar(false);
    setErrorInactivar(null);
  };

  const confirmarInactivar = async () => {
    if (!productoInactivar) return;
    setGuardandoInactivar(true);
    setErrorInactivar(null);
    try {
      const res = await fetch(`/api/productos/${productoInactivar.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "inactivar" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);

      setProductos(prev =>
        prev.map(p => p.id === productoInactivar.id ? { ...p, estados: "inactivo" } : p)
      );

      cerrarInactivar();
    } catch (e: any) {
      setErrorInactivar(e?.message ?? "Error al descontinuar el producto");
    } finally {
      setGuardandoInactivar(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* MODAL: Ver */}
      {modalVerAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-xs relative">
            <button onClick={cerrarModalVer} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">✕</button>
            {productoVer ? (
              <>
                <h2 className="text-lg font-bold mb-4">Producto: {productoVer.nombre}</h2>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">Categoría:</span> {productoVer.categoria ?? "—"}</div>
                  <div><span className="font-semibold">Precio:</span> {MONEDA.format(productoVer.precio)}</div>
                  <div><span className="font-semibold">Stock:</span> {productoVer.stock}</div>
                  <div>
                    <span className="font-semibold">Estado:</span>{" "}
                    {(productoVer.estados ?? "").toLowerCase() === "inactivo"
                      ? "Inactivo"
                      : (productoVer.stock > 0 ? "Disponible" : "Agotado")}
                  </div>
                  <div><span className="font-semibold">Descripción:</span> {productoVer.descripcion ?? "—"}</div>
                  {productoVer.id_proveedor != null && <div><span className="font-semibold">Proveedor ID:</span> {productoVer.id_proveedor}</div>}
                  {productoVer.imagen && (
                    <div className="mt-2 relative w-full aspect-[4/3]">
                      <Image
                        src={productoVer.imagen}
                        alt={productoVer.nombre}
                        fill
                        className="rounded-lg object-contain"
                        sizes="(max-width: 768px) 100vw, 600px"
                        priority
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-xl text-gray-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Inactivar (Descontinuar) */}
      {modalInactivarAbierto && productoInactivar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-sm relative">
            <button onClick={cerrarInactivar} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">✕</button>
            <h2 className="text-lg font-bold mb-2">Descontinuar producto</h2>
            <p className="text-sm text-gray-600 mb-4">
              Estás a punto de marcar como <span className="font-semibold">inactivo</span> el producto:
            </p>
            <div className="rounded-lg border border-gray-200 p-3 text-sm mb-3">
              <div><span className="font-semibold">Nombre:</span> {productoInactivar.nombre}</div>
              <div><span className="font-semibold">Stock:</span> {productoInactivar.stock}</div>
              {(productoInactivar.estados ?? "").toLowerCase() === "inactivo" && (
                <div className="mt-1 text-xs text-orange-600">Este producto ya está inactivo.</div>
              )}
            </div>

            {productoInactivar.stock > 0 && (
              <div className="mb-3 rounded-md bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-sm">
                <span className="font-medium">Advertencia:</span> estás descontinuando un producto que aún tiene stock.
                No se eliminará, pero dejará de estar disponible para ventas.
              </div>
            )}

            {errorInactivar && <div className="mb-2 text-sm text-red-600">{errorInactivar}</div>}

            <div className="flex gap-2">
              <button
                onClick={confirmarInactivar}
                disabled={guardandoInactivar || (productoInactivar.estados ?? "").toLowerCase() === "inactivo"}
                className="flex-1 rounded bg-gray-900 text-white py-2 font-semibold hover:bg-black disabled:opacity-60"
              >
                {guardandoInactivar ? "Guardando…" : "Sí, descontinuar"}
              </button>
              <button
                onClick={cerrarInactivar}
                className="flex-1 rounded border border-gray-300 py-2 font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de productos</h1>
        </header>

        {/* Filtros */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, categoría, precio, stock…"
              className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm shadow-sm outline-none ring-0 focus:border-gray-300 focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-6 py-3 font-semibold">Producto</th>
                  <th className="px-6 py-3 font-semibold">Categoría</th>
                  <th className="px-6 py-3 font-semibold">Precio</th>
                  <th className="px-6 py-3 font-semibold">Stock</th>
                  <th className="px-6 py-3 font-semibold">Estado</th>
                  <th className="px-6 py-3 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cargando && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-xl text-gray-500" />
                        <span>Cargando…</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!cargando && error && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-red-600">{error}</td>
                  </tr>
                )}

                {!cargando && !error && filtrados.map((p) => {
                  const inactivo = (p.estados ?? "").toLowerCase() === "inactivo";
                  const disponible = !inactivo && p.stock > 0;
                  const estadoTexto = inactivo ? "Inactivo" : (p.stock > 0 ? "Disponible" : "Agotado");
                  const estadoClass = inactivo
                    ? "bg-gray-100 text-gray-600 ring-gray-200"
                    : (p.stock > 0 ? "bg-green-50 text-green-700 ring-green-200" : "bg-gray-50 text-gray-600 ring-gray-200");

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-3">{p.nombre}</td>
                      <td className="px-6 py-3">{p.categoria ?? "Sin categoría"}</td>
                      <td className="px-6 py-3">{MONEDA.format(p.precio)}</td>
                      <td className="px-6 py-3">{p.stock}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${estadoClass}`}>
                          {estadoTexto}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Ver */}
                          <button
                            title="Ver más información"
                            onClick={() => verProducto(p)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-100"
                          >
                            <Eye />
                          </button>

                          <button
                            title={inactivo ? "Producto inactivo" : "Solicitar pedido"}

                            disabled={inactivo}
                            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <FaClipboardCheck className="h-4 w-4" />
                          </button>

                          {/* Descontinuar (inactivar) */}
                          <button
                            title={inactivo ? "Ya está inactivo" : "Descontinuar (inactivar)"}
                            onClick={() => abrirInactivar(p)}
                            disabled={inactivo}
                            className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <FaBan className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!cargando && !error && filtrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No hay productos para “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!cargando && !error && (
          <p className="text-sm text-gray-500">
            Mostrando <span className="font-medium">{filtrados.length}</span> de{" "}
            <span className="font-medium">{productos.length}</span> productos
          </p>
        )}
      </div>
    </main>
  );
}