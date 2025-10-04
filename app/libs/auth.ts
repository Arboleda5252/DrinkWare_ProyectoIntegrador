import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { sql } from "@/app/libs/database";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

export type SessionUser = { idusuario: number; nombreusuario: string };

export async function signSession(user: SessionUser) {
  return await new SignJWT({ nombreusuario: user.nombreusuario })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.idusuario)) 
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    const idusuario = payload.sub ? Number(payload.sub) : NaN;
    if (!payload.sub || Number.isNaN(idusuario)) return null;
    return { idusuario, nombreusuario: String(payload.nombreusuario ?? "") };
  } catch {
    return null;
  }
}

export async function getUserFromSession() {
  if (typeof window !== "undefined") {
    throw new Error("getUserFromSession solo puede usarse en el servidor (Server Component, API Route o Server Action)");
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const v = await verifySession(token);
  if (!v) return null;

  const { rows } = await sql<{ idusuario: number; nombreusuario: string; activo: boolean }>(
    "SELECT idusuario, nombreusuario, activo FROM public.usuario WHERE idusuario = $1 LIMIT 1",
    [v.idusuario]
  );

  const u = rows[0];
  if (!u || !u.activo) return null; 

  return { idusuario: u.idusuario, nombreusuario: u.nombreusuario };
}