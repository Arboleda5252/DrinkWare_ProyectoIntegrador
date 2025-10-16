import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { sql } from "@/app/libs/database";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

export type SessionUser = { idusuario: number; nombreusuario: string };
export type AuthSuccess = { ok: true; user: SessionUser; token: string; activated: boolean };
export type AuthError = { ok: false; error: string; status?: number };
export type AuthResult = AuthSuccess | AuthError;
type DbUserRow = { idusuario: number; nombreusuario: string; password: string; activo: boolean };

export async function authenticateUser(nombreusuario: string, password: string): Promise<AuthResult> {
  if (!nombreusuario || !password) {
    return { ok: false, error: "Faltan credenciales", status: 400 };
  }

  const { rows } = await sql<DbUserRow>(
    `SELECT idusuario, nombreusuario, password, activo
       FROM public.usuario
      WHERE nombreusuario = $1
      LIMIT 1`,
    [nombreusuario]
  );
  const user = rows[0];

  if (!user || user.password !== password) {
    return { ok: false, error: "Credenciales incorrectas", status: 401 };
  }

  let activated = false;
  if (!user.activo) {
    const updateResult = await sql(
      `UPDATE public.usuario
          SET activo = TRUE
        WHERE idusuario = $1`,
      [user.idusuario]
    );
    activated = updateResult.rowCount > 0;
  }

  const token = await signSession({ idusuario: user.idusuario, nombreusuario: user.nombreusuario });
  return {
    ok: true,
    user: { idusuario: user.idusuario, nombreusuario: user.nombreusuario },
    token,
    activated,
  };
}

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

  const { rows } = await sql<{ idusuario: number; nombreusuario: string; nombre: string; activo: boolean }>(
    "SELECT idusuario, nombreusuario, nombre, activo FROM public.usuario WHERE idusuario = $1 LIMIT 1",
    [v.idusuario]
  );
  const u = rows[0];

  if (!u || !u.activo) return null;
  return { idusuario: u.idusuario, nombreusuario: u.nombreusuario, nombre: u.nombre };
}
