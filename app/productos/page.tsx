import Image from "next/image";
import { useState, useEffect } from "react";

export default function Page() {
  // Escenario 3: Simulación de actualización de precios y stock
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Aquí podrías conectar con una API real o base de datos
    setProductos([
      {
        id: 1,
        nombre: "Aguardiente Antioqueño",
        descripcion:
          "El clásico de Colombia, con sabor anisado y tradición en cada sorbo.",
        precio: 25000,
        precioOriginal: 30000,
        disponible: true,
        imagen: "/productos/agt1-2.png",
        referencia: "AGT-001",
        variaciones: ["750 ml", "1 litro"],
      },
      {
        id: 2,
        nombre: "Ron Medellín",
        descripcion:
          "El ron insignia, con envejecimiento natural que garantiza suavidad y carácter.",
        precio: 55000,
        precioOriginal: null,
        disponible: true,
        imagen: "/productos/ronMed1-2.png",
        referencia: "RON-002",
        variaciones: ["750 ml", "1 litro"],
      },
      {
        id: 3,
        nombre: "Ron Viejo de Caldas",
        descripcion:
          "Reconocido internacionalmente por su suavidad y proceso de añejamiento único.",
        precio: 48000,
        precioOriginal: 52000,
        disponible: true,
        imagen: "/productos/ronCaldasLitro.png",
        referencia: "RVC-003",
        variaciones: ["500 ml", "1 litro"],
      },
      {
        id: 4,
        nombre: "Cerveza Poker",
        descripcion:
          "La cerveza de la amistad, perfecta para compartir momentos únicos.",
        precio: 5500,
        precioOriginal: null,
        disponible: true,
        imagen: "/productos/Poker0.png",
        referencia: "POK-004",
        variaciones: ["330 ml", "6 pack"],
      },
      {
        id: 5,
        nombre: "Cerveza Águila",
        descripcion:
          "Refrescante y popular en todo el país, ideal para cualquier celebración.",
        precio: 5200,
        precioOriginal: 6000,
        disponible: false,
        imagen: "/productos/aguila0.png",
        referencia: "AGU-005",
        variaciones: ["330 ml", "6 pack"],
      },
      {
        id: 6,
        nombre: "Refajo Colombiano",
        descripcion:
          "La mezcla perfecta entre cerveza y gaseosa, infaltable en las fiestas típicas.",
        precio: 18000,
        precioOriginal: 20000,
        disponible: true,
        imagen: "/productos/refajox6.png",
        referencia: "REF-006",
        variaciones: ["Botella 1.5L", "6 pack"],
      },
    ]);
  }, []);

  return (
    <main className="bg-gray-100 font-sans min-h-screen">
      {/* Encabezado */}
      <header className="bg-gradient-to-r from-purple-700 to-pink-600 text-white py-16 text-center shadow-lg mt-20">
        <h1 className="text-5xl font-extrabold tracking-wide">
          Productos DrinkWare
        </h1>
        <p className="mt-3 text-xl">
          Licores colombianos que celebran nuestra tradición
        </p>
      </header>

      {/* Escenario 1 y 2: Catálogo con precios y botón de detalles */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform"
          >
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              width={300}
              height={300}
              className="w-full h-64 object-contain"
            />
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-purple-700">
                {producto.nombre}
              </h2>
              <p className="mt-3 text-gray-700">{producto.descripcion}</p>

              {/* Escenario 1: Visualización del precio */}
              <div className="mt-4">
                {producto.precioOriginal && (
                  <span className="text-gray-400 line-through mr-2 text-lg">
                    ${producto.precioOriginal.toLocaleString("es-CO")}
                  </span>
                )}
                <span className="text-green-600 font-bold text-xl">
                  ${producto.precio.toLocaleString("es-CO")}
                </span>
              </div>

              {/* Estado de disponibilidad */}
              <p
                className={`mt-2 text-sm font-semibold ${
                  producto.disponible ? "text-green-600" : "text-red-500"
                }`}
              >
                {producto.disponible ? "Disponible" : "Agotado"}
              </p>

              {/* Escenario 2: Botón Ver detalles */}
              <button
                className="mt-5 bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-700 transition-colors"
                onClick={() =>
                  alert(`
🛍️ ${producto.nombre}

Descripción: ${producto.descripcion}
Precio: $${producto.precio.toLocaleString("es-CO")}
Referencia: ${producto.referencia}
Disponibilidad: ${
                    producto.disponible ? "En stock" : "Agotado"
                  }
Variaciones: ${producto.variaciones.join(", ")}
                  `)
                }
              >
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
