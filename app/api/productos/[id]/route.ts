import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/libs/database';

export const runtime = 'nodejs';

type ProductoDetalle = {
  id: number;
  nombre: string;
  categoria: string | null;
  precio: number;
  stock: number;
  imagen: string | null;
  descripcion: string | null;
  id_proveedor: number | null;
  pedidos: boolean;
  estados: string | null;
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { rows } = await sql<ProductoDetalle>(`
      SELECT
        p.idproducto AS id,
        p.nombre,
        p.categoria,
        p.precio::double precision AS precio,
        p.stock::int AS stock,
        p.imagen,
        p.descripcion,
        p.id_proveedor,
        p.pedidos AS pedidos,
        p.estados
      FROM public.producto AS p
      WHERE p.idproducto = $1
      LIMIT 1;
    `, [Number(params.id)]);

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: 'Error al obtener el producto' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    let accion = "inactivar";
    try {
      const body = await req.json();
      if (body && typeof body.accion === "string") {
        accion = body.accion.toLowerCase();
      }
    } catch {
      // Si no hay cuerpo o es inválido, se mantiene la acción por defecto.
    }

    if (accion === "solicitar_pedido") {
      const { rows } = await sql<{ id: number; pedidos: boolean }>(`
        UPDATE public.producto
        SET pedidos = TRUE
        WHERE idproducto = $1
        RETURNING idproducto AS id, pedidos;
      `, [id]);

      if (rows.length === 0) {
        return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, data: rows[0] });
    }

    if (accion === "limpiar_pedido") {
      const { rows } = await sql<{ id: number; pedidos: boolean }>(`
        UPDATE public.producto
        SET pedidos = FALSE
        WHERE idproducto = $1
        RETURNING idproducto AS id, pedidos;
      `, [id]);

      if (rows.length === 0) {
        return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, data: rows[0] });
    }

    const estadoPorAccion: Record<string, string> = {
      inactivar: "Inactivo",
      activar: "Disponible",
    };

    const nuevoEstado = estadoPorAccion[accion];
    if (!nuevoEstado) {
      return NextResponse.json({ ok: false, error: "Acción inválida" }, { status: 400 });
    }

    const { rows } = await sql<{ id: number; estados: string }>(`
      UPDATE public.producto
      SET estados = $2
      WHERE idproducto = $1
      RETURNING idproducto AS id, estados;
    `, [id, nuevoEstado]);

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error al descontinuar producto" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { ok: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Cuerpo de la solicitud inválido' },
        { status: 400 }
      );
    }
    const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : '';
    const categoria =
      body?.categoria === null
        ? null
        : typeof body?.categoria === 'string'
        ? body.categoria.trim() || null
        : null;
    const precio = Number(body?.precio);
    const stock = Number(body?.stock);
    const imagen =
      body?.imagen === null
        ? null
        : typeof body?.imagen === 'string'
        ? body.imagen.trim() || null
        : null;
    const descripcion =
      body?.descripcion === null
        ? null
        : typeof body?.descripcion === 'string'
        ? body.descripcion.trim() || null
        : null;
    const idProveedor =
      body?.id_proveedor === null || body?.id_proveedor === undefined
        ? null
        : Number(body.id_proveedor);
    let pedidos: boolean | null = null;
    if (body?.pedidos !== undefined) {
      if (typeof body.pedidos !== 'boolean') {
        return NextResponse.json(
          { ok: false, error: 'Los pedidos deben ser un valor booleano' },
          { status: 400 }
        );
      }
      pedidos = body.pedidos;
    }
    const estados =
      body?.estados === undefined
        ? null
        : body?.estados === null
        ? null
        : typeof body.estados === 'string'
        ? body.estados.trim() || null
        : null;

    if (!nombre) {
      return NextResponse.json(
        { ok: false, error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(precio) || precio < 0) {
      return NextResponse.json(
        { ok: false, error: 'El precio debe ser un número válido' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { ok: false, error: 'El stock debe ser un número entero válido' },
        { status: 400 }
      );
    }

    if (
      idProveedor !== null &&
      (!Number.isInteger(idProveedor) || idProveedor <= 0)
    ) {
      return NextResponse.json(
        { ok: false, error: 'El proveedor debe ser un número entero válido' },
        { status: 400 }
      );
    }

    const { rows } = await sql<ProductoDetalle>(`
      UPDATE public.producto
      SET
        nombre = $2,
        categoria = $3,
        precio = $4,
        stock = $5,
        imagen = $6,
        descripcion = $7,
        id_proveedor = $8,
        pedidos = COALESCE($9, pedidos),
        estados = COALESCE($10, estados)
      WHERE idproducto = $1
      RETURNING
        idproducto AS id,
        nombre,
        categoria,
        precio::double precision AS precio,
        stock::int AS stock,
        imagen,
        descripcion,
        id_proveedor,
        pedidos AS pedidos,
        estados;
    `, [
      id,
      nombre,
      categoria,
      precio,
      stock,
      imagen,
      descripcion,
      idProveedor,
      pedidos,
      estados,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}
