// app/api/usuario/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/libs/database';

export const runtime = 'nodejs';

type UsuarioDetalle = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string | null;       
  documento: string | null;
  telefono: string | null;
  ciudad: string | null;
  direccion: string | null;
  tipo_documento: string | null;
  nombreusuario: string | null;
  fecha_nacimiento: string | null; 
  id_rol: number | null;
  rol: string | null;
};

function parseId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Ver más información de un usuario
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
  }

  try {
    const { rows } = await sql<UsuarioDetalle>(
      `
      SELECT
        u.idusuario AS id,
        u.nombre,
        u.apellido,
        u.email AS correo,
        u.documento,
        u.telefono,
        u.ciudad,
        u.direccion,
        u.tipo_documento,
        u.nombreusuario,
        u.fecha_nacimiento,
        u.id_rol,
        r.rol
      FROM usuario AS u
      LEFT JOIN user_rol AS r ON r.id_rol = u.id_rol
      WHERE u.idusuario = $1;
      `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: 'Error al obtener usuario' }, { status: 500 });
  }
}


// Actualizar datos del usuario (datos personales o rol)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Body inválido' }, { status: 400 });
  }

  // Separar campos permitidos
  const camposPersonales = [
    'nombre', 'apellido', 'correo', 'documento', 'telefono', 'ciudad', 'direccion',
    'tipo_documento', 'nombreusuario', 'fecha_nacimiento', 'mediopago'
  ];
  const camposActualizar = [];
  const valoresActualizar = [];

  for (const campo of camposPersonales) {
    if (body[campo] !== undefined) {
      camposActualizar.push(`${campo === 'correo' ? 'email' : campo}`);
      valoresActualizar.push(body[campo]);
    }
  }

  // Permitir actualizar el rol si viene en el body
  if (body.id_rol !== undefined) {
    camposActualizar.push('id_rol');
    valoresActualizar.push(body.id_rol);
  }

  if (camposActualizar.length === 0) {
    return NextResponse.json({ ok: false, error: 'No hay campos para actualizar' }, { status: 400 });
  }

  // Construir query dinámica
  const setClause = camposActualizar.map((campo, i) => `${campo} = $${i + 1}`).join(', ');
  const query = `UPDATE usuario SET ${setClause} WHERE idusuario = $${camposActualizar.length + 1}`;
  valoresActualizar.push(id);

  try {
    await sql(query, valoresActualizar);
    return NextResponse.json({ ok: true, message: 'Usuario actualizado' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: 'Error al actualizar usuario' }, { status: 500 });
  }
}


