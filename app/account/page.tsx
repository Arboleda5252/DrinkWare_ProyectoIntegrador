
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <section className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          
          <h1 className="text-2xl font-bold tracking-tight">Bienvenido a DrinkWare</h1>
          <p className="text-sm text-gray-500 mt-1">Elige una opción para continuar</p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/account/login"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium shadow-sm ring-1 ring-gray-200 hover:bg-sky-300"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/account/registro"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:shadow-lg bg-gray-200 hover:bg-sky-300"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}