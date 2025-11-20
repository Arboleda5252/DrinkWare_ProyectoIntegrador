import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/libs/database";

export const runtime = "nodejs";

type Params = { params: { id: string } };

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

const selectById = `${baseSelect} WHERE iddetallepedido = $1;`;

const toDto = (row: DetallePedidoRow) => ({
  id: row.id,
  pedidoId: row.pedidoId,
  productoId: row.productoId,
  cantidad: row.cantidad,
  precioProducto: Number(row.precioProducto),
  subtotal: Number(row.subtotal),
});

export async function GET(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "ID invalido" }, { status: 400 });
  }

  try {
    const { rows } = await sql<DetallePedidoRow>(selectById, [id]);
    if (!rows[0]) {
      return NextResponse.json({ ok: false, error: "Detalle de pedido no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: toDto(rows[0]) });
  } catch (error) {
    console.error("[GET /api/Detallepedido/:id]", error);
    return NextResponse.json(
      { ok: false, error: "Error al obtener el detalle de pedido" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "ID invalido" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  const addUpdate = (column: string, value: any) => {
    updates.push(`${column} = $${index++}`);
    values.push(value);
  };

  const pedidoInput = body?.pedidoId ?? body?.id_pedido ?? body?.idPedido ?? body?.idpedido;
  if (pedidoInput !== undefined) {
    const pedidoId = Number(pedidoInput);
    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
      return NextResponse.json(
        { ok: false, error: "id_pedido debe ser un entero positivo" },
        { status: 400 }
      );
    }
    addUpdate("id_pedido", pedidoId);
  }

  const productoInput = body?.productoId ?? body?.id_producto ?? body?.idProducto ?? body?.idproducto;
  if (productoInput !== undefined) {
    const productoId = Number(productoInput);
    if (!Number.isInteger(productoId) || productoId <= 0) {
      return NextResponse.json(
        { ok: false, error: "id_producto debe ser un entero positivo" },
        { status: 400 }
      );
    }
    addUpdate("id_producto", productoId);
  }

  let cantidadValor: number | undefined;
  if (body?.cantidad !== undefined) {
    const cantidad = Number(body.cantidad);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return NextResponse.json(
        { ok: false, error: "cantidad debe ser un entero positivo" },
        { status: 400 }
      );
    }
    cantidadValor = cantidad;
    addUpdate("cantidad", cantidad);
  }

  let precioValor: number | undefined;
  const precioInput = body?.precioProducto ?? body?.precioproducto ?? body?.precio_producto ?? body?.precio;
  if (precioInput !== undefined) {
    const precio = Number(precioInput);
    if (!Number.isFinite(precio) || precio < 0) {
      return NextResponse.json(
        { ok: false, error: "precioproducto debe ser un numero valido" },
        { status: 400 }
      );
    }
    precioValor = precio;
    addUpdate("precioproducto", precio);
  }

  let subtotalValor: number | undefined;
  if (body?.subtotal !== undefined) {
    const subtotal = Number(body.subtotal);
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json(
        { ok: false, error: "subtotal debe ser un numero valido" },
        { status: 400 }
      );
    }
    subtotalValor = subtotal;
  } else if (cantidadValor !== undefined && precioValor !== undefined) {
    subtotalValor = cantidadValor * precioValor;
  }

  if (subtotalValor !== undefined) {
    addUpdate("subtotal", subtotalValor);
  }

  if (updates.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No hay campos validos para actualizar" },
      { status: 400 }
    );
  }

  values.push(id);

  try {
    const { rows } = await sql<DetallePedidoRow>(
      `
        UPDATE public.detallepedido
        SET ${updates.join(", ")}
        WHERE iddetallepedido = $${index}
        RETURNING
          iddetallepedido AS id,
          id_pedido AS "pedidoId",
          id_producto AS "productoId",
          cantidad,
          precioproducto AS "precioProducto",
          subtotal;
      `,
      values
    );

    if (!rows[0]) {
      return NextResponse.json({ ok: false, error: "Detalle de pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: toDto(rows[0]) });
  } catch (error) {
    console.error("[PUT /api/Detallepedido/:id]", error);
    return NextResponse.json(
      { ok: false, error: "Error al actualizar el detalle de pedido" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "ID invalido" }, { status: 400 });
  }

  try {
    const { rows } = await sql<{ id: number }>(
      `
        DELETE FROM public.detallepedido
        WHERE iddetallepedido = $1
        RETURNING iddetallepedido AS id;
      `,
      [id]
    );

    if (!rows[0]) {
      return NextResponse.json({ ok: false, error: "Detalle de pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: rows[0] });
  } catch (error) {
    console.error("[DELETE /api/Detallepedido/:id]", error);
    return NextResponse.json(
      { ok: false, error: "Error al eliminar el detalle de pedido" },
      { status: 500 }
    );
  }
}
