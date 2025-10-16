import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/app/libs/auth";

export default async function UserPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect("/account/login");
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Hola, {user.nombre || user.nombreusuario}</h1>
        <p className="text-sm text-gray-600">
          Tu sesion esta activa. Desde aqui puedes acceder a tus secciones disponibles.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/"
          className="block rounded-xl border border-gray-200 bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-sky-500"
        >
          Volver a la pagina principal
        </Link>
        <Link
          href="/user/admin"
          className="block rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:border-sky-400 hover:text-sky-500"
        >
          Ir al panel administrativo
        </Link>
      </div>
    </section>
  );
}
