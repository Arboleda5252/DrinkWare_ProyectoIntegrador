"use client";

import * as React from "react";
import { FaSpinner, FaClipboardCheck, FaBan } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Producto = {
  id: number;
  nombre: string;
  categoria: string | null;
  precio: number;
  stock: number;
  estado: string | null;
  descripcion: string | null;
  imagen: string | null;
};

export default function Page() {
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        setCargando(true);
        const res = await fetch("/api/productos", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error ?? "Respuesta inválida");
        if (!cancelado) setProductos(json.data as Producto[]);
      } catch (e: any) {
        if (!cancelado) setError(e?.message ?? "Error al cargar productos");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-purple-700 mb-8">
        Catálogo de Productos
      </h1>

      {cargando && (
        <div className="flex justify-center items-center text-purple-600 text-xl">
          <FaSpinner className="animate-spin mr-2" />
          Cargando productos...
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center text-red-600 text-lg">
          <FaBan className="mr-2" />
          {error}
        </div>
      )}

      {!cargando && !error && productos.length === 0 && (
        <div className="text-center text-gray-500">No hay productos disponibles.</div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {producto.imagen ? (
              <Image
                src={producto.imagen}
                alt={producto.nombre}
                width={300}
                height={300}
                className="h-80 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                Sin imagen
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-indigo-500">{producto.nombre}</h2>
              <p className="text-sm text-gray-600">{producto.descripcion}</p>
              <p className="mt-2 text-green-600 font-bold text-lg">
                ${producto.precio.toLocaleString("es-CO")}
              </p>
              <p className="text-sm text-gray-500">
                Stock: {producto.stock} | Estado:{" "}
                <span
                  className={`font-semibold ${
                    producto.estado === "activo" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {producto.estado ?? "Desconocido"}
                </span>
              </p>
              <button
                onClick={() => router.push(`/productos/${producto.id}`)}
                className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaClipboardCheck className="mr-2" />
                Ver detalles
              </button>
              
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
