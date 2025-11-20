import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/libs/database";

export const runtime = "nodejs";

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

const selectQuery = `
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
`;

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

export async function GET() {
  try {
    const { rows } = await sql<PedidoRow>(`${selectQuery} ORDER BY fechacreacion DESC;`);
    return NextResponse.json({ ok: true, data: rows.map(toPedidoDto) });
  } catch (error) {
    console.error("[GET /api/pedidos]", error);
    return NextResponse.json({ ok: false, error: "Error al listar pedidos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const idusuario =
      body?.usuarioId ?? body?.idusuario ?? body?.idUsuario ?? body?.usuario_id ?? body?.userId;
    const idvendedor =
      body?.vendedorId ?? body?.idvendedor ?? body?.idVendedor ?? body?.vendedor_id ?? null;
    const total = Number(body?.total);
    const estado =
      typeof body?.estado === "string" && body.estado.trim() ? body.estado.trim() : "Pendiente";
    const nombreCliente =
      typeof body?.nombreCliente === "string" && body.nombreCliente.trim()
        ? body.nombreCliente.trim()
        : "";
    const direccionCliente =
      typeof body?.direccionCliente === "string" && body.direccionCliente.trim()
        ? body.direccionCliente.trim()
        : "";
    const telefonoCliente =
      typeof body?.telefonoCliente === "string" && body.telefonoCliente.trim()
        ? body.telefonoCliente.trim()
        : "";
    const fechaPago =
      typeof body?.fechaPago === "string" && body.fechaPago.trim()
        ? new Date(body.fechaPago)
        : null;

    if (!Number.isInteger(idusuario)) {
      return NextResponse.json(
        { ok: false, error: "usuarioId debe ser un entero válido" },
        { status: 400 }
      );
    }

    if (idvendedor !== null && !Number.isInteger(idvendedor)) {
      return NextResponse.json(
        { ok: false, error: "vendedorId debe ser un entero válido" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(total) || total < 0) {
      return NextResponse.json(
        { ok: false, error: "total debe ser un número válido" },
        { status: 400 }
      );
    }

    if (!nombreCliente || !direccionCliente || !telefonoCliente) {
      return NextResponse.json(
        { ok: false, error: "nombreCliente, direccionCliente y telefonoCliente son obligatorios" },
        { status: 400 }
      );
    }

    if (fechaPago && Number.isNaN(fechaPago.getTime())) {
      return NextResponse.json(
        { ok: false, error: "fechaPago no es una fecha válida" },
        { status: 400 }
      );
    }

    const { rows } = await sql<PedidoRow>(
      `
        INSERT INTO public.pedido
          (idusuario, idvendedor, total, fechacreacion, fechapago, estado, nombre_cliente, direccion_cliente, telefono_cliente)
        VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)
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
      [idusuario, idvendedor, total, fechaPago, estado, nombreCliente, direccionCliente, telefonoCliente]
    );

    return NextResponse.json({ ok: true, data: toPedidoDto(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/pedidos]", error);
    return NextResponse.json({ ok: false, error: "Error al crear pedido" }, { status: 500 });
  }
}
