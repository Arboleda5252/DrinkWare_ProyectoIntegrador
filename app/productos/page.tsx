"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Page() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroDisponible, setFiltroDisponible] = useState("todos");
  const [animarCarrito, setAnimarCarrito] = useState(false);

  useEffect(() => {
    setProductos([
      {
        id: 1,
        nombre: "Aguardiente Antioqueño",
        descripcion: "El clásico de Colombia, con sabor anisado.",
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
        descripcion: "El ron insignia de Colombia.",
        precio: 55000,
        disponible: true,
        imagen: "/productos/ronMed1-2.png",
        referencia: "RON-002",
        variaciones: ["750 ml", "1 litro"],
      },
      {
        id: 3,
        nombre: "Ron Viejo de Caldas",
        descripcion: "Suavidad y tradición única.",
        precio: 48000,
        precioOriginal: 52000,
        disponible: true,
        imagen: "/productos/ronCaldasLitro.png",
        referencia: "RVC-003",
        variaciones: ["500 ml", "1 litro"],
      },
    ]);
  }, []);

  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
    setAnimarCarrito(true);
    setTimeout(() => setAnimarCarrito(false), 500);
  };

  const quitarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const total = carrito.reduce((acc, p) => acc + p.precio, 0);

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (filtroDisponible === "todos" ||
        (filtroDisponible === "disponible" && p.disponible) ||
        (filtroDisponible === "agotado" && !p.disponible))
  );

  return (
    <main className="bg-gray-100 font-sans min-h-screen relative">
      {/* Barra superior */}
      <nav className="fixed top-0 left-0 w-full bg-black text-white flex justify-between items-center px-6 py-4 shadow-lg z-50">
        <h1 className="text-2xl font-bold tracking-wide">DrinkWare</h1>
        <div className="flex items-center space-x-4">
          {/* Barra de búsqueda */}
          <input
            type="text"
            placeholder="Buscar producto..."
            className="px-4 py-2 rounded-lg text-black focus:outline-none"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {/* Filtro */}
          <select
            className="px-3 py-2 rounded-lg text-black"
            value={filtroDisponible}
            onChange={(e) => setFiltroDisponible(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="disponible">Disponible</option>
            <option value="agotado">Agotado</option>
          </select>
          {/* Icono Carrito */}
          <button
            onClick={() => setMostrarCarrito(true)}
            className={`relative text-2xl hover:scale-110 transition-transform ${
              animarCarrito ? "animate-bounce" : ""
            }`}
          >
            {carrito.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {carrito.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Encabezado */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20 text-center mt-20">
        <h2 className="text-4xl font-extrabold">Productos</h2>
        <p className="mt-2">Licores colombianos que celebran nuestra tradición</p>
      </header>

      {/* Productos */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {productosFiltrados.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-2xl shadow-lg p-4 hover:scale-105 transition-transform"
          >
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              width={300}
              height={200}
              className="w-full h-60 object-contain"
            />
            <h3 className="text-xl font-bold mt-4 text-gray-800">
              {producto.nombre}
            </h3>
            <p className="text-gray-600">{producto.descripcion}</p>
            <div className="mt-3">
              {producto.precioOriginal && (
                <span className="line-through text-gray-400 mr-2">
                  ${producto.precioOriginal.toLocaleString("es-CO")}
                </span>
              )}
              <span className="text-green-600 font-bold text-lg">
                ${producto.precio.toLocaleString("es-CO")}
              </span>
            </div>
            <button
              onClick={() => agregarAlCarrito(producto)}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-700"
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </section>

      {/* Sidebar carrito */}
      {mostrarCarrito && (
        <div className="fixed top-0 right-0 w-80 h-full bg-black text-white shadow-2xl transform transition-transform duration-500 translate-x-0 z-50">
          <div className="p-6 flex justify-between items-center border-b border-gray-700">
            <h2 className="text-xl font-semibold">Tu Carrito</h2>
            <button onClick={() => setMostrarCarrito(false)}>❌</button>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto h-[70%]">
            {carrito.length === 0 ? (
              <p className="text-gray-400">El carrito está vacío</p>
            ) : (
              carrito.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.nombre}</span>
                  <button
                    onClick={() => quitarDelCarrito(index)}
                    className="text-red-400 hover:text-red-600"
                  >
                    Quitar
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="p-6 border-t border-gray-700">
            <p className="text-lg font-bold">
              Total: ${total.toLocaleString("es-CO")}
            </p>
            {carrito.length > 0 && (
              <button
                onClick={vaciarCarrito}
                className="mt-4 w-full bg-red-600 py-2 rounded-lg hover:bg-red-700"
              >
                Vaciar carrito
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
