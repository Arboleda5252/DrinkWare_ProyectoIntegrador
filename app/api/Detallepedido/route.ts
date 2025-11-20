import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/libs/database";

export const runtime = "nodejs";

type DetallePedidoRow = {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioProducto: number;
  subtotal: number;
};

const baseSelect = `
  SELECT
    iddetallepedido AS id,
    id_pedido AS "pedidoId",
    id_producto AS "productoId",
    cantidad,
    precioproducto AS "precioProducto",
    subtotal
  FROM public.detallepedido
`;

const toDto = (row: DetallePedidoRow) => ({
  id: row.id,
  pedidoId: row.pedidoId,
  productoId: row.productoId,
  cantidad: row.cantidad,
  precioProducto: Number(row.precioProducto),
  subtotal: Number(row.subtotal),
});

export async function GET() {
  try {
    const { rows } = await sql<DetallePedidoRow>(`${baseSelect} ORDER BY iddetallepedido DESC;`);
    return NextResponse.json({ ok: true, data: rows.map(toDto) });
  } catch (error) {
    console.error("[GET /api/Detallepedido]", error);
    return NextResponse.json(
      { ok: false, error: "Error al listar detalle de pedidos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const pedidoId = Number(
      body?.pedidoId ?? body?.id_pedido ?? body?.idPedido ?? body?.idpedido
    );
    const productoId = Number(
      body?.productoId ?? body?.id_producto ?? body?.idProducto ?? body?.idproducto
    );
    const cantidad = Number(body?.cantidad);
    const precioProducto = Number(
      body?.precioProducto ?? body?.precioproducto ?? body?.precio_producto ?? body?.precio
    );
    const subtotalInput = body?.subtotal;
    const subtotal =
      subtotalInput !== undefined && subtotalInput !== null
        ? Number(subtotalInput)
        : cantidad * precioProducto;

    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
      return NextResponse.json(
        { ok: false, error: "id_pedido debe ser un entero positivo" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(productoId) || productoId <= 0) {
      return NextResponse.json(
        { ok: false, error: "id_producto debe ser un entero positivo" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return NextResponse.json(
        { ok: false, error: "cantidad debe ser un entero positivo" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(precioProducto) || precioProducto < 0) {
      return NextResponse.json(
        { ok: false, error: "precioproducto debe ser un numero valido" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json(
        { ok: false, error: "subtotal debe ser un numero valido" },
        { status: 400 }
      );
    }

    const { rows } = await sql<DetallePedidoRow>(
      `
        INSERT INTO public.detallepedido
          (id_pedido, id_producto, cantidad, precioproducto, subtotal)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          iddetallepedido AS id,
          id_pedido AS "pedidoId",
          id_producto AS "productoId",
          cantidad,
          precioproducto AS "precioProducto",
          subtotal;
      `,
      [pedidoId, productoId, cantidad, precioProducto, subtotal]
    );

    return NextResponse.json({ ok: true, data: toDto(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/Detallepedido]", error);
    return NextResponse.json(
      { ok: false, error: "Error al crear detalle de pedido" },
      { status: 500 }
    );
  }
}
