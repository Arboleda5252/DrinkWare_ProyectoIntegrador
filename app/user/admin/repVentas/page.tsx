"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type SaleRecord = {
  id: number;
  productoId: number;
  cantidad: number;
  precioProducto: number;
  subtotal: number;
  idVendedor: number | null;
  fechaPago: string | null;
  estado: string | null;
  nombreCliente: string | null;
};

type VendorLookup = Record<number, string>;
type ProductInfo = { name: string; price: number };
type ProductLookup = Record<number, ProductInfo>;

const formatCurrency = (value: number) => `$${value.toLocaleString("es-CO")}`;

const formatDateTime = (value: string | null) => {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Sin fecha";
  return parsed.toLocaleString("es-CO");
};

const saleSubtotal = (sale: SaleRecord) => {
  const subtotal = Number(sale.subtotal);
  return Number.isFinite(subtotal) && subtotal > 0
    ? subtotal
    : sale.cantidad * sale.precioProducto;
};

async function fetchLookup<T>(
  ids: number[],
  buildUrl: (id: number) => string,
  parse: (payload: any, id: number) => T | null
): Promise<Record<number, T>> {
  if (ids.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(buildUrl(id), { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const payload = await res.json().catch(() => null);
        const parsed = parse(payload, id);
        return parsed ? ([id, parsed] as const) : null;
      } catch {
        return null;
      }
    })
  );

  return entries.reduce<Record<number, T>>((acc, entry) => {
    if (entry) {
      acc[entry[0]] = entry[1];
    }
    return acc;
  }, {});
}

export default function ReporteVentasPage() {
  const [ventas, setVentas] = useState<SaleRecord[]>([]);
  const [vendedores, setVendedores] = useState<VendorLookup>({});
  const [productos, setProductos] = useState<ProductLookup>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<"all" | number>("all");

  const cargarReporte = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/Detallepedido", { cache: "no-store" });
      if (!res.ok) throw new Error("No fue posible obtener las ventas.");
      const payload = await res.json();
      const rawData: any[] = Array.isArray(payload?.data) ? payload.data : [];
      const confirmadas: SaleRecord[] = rawData
        .filter((item) => typeof item === "object" && item)
        .filter((item) => {
          const estado =
            typeof item.estado === "string"
              ? item.estado
              : typeof item.Estado === "string"
              ? item.Estado
              : "";
          return estado.toLowerCase() === "confirmado";
        })
        .map((item) => {
          const subtotal = Number(item.subtotal ?? 0);
          const productoId = Number(item.productoId ?? item.id_producto ?? 0);
          const cantidad = Number(item.cantidad ?? 0);
          const precioProducto = Number(item.precioProducto ?? item.precioproducto ?? 0);
          const idVendedor = item.idVendedor ?? item.idvendedor ?? null;
          return {
            id: Number(item.id ?? item.iddetallepedido ?? Date.now()),
            productoId,
            cantidad,
            precioProducto,
            subtotal,
            idVendedor:
              idVendedor === null || idVendedor === undefined ? null : Number(idVendedor),
            fechaPago: item.fechaPago ?? item.fechapago ?? null,
            estado: item.estado ?? null,
            nombreCliente: item.nombreCliente ?? item.nombre_cliente ?? null,
          };
        })
        .filter(
          (venta) =>
            Number.isFinite(venta.productoId) &&
            venta.productoId > 0 &&
            Number.isFinite(venta.cantidad) &&
            venta.cantidad > 0 &&
            Number.isFinite(venta.precioProducto)
        );

      const vendorIds = Array.from(
        new Set(
          confirmadas
            .map((venta) => venta.idVendedor)
            .filter((id): id is number => typeof id === "number" && id > 0)
        )
      );
      const productIds = Array.from(
        new Set(confirmadas.map((venta) => venta.productoId).filter((id) => id > 0))
      );

      const [vendorLookup, productLookup] = await Promise.all([
        fetchLookup<string>(vendorIds, (id) => `/api/usuarios/${id}`, (json, id) => {
          const data = json?.data ?? json;
          if (!data) return `Vendedor #${id}`;
          const fullName = `${data.nombre ?? ""} ${data.apellido ?? ""}`.trim();
          return fullName || data.nombreusuario || `Vendedor #${id}`;
        }),
        fetchLookup<ProductInfo>(productIds, (id) => `/api/productos/${id}`, (json, id) => {
          const data = json?.data ?? json;
          if (!data) {
            return { name: `Producto #${id}`, price: 0 };
          }
          const name = data.nombre ?? data.name ?? `Producto #${id}`;
          const price = Number(data.precio ?? data.price ?? 0);
          return { name: name || `Producto #${id}`, price: Number.isFinite(price) ? price : 0 };
        }),
      ]);

      setVentas(confirmadas);
      setVendedores(vendorLookup);
      setProductos(productLookup);
      setLastUpdated(new Date());
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Error al cargar las ventas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);


  const totalIngresos = useMemo(
    () => ventas.reduce((acc, venta) => acc + saleSubtotal(venta), 0),
    [ventas]
  );

  const totalUnidades = useMemo(
    () => ventas.reduce((acc, venta) => acc + venta.cantidad, 0),
    [ventas]
  );

  const ventasOrdenadas = useMemo(() => {
    return [...ventas].sort((a, b) => {
      const fechaA = a.fechaPago ? Date.parse(a.fechaPago) : 0;
      const fechaB = b.fechaPago ? Date.parse(b.fechaPago) : 0;
      return fechaB - fechaA;
    });
  }, [ventas]);

  const resumenPorVendedor = useMemo(() => {
    const mapa = new Map<
      number,
      { id: number; pedidos: number; unidades: number; ingresos: number }
    >();
    ventas.forEach((venta) => {
      const key = venta.idVendedor ?? 0;
      const registro = mapa.get(key) ?? { id: key, pedidos: 0, unidades: 0, ingresos: 0 };
      registro.pedidos += 1;
      registro.unidades += venta.cantidad;
      registro.ingresos += saleSubtotal(venta);
      mapa.set(key, registro);
    });
    return Array.from(mapa.values()).sort((a, b) => b.ingresos - a.ingresos);
  }, [ventas]);

  const resumenPorProducto = useMemo(() => {
    const mapa = new Map<
      number,
      { id: number; pedidos: number; unidades: number; ingresos: number }
    >();
    ventas.forEach((venta) => {
      const key = venta.productoId;
      const registro = mapa.get(key) ?? { id: key, pedidos: 0, unidades: 0, ingresos: 0 };
      registro.pedidos += 1;
      registro.unidades += venta.cantidad;
      registro.ingresos += saleSubtotal(venta);
      mapa.set(key, registro);
    });
    return Array.from(mapa.values()).sort((a, b) => b.ingresos - a.ingresos);
  }, [ventas]);

  const opcionesProducto = useMemo(() => {
    return resumenPorProducto.map((item) => ({
      id: item.id,
      name: productos[item.id]?.name ?? `Producto #${item.id}`,
    }));
  }, [resumenPorProducto, productos]);

  const resumenPorProductoFiltrado = useMemo(() => {
    if (productoSeleccionado === "all") {
      return resumenPorProducto;
    }
    return resumenPorProducto.filter((item) => item.id === productoSeleccionado);
  }, [resumenPorProducto, productoSeleccionado]);

  useEffect(() => {
    if (productoSeleccionado === "all") return;
    const exists = resumenPorProducto.some((item) => item.id === productoSeleccionado);
    if (!exists) {
      setProductoSeleccionado("all");
    }
  }, [resumenPorProducto, productoSeleccionado]);

  const sinDatos = !loading && ventas.length === 0;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Reporte de ventas</h1>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow">
            <header className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Ventas por vendedor</h2>
              </div>
            </header>
            {sinDatos ? (
              <p className="text-sm text-slate-500">No hay ventas registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Vendedor</th>
                      <th className="py-2 font-medium text-right">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resumenPorVendedor.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 pr-4 font-medium text-slate-800">
                          {item.id === 0
                            ? "Compra realizada por el usuario cliente"
                            : vendedores[item.id] ?? `Vendedor #${item.id}`}
                        </td>
                        <td className="py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(item.ingresos)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Ventas por producto</h2>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="producto-filter" className="text-slate-600">
                  Producto:
                </label>
                <select
                  id="producto-filter"
                  value={productoSeleccionado === "all" ? "all" : String(productoSeleccionado)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setProductoSeleccionado(value === "all" ? "all" : Number(value));
                  }}
                  disabled={sinDatos || opcionesProducto.length === 0}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="all">Todos</option>
                  {opcionesProducto.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </header>
            {sinDatos ? (
              <p className="text-sm text-slate-500">No hay ventas registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Producto</th>
                      <th className="py-2 pr-4 font-medium text-right">Pedidos</th>
                      <th className="py-2 pr-4 font-medium text-right">Unidades</th>
                      <th className="py-2 font-medium text-right">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resumenPorProductoFiltrado.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 pr-4 font-medium text-slate-800">
                          {productos[item.id]?.name ?? `Producto #${item.id}`}
                        </td>
                        <td className="py-3 pr-4 text-right text-slate-600">{item.pedidos}</td>
                        <td className="py-3 pr-4 text-right text-slate-600">{item.unidades}</td>
                        <td className="py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(item.ingresos)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Listado de ventas</h2>
            </div>
            <span className="text-xs text-slate-500">
              {ventasOrdenadas.length} registro(s)
            </span>
          </div>

          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Cargando ventas…</p>
          ) : sinDatos ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No hay ventas confirmadas para mostrar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Producto</th>
                    <th className="py-2 pr-4 font-medium">Vendedor</th>
                    <th className="py-2 pr-4 font-medium text-right">Cantidad</th>
                    <th className="py-2 pr-4 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ventasOrdenadas.map((venta) => (
                    <tr key={venta.id}>
                      <td className="py-3 pr-4 font-medium text-slate-800">
                        {productos[venta.productoId]?.name ?? `Producto #${venta.productoId}`}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {venta.idVendedor && venta.idVendedor > 0
                          ? vendedores[venta.idVendedor] ?? `Vendedor #${venta.idVendedor}`
                          : "Compra realizada por el usuario cliente"}
                      </td>
                      <td className="py-3 pr-4 text-right text-slate-600">{venta.cantidad}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-slate-900">
                        {formatCurrency(saleSubtotal(venta))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
