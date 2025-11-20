import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/libs/database";

export const runtime = "nodejs";

type Params = { params: { id: string } };

type PedidoRow = {
  id: number;
  usuarioId: number | null;
  vendedorId: number | null;
  total: number;
  fechaCreacion: Date | null;
  fechaPago: Date | null;
  estado: string | null;
  nombreCliente: string | null;
  direccionCliente: string | null;
  telefonoCliente: string | null;
};

const toPedidoDto = (row: PedidoRow) => ({
  id: row.id,
  usuarioId: row.usuarioId,
  vendedorId: row.vendedorId,
  total: row.total,
  fechaCreacion: row.fechaCreacion?.toISOString() ?? null,
  fechaPago: row.fechaPago?.toISOString() ?? null,
  estado: row.estado,
  nombreCliente: row.nombreCliente,
  direccionCliente: row.direccionCliente,
  telefonoCliente: row.telefonoCliente,
});

const selectById = `
  SELECT
    idpedido AS id,
    idusuario AS "usuarioId",
    idvendedor AS "vendedorId",
    total,
    fechacreacion AS "fechaCreacion",
    fechapago AS "fechaPago",
    estado,
    nombre_cliente AS "nombreCliente",
    direccion_cliente AS "direccionCliente",
    telefono_cliente AS "telefonoCliente"
  FROM public.pedido
  WHERE idpedido = $1;
`;

export async function GET(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }

  try {
    const { rows } = await sql<PedidoRow>(selectById, [id]);
    if (!rows[0]) {
      return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: toPedidoDto(rows[0]) });
  } catch (error) {
    console.error("[GET /api/pedidos/:id]", error);
    return NextResponse.json({ ok: false, error: "Error al obtener pedido" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
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

  if (body?.usuarioId !== undefined) {
    if (!Number.isInteger(body.usuarioId)) {
      return NextResponse.json(
        { ok: false, error: "usuarioId debe ser un entero válido" },
        { status: 400 }
      );
    }
    addUpdate("idusuario", body.usuarioId);
  }

  if (body?.vendedorId !== undefined) {
    if (body.vendedorId !== null && !Number.isInteger(body.vendedorId)) {
      return NextResponse.json(
        { ok: false, error: "vendedorId debe ser un entero válido" },
        { status: 400 }
      );
    }
    addUpdate("idvendedor", body.vendedorId);
  }

  if (body?.total !== undefined) {
    const total = Number(body.total);
    if (!Number.isFinite(total) || total < 0) {
      return NextResponse.json(
        { ok: false, error: "total debe ser un número válido" },
        { status: 400 }
      );
    }
    addUpdate("total", total);
  }

  if (body?.fechaPago !== undefined) {
    const fecha = body.fechaPago === null ? null : new Date(body.fechaPago);
    if (fecha !== null && Number.isNaN(fecha.getTime())) {
      return NextResponse.json(
        { ok: false, error: "fechaPago no es una fecha válida" },
        { status: 400 }
      );
    }
    addUpdate("fechapago", fecha);
  }

  if (body?.estado !== undefined) {
    if (typeof body.estado !== "string" || !body.estado.trim()) {
      return NextResponse.json(
        { ok: false, error: "estado debe ser un texto no vacío" },
        { status: 400 }
      );
    }
    addUpdate("estado", body.estado.trim());
  }

  if (body?.nombreCliente !== undefined) {
    if (typeof body.nombreCliente !== "string" || !body.nombreCliente.trim()) {
      return NextResponse.json(
        { ok: false, error: "nombreCliente debe ser un texto no vacío" },
        { status: 400 }
      );
    }
    addUpdate("nombre_cliente", body.nombreCliente.trim());
  }

  if (body?.direccionCliente !== undefined) {
    if (typeof body.direccionCliente !== "string" || !body.direccionCliente.trim()) {
      return NextResponse.json(
        { ok: false, error: "direccionCliente debe ser un texto no vacío" },
        { status: 400 }
      );
    }
    addUpdate("direccion_cliente", body.direccionCliente.trim());
  }

  if (body?.telefonoCliente !== undefined) {
    if (typeof body.telefonoCliente !== "string" || !body.telefonoCliente.trim()) {
      return NextResponse.json(
        { ok: false, error: "telefonoCliente debe ser un texto no vacío" },
        { status: 400 }
      );
    }
    addUpdate("telefono_cliente", body.telefonoCliente.trim());
  }

  if (updates.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No hay campos válidos para actualizar" },
      { status: 400 }
    );
  }

  values.push(id);

  try {
    const { rows } = await sql<PedidoRow>(
      `
        UPDATE public.pedido
        SET ${updates.join(", ")}
        WHERE idpedido = $${index}
        RETURNING
          idpedido AS id,
          idusuario AS "usuarioId",
          idvendedor AS "vendedorId",
          total,
          fechacreacion AS "fechaCreacion",
          fechapago AS "fechaPago",
          estado,
          nombre_cliente AS "nombreCliente",
          direccion_cliente AS "direccionCliente",
          telefono_cliente AS "telefonoCliente";
      `,
      values
    );

    if (!rows[0]) {
      return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: toPedidoDto(rows[0]) });
  } catch (error) {
    console.error("[PUT /api/pedidos/:id]", error);
    return NextResponse.json({ ok: false, error: "Error al actualizar pedido" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }

  try {
    const { rows } = await sql<{ id: number }>(
      `
        DELETE FROM public.pedido
        WHERE idpedido = $1
        RETURNING idpedido AS id;
      `,
      [id]
    );

    if (!rows[0]) {
      return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: rows[0] });
  } catch (error) {
    console.error("[DELETE /api/pedidos/:id]", error);
    return NextResponse.json({ ok: false, error: "Error al eliminar pedido" }, { status: 500 });
  }
}
