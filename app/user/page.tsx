// components/Bienvenido.tsx
import Link from 'next/link';

export default function Bienvenido() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">¡Bienvenido a DrinkWare!</h1>
      <p className="text-lg text-gray-600 mb-6">
        Plataforma de gestión para distribuidoras de licores.
      </p>
      <Link href="/user/admin">
        <a className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Ir al panel de administración
        </a>
      </Link>
    </div>
  );
}