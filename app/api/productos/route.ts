import { NextResponse } from 'next/server';
import { sql } from '@/app/libs/database';

export const runtime = 'nodejs';

type ProductoListado = {
  id: number;
  nombre: string;
  categoria: string | null;
  precio: number;        // ver nota sobre el CAST
  stock: number;
  imagen: string | null;
  descripcion: string | null;
  id_proveedor: number | null;
  estados: string | null; // ajusta a boolean/number según tu esquema real
};

export async function GET() {
  try {
    const { rows } = await sql<ProductoListado>(`
      SELECT
        p.idproducto AS id,
        p.nombre,
        p.categoria,
        p.precio::double precision AS precio, -- CAST para obtener number en pg
        p.stock::int AS stock,
        p.imagen,
        p.descripcion,
        p.id_proveedor,
        p.estados
      FROM public.producto AS p
      ORDER BY p.nombre;
    `);

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: 'Error al listar productos' },
      { status: 500 }
    );
  }
}