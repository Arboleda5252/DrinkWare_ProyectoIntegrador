"use client";

import * as React from "react";
import { BiAngry } from "react-icons/bi";
import { MdWarningAmber } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

type Producto = {
  id: number;
  nombre: string;
  categoria: string | null;
  stock: number;
  estados: string | null;
};

type PedidoProveedor = {
  id: number;
  producto_id: number;
  cantidad: number;
  estado: string;
  descripcion: string | null;
  creado_en: string;
};

export default function AdminAlertasPage() {
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pedidosProveedor, setPedidosProveedor] = React.useState<PedidoProveedor[]>([]);
  const [errorPedidos, setErrorPedidos] = React.useState<string | null>(null);
  const [cargandoPedidos, setCargandoPedidos] = React.useState(true);

  React.useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        setCargando(true);
        setError(null);
        const res = await fetch("/api/productos", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error ?? "No fue posible obtener los productos");
        if (!cancelado) setProductos(json.data as Producto[]);
      } catch (e: any) {
        if (!cancelado) setError(e?.message ?? "Error al cargar notificaciones");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        setCargandoPedidos(true);
        setErrorPedidos(null);
        const res = await fetch("/api/productos/productosPedidos", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error ?? "No fue posible obtener los pedidos del proveedor");
        if (!cancelado) setPedidosProveedor(json.data as PedidoProveedor[]);
      } catch (e: any) {
        if (!cancelado) setErrorPedidos(e?.message ?? "Error al cargar las respuestas del proveedor");
      } finally {
        if (!cancelado) setCargandoPedidos(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const normalizarEstado = React.useCallback((estado?: string | null) => (estado ?? "").toLowerCase().trim(), []);

  const productosDisponibles = React.useMemo(
    () =>
      productos.filter((producto) => {
        const estado = normalizarEstado(producto.estados);
        if (!estado) return false;
        if (estado.includes("No Disponible")) return false;
        if (estado.includes("Inactivo")) return false;
        return estado.includes("Disponible");
      }),
    [productos, normalizarEstado]
  );

  const productosNoDisponibles = React.useMemo(
    () =>
      productos.filter((producto) => {
        const estado = normalizarEstado(producto.estados);
        return estado.includes("no disponible");
      }),
    [productos, normalizarEstado]
  );

  const agotados = React.useMemo(
    () => productosDisponibles.filter((producto) => Number(producto.stock) <= 0),
    [productosDisponibles]
  );

  const stockBajo = React.useMemo(
    () =>
      productosDisponibles.filter((producto) => Number(producto.stock) > 0 && Number(producto.stock) <= 12),
    [productosDisponibles]
  );

  const pedidosAceptados = React.useMemo(
    () => pedidosProveedor.filter((pedido) => (pedido.estado ?? "").toLowerCase() === "aceptado"),
    [pedidosProveedor]
  );

  const pedidosRechazados = React.useMemo(
    () => pedidosProveedor.filter((pedido) => (pedido.estado ?? "").toLowerCase() === "rechazado"),
    [pedidosProveedor]
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
        </header>

        {cargando && (
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            <FaSpinner className="h-4 w-4 animate-spin" />
            <span>Cargando notificaciones...</span>
          </div>
        )}

        {!cargando && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!cargando && !error && (
          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow">
              <div className="mb-3 flex items-center gap-2 text-yellow-600">
                <MdWarningAmber className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Productos con stock bajo</h2>
              </div>
              {stockBajo.length === 0 ? (
                <p className="text-sm text-gray-500">No hay productos con stock bajo</p>
              ) : (
                <ul className="space-y-3">
                  {stockBajo.map((producto) => (
                    <li
                      key={producto.id}
                      className="flex flex-col rounded-xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-sm text-yellow-900 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">
                          {producto.nombre}{" "}
                          <span className="text-xs font-medium text-gray-500">
                            {producto.categoria ?? "Sin categoría"}
                          </span>
                        </p>
                        <p className="text-xs text-yellow-800">
                          Stock actual: <strong>{producto.stock}</strong>. Considera solicitar al proveedor muy pronto.
                        </p>
                      </div>
                      <span className="mt-2 inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase text-yellow-700 sm:mt-0">
                        Atención
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow">
              <div className="mb-3 flex items-center gap-2 text-green-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
                  ✅
                </span>
                <h2 className="text-lg font-semibold">Pedidos aceptados por el proveedor</h2>
              </div>
              {cargandoPedidos ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  <span>Cargando respuestas...</span>
                </div>
              ) : errorPedidos ? (
                <p className="text-sm text-red-600">{errorPedidos}</p>
              ) : pedidosAceptados.length === 0 ? (
                <p className="text-sm text-gray-500">No hay pedidos aceptados recientemente.</p>
              ) : (
                <ul className="space-y-3">
                  {pedidosAceptados.map((pedido) => (
                    <li
                      key={pedido.id}
                      className="flex flex-col rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-900 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">
                          Pedido #{pedido.id} &middot; Cantidad solicitada: {pedido.cantidad}
                        </p>
                        <p className="text-xs text-green-800">
                          {pedido.descripcion
                            ? `Nota del proveedor: ${pedido.descripcion}`
                            : "El proveedor aceptó la solicitud y aumentará el stock."}
                        </p>
                      </div>
                      <span className="mt-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase text-green-700 sm:mt-0">
                        Aceptado
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow">
              <div className="mb-3 flex items-center gap-2 text-red-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700">
                  ❌
                </span>
                <h2 className="text-lg font-semibold">Pedidos rechazados por el proveedor</h2>
              </div>
              {cargandoPedidos ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  <span>Cargando respuestas...</span>
                </div>
              ) : errorPedidos ? (
                <p className="text-sm text-red-600">{errorPedidos}</p>
              ) : pedidosRechazados.length === 0 ? (
                <p className="text-sm text-gray-500">No hay pedidos rechazados.</p>
              ) : (
                <ul className="space-y-3">
                  {pedidosRechazados.map((pedido) => (
                    <li
                      key={pedido.id}
                      className="flex flex-col rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">
                          Pedido #{pedido.id} &middot; Cantidad solicitada: {pedido.cantidad}
                        </p>
                        <p className="text-xs text-red-800">
                          {pedido.descripcion
                            ? `Motivo: ${pedido.descripcion}`
                            : "El proveedor no puede surtir este pedido por ahora."}
                        </p>
                      </div>
                      <span className="mt-2 inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase text-red-700 sm:mt-0">
                        Rechazado
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow">
              <div className="mb-3 flex items-center gap-2 text-blue-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  🆕
                </span>
                <h2 className="text-lg font-semibold">Hay Productos nuevos para la venta</h2>
              </div>
              {productosNoDisponibles.length === 0 ? (
                <p className="text-sm text-gray-500">No hay nuevos productos</p>
              ) : (
                <ul className="space-y-3">
                  {productosNoDisponibles.map((producto) => (
                    <li
                      key={producto.id}
                      className="flex flex-col rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">
                          {producto.nombre}{" "}
                          <span className="text-xs font-medium text-gray-500">
                            {producto.categoria ?? "Sin categoría"}
                          </span>
                        </p>
                        <p className="text-xs text-blue-800">
                          Revisa si es necesario incorporarlo pronto a la tienda.
                        </p>
                      </div>
                      <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700 sm:mt-0">
                        Nuevo producto
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow">
              <div className="mb-3 flex items-center gap-2 text-red-600">
                <BiAngry className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Productos agotados</h2>
              </div>
              {agotados.length === 0 ? (
                <p className="text-sm text-gray-500">No hay productos agotados por el momento.</p>
              ) : (
                <ul className="space-y-3">
                  {agotados.map((producto) => (
                    <li
                      key={producto.id}
                      className="flex flex-col rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">
                          {producto.nombre}{" "}
                          <span className="text-xs font-medium text-gray-500">
                            {producto.categoria ?? "Sin categoría"}
                          </span>
                        </p>
                        <p className="text-xs text-red-800">
                          Sin stock disponible. Es necesario realizar un pedido inmediatamente.
                        </p>
                      </div>
                      <span className="mt-2 inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase text-red-700 sm:mt-0">
                        Agotado
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
