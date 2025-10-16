import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getUserFromSession } from "@/app/libs/auth";

type UserLayoutProps = {
  children: ReactNode;
};

export default async function UserLayout({ children }: UserLayoutProps) {
  const user = await getUserFromSession();
  if (!user) {
    redirect("/account/login");
  }

  const displayName = user.nombre || user.nombreusuario;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <aside className="w-full bg-white shadow-lg md:w-72">
        <div className="flex h-full flex-col px-2 py-4 md:px-4">
          <Link className="mb-4 flex h-16 items-center justify-center rounded-md bg-blue-500 p-2 md:h-40" href="/user">
            <div className="flex w-full flex-col items-center justify-center text-white">
              <Image
                src="/Logos/LogoAdmin.png"
                alt="Logo usuario"
                width={60}
                height={60}
                className="w-full max-w-[60px] brightness-0 invert"
              />
              <p className="text-lg font-semibold md:text-2xl">Perfil</p>
            </div>
          </Link>

          <div className="rounded-md bg-gray-100 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-gray-500">Usuario</p>
            <p className="mt-1 text-base font-semibold text-gray-900 md:text-lg">{displayName}</p>
          </div>

          <div className="mt-4 flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
            <nav className="flex w-full flex-col space-y-2">
              <Link
                href="/user/admin"
                className="flex items-center rounded-md px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-900 hover:text-white"
              >
                Administrar cuenta
              </Link>
              <Link
                href="/user/pedidos"
                className="flex items-center rounded-md px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-900 hover:text-white"
              >
                Administrar pedidos y compras
              </Link>
            </nav>
            <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block" />
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
