import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/app/libs/auth";

export default async function UserPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect("/account/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-gray-900">¡Hola, {user.nombreusuario}!</h1>
          <p className="text-sm text-gray-600">
            Tu sesión está activa. Desde aquí puedes acceder a tus secciones disponibles.
          </p>
        </header>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full text-center rounded-xl border border-gray-200 bg-gray-900 text-white px-4 py-3 font-semibold transition hover:bg-sky-500"
          >
            Volver a la página principal
          </Link>
          <Link
            href="/user/admin"
            className="block w-full text-center rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition hover:border-sky-400 hover:text-sky-500"
          >
            Ir al panel administrativo
          </Link>
        </div>
      </section>
    </main>
  );
}
