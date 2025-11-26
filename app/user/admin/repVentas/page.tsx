"use client";

import * as React from "react";
import { FaBoxOpen, FaUserTie, FaUsers, FaDollarSign } from "react-icons/fa";

type DetallePedido = {
  id: number;
  productoId: number;
  cantidad: number;
  precioProducto: number;
  subtotal: number;
  idUsuario: number | null;
  idVendedor: number | null;
  fechaPago: string | null;
  estado: string | null;
};

type Producto = {
  id: number;
  nombre: string;
  categoria: string | null;
};

type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
};

type Vendedor = {
  id: number;
  estado: string | null;
};

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("es-PE");

export default function AdminReporteVentasPage() {
  const [detallePedidos, setDetallePedidos] = React.useState<DetallePedido[]>([]);
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [vendedores, setVendedores] = React.useState<Vendedor[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        setCargando(true);
        setError(null);
        const [detalleRes, productosRes, usuariosRes, vendedoresRes] = await Promise.all([
          fetch("/api/Detallepedido", { cache: "no-store" }),
          fetch("/api/productos", { cache: "no-store" }),
          fetch("/api/usuarios", { cache: "no-store" }),
          fetch("/api/vendedores", { cache: "no-store" }),
        ]);

        if (!detalleRes.ok) throw new Error("No fue posible obtener las ventas");
        if (!productosRes.ok) throw new Error("No fue posible obtener los productos");
        if (!usuariosRes.ok) throw new Error("No fue posible obtener los usuarios");
        if (!vendedoresRes.ok) throw new Error("No fue posible obtener los vendedores");

        const [detalleJson, productosJson, usuariosJson, vendedoresJson] = await Promise.all([
          detalleRes.json(),
          productosRes.json(),
          usuariosRes.json(),
          vendedoresRes.json(),
        ]);

        if (!detalleJson?.ok) throw new Error(detalleJson?.error ?? "Ventas no disponibles");
        if (!productosJson?.ok) throw new Error(productosJson?.error ?? "Productos no disponibles");
        if (!usuariosJson?.ok) throw new Error(usuariosJson?.error ?? "Usuarios no disponibles");
        if (!vendedoresJson?.ok) throw new Error(vendedoresJson?.error ?? "Vendedores no disponibles");

        if (cancelado) return;
        setDetallePedidos(
          Array.isArray(detalleJson.data)
            ? detalleJson.data.map((item: any) => ({
                id: Number(item.id),
                productoId: Number(item.productoId),
                cantidad: Number(item.cantidad),
                precioProducto: Number(item.precioProducto ?? 0),
                subtotal: Number(item.subtotal ?? Number(item.precioProducto ?? 0) * Number(item.cantidad ?? 0)),
                idUsuario: item.idUsuario === null ? null : Number(item.idUsuario),
                idVendedor: item.idVendedor === null ? null : Number(item.idVendedor),
                fechaPago: typeof item.fechaPago === "string" ? item.fechaPago : null,
                estado: typeof item.estado === "string" ? item.estado : null,
              }))
            : []
        );
        setProductos(
          Array.isArray(productosJson.data)
            ? productosJson.data.map((prod: any) => ({
                id: Number(prod.id),
                nombre: prod.nombre ?? `Producto #${prod.id}`,
                categoria: typeof prod.categoria === "string" ? prod.categoria : null,
              }))
            : []
        );
        setUsuarios(
          Array.isArray(usuariosJson.data)
            ? usuariosJson.data.map((user: any) => ({
                id: Number(user.id),
                nombre: user.nombre ?? "",
                apellido: user.apellido ?? "",
              }))
            : []
        );
        setVendedores(
          Array.isArray(vendedoresJson.data)
            ? vendedoresJson.data.map((vend: any) => ({
                id: Number(vend.id),
                estado: typeof vend.estado === "string" ? vend.estado : null,
              }))
            : []
        );
      } catch (e: any) {
        if (!cancelado) {
          setError(e?.message ?? "Error al cargar el reporte");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const productosPorId = React.useMemo(() => {
    const map = new Map<number, Producto>();
    productos.forEach((producto) => map.set(producto.id, producto));
    return map;
  }, [productos]);

  const usuariosPorId = React.useMemo(() => {
    const map = new Map<number, Usuario>();
    usuarios.forEach((usuario) => map.set(usuario.id, usuario));
    return map;
  }, [usuarios]);

  const vendedoresPorId = React.useMemo(() => {
    const map = new Map<number, Vendedor>();
    vendedores.forEach((vendedor) => map.set(vendedor.id, vendedor));
    return map;
  }, [vendedores]);

  const totalIngresos = React.useMemo(
    () => detallePedidos.reduce((acc, det) => acc + (Number.isFinite(det.subtotal) ? det.subtotal : 0), 0),
    [detallePedidos]
  );

  const totalUnidadesVendidas = React.useMemo(
    () => detallePedidos.reduce((acc, det) => acc + (Number.isFinite(det.cantidad) ? det.cantidad : 0), 0),
    [detallePedidos]
  );

  const ventasPorProducto = React.useMemo(() => {
    const map = new Map<
      number,
      { id: number; nombre: string; categoria: string | null; unidades: number; ingresos: number }
    >();
    detallePedidos.forEach((detalle) => {
      const producto = productosPorId.get(detalle.productoId);
      const ingreso = Number.isFinite(detalle.subtotal)
        ? detalle.subtotal
        : detalle.cantidad * detalle.precioProducto;
      const registro = map.get(detalle.productoId) ?? {
        id: detalle.productoId,
        nombre: producto?.nombre ?? `Producto #${detalle.productoId}`,
        categoria: producto?.categoria ?? null,
        unidades: 0,
        ingresos: 0,
      };
      registro.unidades += Number.isFinite(detalle.cantidad) ? detalle.cantidad : 0;
      registro.ingresos += Number.isFinite(ingreso) ? ingreso : 0;
      map.set(detalle.productoId, registro);
    });
    return Array.from(map.values()).sort((a, b) => b.ingresos - a.ingresos);
  }, [detallePedidos, productosPorId]);

  const ventasPorUsuario = React.useMemo(() => {
    const map = new Map<
      string,
      { id: string; nombre: string; compras: number; unidades: number; ingresos: number }
    >();

    detallePedidos.forEach((detalle) => {
      const key = detalle.idUsuario === null ? "sin-usuario" : String(detalle.idUsuario);
      const usuario = detalle.idUsuario === null ? null : usuariosPorId.get(detalle.idUsuario);
      const nombre =
        usuario && (usuario.nombre || usuario.apellido)
          ? `${usuario.nombre} ${usuario.apellido}`.trim()
          : detalle.idUsuario === null
          ? "Venta sin usuario"
          : `Usuario #${detalle.idUsuario}`;
      const registro = map.get(key) ?? {
        id: key,
        nombre,
        compras: 0,
        unidades: 0,
        ingresos: 0,
      };
      registro.compras += 1;
      registro.unidades += Number.isFinite(detalle.cantidad) ? detalle.cantidad : 0;
      const ingreso = Number.isFinite(detalle.subtotal)
        ? detalle.subtotal
        : detalle.cantidad * detalle.precioProducto;
      registro.ingresos += Number.isFinite(ingreso) ? ingreso : 0;
      map.set(key, registro);
    });

    return Array.from(map.values()).sort((a, b) => b.ingresos - a.ingresos);
  }, [detallePedidos, usuariosPorId]);

  const ventasPorVendedor = React.useMemo(() => {
    const map = new Map<
      string,
      { id: string; nombre: string; estado: string; operaciones: number; ingresos: number }
    >();

    detallePedidos.forEach((detalle) => {
      const key = detalle.idVendedor === null ? "sin-vendedor" : String(detalle.idVendedor);
      const vendedor = detalle.idVendedor === null ? null : vendedoresPorId.get(detalle.idVendedor);
      const nombre = detalle.idVendedor === null ? "Sin vendedor asignado" : `Vendedor #${detalle.idVendedor}`;
      const estado = vendedor?.estado ?? "Activo";
      const registro = map.get(key) ?? {
        id: key,
        nombre,
        estado,
        operaciones: 0,
        ingresos: 0,
      };
      registro.operaciones += 1;
      const ingreso = Number.isFinite(detalle.subtotal)
        ? detalle.subtotal
        : detalle.cantidad * detalle.precioProducto;
      registro.ingresos += Number.isFinite(ingreso) ? ingreso : 0;
      map.set(key, registro);
    });

    return Array.from(map.values()).sort((a, b) => b.ingresos - a.ingresos);
  }, [detallePedidos, vendedoresPorId]);

  const tarjetasResumen = [
    {
      titulo: "Total facturado",
      valor: currencyFormatter.format(totalIngresos),
      icono: <FaDollarSign className="h-6 w-6 text-emerald-500" />,
    },
    {
      titulo: "Unidades vendidas",
      valor: numberFormatter.format(totalUnidadesVendidas),
      icono: <FaBoxOpen className="h-6 w-6 text-indigo-500" />,
    },
    {
      titulo: "Productos con ventas",
      valor: numberFormatter.format(ventasPorProducto.length),
      icono: <FaUsers className="h-6 w-6 text-amber-500" />,
    },
    {
      titulo: "Vendedores activos",
      valor: numberFormatter.format(
        ventasPorVendedor.filter((vend) => vend.id !== "sin-vendedor").length
      ),
      icono: <FaUserTie className="h-6 w-6 text-sky-500" />,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">Panel administrativo</p>
          <h1 className="text-3xl font-bold text-gray-900">Reporte de ventas</h1>
          <p className="text-sm text-gray-600">
            Visualiza el comportamiento de las ventas por producto, clientes y vendedores para tomar decisiones.
          </p>
        </header>

        {cargando ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            Cargando resumen de ventas...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : detallePedidos.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No hay ventas registradas por el momento.
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {tarjetasResumen.map((tarjeta) => (
                <div key={tarjeta.titulo} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{tarjeta.titulo}</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">{tarjeta.valor}</p>
                    </div>
                    <span className="rounded-full bg-gray-50 p-3">{tarjeta.icono}</span>
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Ventas por producto</h2>
                  <p className="text-sm text-gray-500">Detalle de los articulos mas vendidos.</p>
                </div>
                <span className="text-xs font-semibold uppercase text-gray-400">
                  {ventasPorProducto.length} registros
                </span>
              </header>
              {ventasPorProducto.length === 0 ? (
                <p className="text-sm text-gray-500">No hay productos con ventas registradas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-gray-700">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                        <th className="py-2 pr-4">Producto</th>
                        <th className="py-2 pr-4">Categoria</th>
                        <th className="py-2 pr-4 text-right">Unidades</th>
                        <th className="py-2 text-right">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasPorProducto.map((producto) => (
                        <tr key={producto.id} className="border-b border-gray-50 last:border-none">
                          <td className="py-3 pr-4 font-medium text-gray-900">{producto.nombre}</td>
                          <td className="py-3 pr-4 text-gray-500">{producto.categoria ?? "Sin categoria"}</td>
                          <td className="py-3 pr-4 text-right font-semibold">
                            {numberFormatter.format(producto.unidades)}
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {currencyFormatter.format(producto.ingresos)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <header className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Ventas por usuario</h2>
                    <p className="text-sm text-gray-500">Clientes recurrentes y sus compras.</p>
                  </div>
                  <span className="text-xs font-semibold uppercase text-gray-400">
                    {ventasPorUsuario.length} usuarios
                  </span>
                </header>
                {ventasPorUsuario.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay ventas asociadas a usuarios.</p>
                ) : (
                  <ul className="space-y-3">
                    {ventasPorUsuario.slice(0, 8).map((usuario) => (
                      <li
                        key={usuario.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{usuario.nombre}</p>
                          <p className="text-xs text-gray-500">
                            {usuario.compras} operaciones | {numberFormatter.format(usuario.unidades)} unidades
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-emerald-600">
                          {currencyFormatter.format(usuario.ingresos)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <header className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Ventas por vendedor</h2>
                    <p className="text-sm text-gray-500">Rendimiento del equipo comercial.</p>
                  </div>
                  <span className="text-xs font-semibold uppercase text-gray-400">
                    {ventasPorVendedor.length} vendedores
                  </span>
                </header>
                {ventasPorVendedor.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay vendedores asociados a las ventas.</p>
                ) : (
                  <ul className="space-y-3">
                    {ventasPorVendedor.slice(0, 8).map((vendedor) => (
                      <li
                        key={vendedor.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{vendedor.nombre}</p>
                          <p className="text-xs text-gray-500">
                            {vendedor.operaciones} operaciones | Estado: {vendedor.estado}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-sky-600">
                          {currencyFormatter.format(vendedor.ingresos)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
