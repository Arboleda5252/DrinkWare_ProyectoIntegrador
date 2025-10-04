import { NextResponse } from 'next/server';
import { sql } from '@/app/libs/database';

export const runtime = 'nodejs';

type Row = { rol: string };

export async function GET() {
  const { rows } = await sql<Row>('SELECT * FROM usuario;');
  return NextResponse.json({ ok: true, rows });
}
