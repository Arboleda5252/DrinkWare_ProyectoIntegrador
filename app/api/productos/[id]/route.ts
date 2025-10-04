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

    const { rows } = await sql<{ id: number; estados: string }>(`
      UPDATE public.producto
      SET estados = 'inactivo'
      WHERE idproducto = $1
      RETURNING idproducto AS id, estados;
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error al descontinuar producto" }, { status: 500 });
  }
}