/*import { NextApiRequest, NextApiResponse } from 'next';

export default function index(req: NextApiRequest, res: NextApiResponse) {
  return  res.json({ message: 'hello world' });
}*/



import { NextResponse } from 'next/server';
import { sql } from '@/app/libs/database';

export const runtime = 'nodejs';

type Row = { rol: string };

export async function GET() {
  const { rows } = await sql<Row>('SELECT * FROM usuario;');
  return NextResponse.json({ ok: true, rows });
}


//import { NextApiRequest, NextApiResponse } from "next";
//import { conn } from "../../libs/database";