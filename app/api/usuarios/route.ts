import { NextResponse } from 'next/server';
import { sql } from '@/app/libs/database';

export const runtime = 'nodejs';

type UsuarioListado = {
  nombre: string;
  apellido: string;
  correo: string;     // viene de alias a email
  documento: string;
  rol: string | null; // null si no hay coincidencia en user_rol
};

export async function GET() {
  try {
    const { rows } = await sql<UsuarioListado>(`
      SELECT
        u.idusuario AS id,
        u.nombre,
        u.apellido,
        u.email AS correo,
        u.documento,
        r.rol
      FROM usuario AS u
      LEFT JOIN user_rol AS r ON r.id_rol = u.id_rol
      ORDER BY u.apellido, u.nombre;
    `);

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: 'Error al listar usuarios' },
      { status: 500 }
    );
  }
}
