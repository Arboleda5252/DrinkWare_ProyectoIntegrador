import { NextRequest } from 'next/server';
// Crear un nuevo usuario

import { NextResponse } from 'next/server';
import { sql } from '@/app/libs/database';

export const runtime = 'nodejs';

type UsuarioListado = {
  nombre: string;
  apellido: string;
  correo: string;     
  documento: string;
  rol: string | null; 
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

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Body inválido' }, { status: 400 });
  }

  // Campos permitidos para crear usuario
  // Nuevo modelo: password requerido, correo -> email, sin mediopago
  const campos = [
    'nombre', 'apellido', 'tipo_documento', 'documento', 'telefono', 'correo', 'ciudad', 'direccion',
    'nombreusuario', 'password', 'fecha_nacimiento', 'id_rol'
  ];
  const columnas = [];
  const valores = [];
  for (const campo of campos) {
    if (body[campo] !== undefined && body[campo] !== null && body[campo] !== "") {
      if (campo === 'correo') {
        columnas.push('email');
      } else {
        columnas.push(campo);
      }
      valores.push(body[campo]);
    }
  }

  // Validar campos obligatorios
  const obligatorios = ['nombre', 'apellido', 'tipo_documento', 'documento', 'telefono', 'correo', 'ciudad', 'direccion', 'nombreusuario', 'password', 'fecha_nacimiento', 'id_rol'];
  for (const campo of obligatorios) {
    if (!body[campo] || body[campo] === "") {
      return NextResponse.json({ ok: false, error: `Falta el campo obligatorio: ${campo}` }, { status: 400 });
    }
  }

  const placeholders = valores.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO usuario (${columnas.join(', ')}) VALUES (${placeholders}) RETURNING idusuario`;
  try {
    const result = await sql(query, valores);
    return NextResponse.json({ ok: true, id: result.rows[0]?.idusuario });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: 'Error al crear usuario' }, { status: 500 });
  }
}