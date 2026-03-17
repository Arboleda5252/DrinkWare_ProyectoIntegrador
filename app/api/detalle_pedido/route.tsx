import { NextResponse } from "next/server";
import { sql } from "@/app/libs/database";

export const runtime = "nodejs";

type DetallePedidoRow = {
  idDetallePedido: number;
  idPedido: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number | string;
  subtotal: number | string | null;
};

const baseSelect = `
  SELECT
    id_detalle_pedido AS "idDetallePedido",
    id_pedido AS "idPedido",
    id_producto AS "idProducto",
    cantidad,
    precio_unitario AS "precioUnitario",
    subtotal
  FROM public.detalle_pedido
`;

const toDto = (row: DetallePedidoRow) => ({
  idDetallePedido: Number(row.idDetallePedido),
  idPedido: Number(row.idPedido),
  idProducto: Number(row.idProducto),
  cantidad: Number(row.cantidad),
  precioUnitario: Number(row.precioUnitario),
  subtotal: row.subtotal === null ? null : Number(row.subtotal),
});

export async function GET() {
  try {
    const { rows } = await sql<DetallePedidoRow>(
      `${baseSelect} ORDER BY id_detalle_pedido DESC;`
    );

    return NextResponse.json({ ok: true, data: rows.map(toDto) });
  } catch (error) {
    console.error("[GET /api/detalle_pedido]", error);
    return NextResponse.json(
      { ok: false, error: "Error al listar detalle_pedido" },
      { status: 500 }
    );
  }
}
