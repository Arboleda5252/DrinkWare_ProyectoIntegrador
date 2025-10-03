import { NextRequest, NextResponse } from "next/server";
import { sql } from '@/app/libs/database';

// Asegura runtime Node (pg no funciona en Edge)
export const runtime = "nodejs";

type Usuario = { idusuario: number; nombreusuario: string };

export async function POST(req: NextRequest) {
  try {
    const { nombreusuario, password } = await req.json();
    if (!nombreusuario || !password) {
      return NextResponse.json({ ok: false, error: "Faltan credenciales" }, { status: 400 });
    }

    // Comparación directa (texto plano)
    const { rows } = await sql<Usuario>(
      `SELECT idusuario, nombreusuario
         FROM public.usuario
        WHERE nombreusuario = $1 AND password = $2`,
      [nombreusuario, password]
    );

    if (rows.length === 1) {
      return NextResponse.json({ ok: true, user: rows[0] });
    }
    return NextResponse.json({ ok: false, error: "Credenciales incorrectas" }, { status: 401 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}