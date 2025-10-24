import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/libs/database';

export const runtime = 'nodejs';

type ProductoListado = {
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
        p.pedidos AS pedidos,
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

export async function POST(req: NextRequest) {
  try {
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
    const pedidosEntrada = body?.pedidos;
    const estados =
      typeof body?.estados === 'string' && body.estados.trim()
        ? body.estados.trim()
        : 'Disponible';

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

    if (pedidosEntrada !== undefined && typeof pedidosEntrada !== 'boolean') {
      return NextResponse.json(
        { ok: false, error: 'Los pedidos deben ser un valor booleano' },
        { status: 400 }
      );
    }

    const pedidos = typeof pedidosEntrada === 'boolean' ? pedidosEntrada : false;

    const { rows } = await sql<ProductoListado>(`
      INSERT INTO public.producto
        (nombre, categoria, precio, stock, imagen, descripcion, id_proveedor, pedidos, estados)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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

    return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
}




