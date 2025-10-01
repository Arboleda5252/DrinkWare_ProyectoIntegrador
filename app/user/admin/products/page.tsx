"use client";

import * as React from "react";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  precio: number; // en COP
  stock: number;
};

const ICON = "h-4 w-4";
const Eye = () => (
  <svg className={ICON} viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const Pencil = () => (
  <svg className={ICON} viewBox="0 0 24 24" fill="none">
    <path d="M12 20h9" stroke="currentColor" strokeWidth="2" />
    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" strokeWidth="2" />
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

const DATA: Producto[] = [
  { id: "p1", nombre: "1/4 Ron Med", categoria: "Ron", precio: 20000, stock: 24 },
  { id: "p2", nombre: "1/2 Ron Med", categoria: "Ron", precio: 28000, stock: 12 },
  { id: "p3", nombre: "Litro Agt", categoria: "Aguardiente", precio: 60000, stock: 0 },
  { id: "p4", nombre: "1/4 Agt", categoria: "Aguardiente", precio: 17000, stock: 30 },
];

export default function ProductsPage() {
  const [query, setQuery] = React.useState("");
  const [categoria, setCategoria] = React.useState<string>("Todas");
  const [productos, setProductos] = React.useState<Producto[]>(DATA);

  const categorias = React.useMemo(
    () => ["Todas", ...Array.from(new Set(productos.map((p) => p.categoria)))],
    [productos]
  );

  const filtrados = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return productos.filter((p) => {
      const coincideTexto = q
        ? [p.nombre, p.categoria].join(" ").toLowerCase().includes(q)
        : true;
      const coincideCategoria = categoria === "Todas" ? true : p.categoria === categoria;
      return coincideTexto && coincideCategoria;
    });
  }, [productos, query, categoria]);

  const verProducto = (p: Producto) => {
    const estado = p.stock > 0 ? "Disponible" : "Agotado";
    alert(
      `Producto: ${p.nombre}\nCategoría: ${p.categoria}\nPrecio: ${MONEDA.format(
        p.precio
      )}\nStock: ${p.stock}\nEstado: ${estado}`
    );
  };

  const editarProducto = (p: Producto) => {
    alert(`Editar: ${p.nombre}`);
    // Aquí podrías navegar a /productos/[id]/editar o abrir un modal
  };

  const eliminarProducto = (p: Producto) => {
    if (confirm(`¿Eliminar "${p.nombre}"?`)) {
      setProductos((prev) => prev.filter((x) => x.id !== p.id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Título + CTA */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de productos</h1>
          <button
            onClick={() => alert("Abrir formulario de nuevo producto")}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black"
          >
            + Nuevo Producto
          </button>
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
              placeholder="Buscar producto…"
              className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm shadow-sm outline-none ring-0 focus:border-gray-300 focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
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
                {filtrados.map((p) => {
                  const disponible = p.stock > 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-3">{p.nombre}</td>
                      <td className="px-6 py-3">{p.categoria}</td>
                      <td className="px-6 py-3">{MONEDA.format(p.precio)}</td>
                      <td className="px-6 py-3">{p.stock}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            disponible
                              ? "bg-green-50 text-green-700 ring-green-200"
                              : "bg-gray-50 text-gray-600 ring-gray-200"
                          }`}
                        >
                          {disponible ? "Disponible" : "Agotado"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Ver más información"
                            onClick={() => verProducto(p)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-100"
                          >
                            <Eye />
                          </button>
                          <button
                            title="Actualizar / editar"
                            onClick={() => editarProducto(p)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-100"
                          >
                            <Pencil />
                          </button>
                          <button
                            title="Eliminar"
                            onClick={() => eliminarProducto(p)}
                            className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtrados.length === 0 && (
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

        {/* Pie */}
        <p className="text-sm text-gray-500">
          Mostrando <span className="font-medium">{filtrados.length}</span> de{" "}
          <span className="font-medium">{productos.length}</span> productos
        </p>
      </div>
    </main>
  );
}