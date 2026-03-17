import { NextResponse } from "next/server";
import { sql } from "@/app/libs/database";

export const runtime = "nodejs";

type PedidoRow = {
  idPedido: number;
  idCliente: number | null;
  idVendedor: number | null;
  fechaCreacion: string;
  tipoEntrega: string | null;
  estadoPedido: string | null;
  observacion: string | null;
  subtotal: number | string;
  costoEnvio: number | string;
  total: number | string;
};

const baseSelect = `
  SELECT
    id_pedido AS "idPedido",
    id_cliente AS "idCliente",
    id_vendedor AS "idVendedor",
    fecha_creacion AS "fechaCreacion",
    tipo_entrega AS "tipoEntrega",
    estado_pedido AS "estadoPedido",
    observacion,
    subtotal,
    costo_envio AS "costoEnvio",
    total
  FROM public.pedido
`;

const toDto = (row: PedidoRow) => ({
  idPedido: Number(row.idPedido),
  idCliente: row.idCliente === null ? null : Number(row.idCliente),
  idVendedor: row.idVendedor === null ? null : Number(row.idVendedor),
  fechaCreacion: row.fechaCreacion,
  tipoEntrega: row.tipoEntrega,
  estadoPedido: row.estadoPedido,
  observacion: row.observacion,
  subtotal: Number(row.subtotal),
  costoEnvio: Number(row.costoEnvio),
  total: Number(row.total),
});

export async function GET() {
  try {
    const { rows } = await sql<PedidoRow>(`${baseSelect} ORDER BY id_pedido DESC;`);
    return NextResponse.json({ ok: true, data: rows.map(toDto) });
  } catch (error) {
    console.error("[GET /api/pedidos]", error);
    return NextResponse.json(
      { ok: false, error: "Error al listar pedidos" },
      { status: 500 }
    );
  }
}
