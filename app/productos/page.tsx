import { BiAngry } from "react-icons/bi";

export default function Page() {
  return (
<main className="bg-gray-100 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-900 shadow-lg z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo animado */}
          <a
            href="/"
            className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent animate-gradient"
          >
            DrinkWare
          </a>

          {/* Menú */}
          <ul className="flex gap-8">
            <li>
              <a
                href="/"
                className="text-white font-bold hover:text-pink-500 transition-colors"
              >
                Inicio
              </a>
            </li>
            <li>
              <a
                href="/productos"
                className="text-white font-bold hover:text-pink-500 transition-colors"
              >
                Productos
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Encabezado */}
      <header className="bg-gradient-to-r from-purple-700 to-pink-600 text-white py-16 text-center shadow-lg mt-20">
        <h1 className="text-5xl font-extrabold tracking-wide">
          Productos DrinkWare
        </h1>
        <p className="mt-3 text-xl">
          Licores colombianos que celebran nuestra tradición
        </p>
      </header>

      {/* Grid de productos */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {/* Aguardiente */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Aguardiente_Antioque%C3%B1o_Bottle.png"
            alt="Aguardiente Antioqueño"
            className="w-full h-64 object-contain bg-gray-50"
          />
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-purple-700">
              Aguardiente Antioqueño
            </h2>
            <p className="mt-3 text-gray-700">
              El clásico de Colombia, con sabor anisado y tradición en cada sorbo.
            </p>
          </div>
        </div>

        {/* Ron Medellín */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform">
          <img
            src="https://misterlicor.com/cdn/shop/products/ronmedellin-1_1024x1024.jpg"
            alt="Ron Medellín"
            className="w-full h-64 object-contain bg-gray-50"
          />
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-purple-700">Ron Medellín</h2>
            <p className="mt-3 text-gray-700">
              El ron insignia, con envejecimiento natural que garantiza suavidad y carácter.
            </p>
          </div>
        </div>

        {/* Ron Viejo de Caldas */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform">
          <img
            src="https://ronviejo.com/wp-content/uploads/2021/03/RVC-3.jpg"
            alt="Ron Viejo de Caldas"
            className="w-full h-64 object-contain bg-gray-50"
          />
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-purple-700">
              Ron Viejo de Caldas
            </h2>
            <p className="mt-3 text-gray-700">
              Reconocido internacionalmente por su suavidad y proceso de añejamiento único.
            </p>
          </div>
        </div>

        {/* Cerveza Poker */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform">
          <img
            src="https://m.media-amazon.com/images/I/71nQjA7SkgL._AC_UF894,1000_QL80_.jpg"
            alt="Cerveza Poker"
            className="w-full h-64 object-contain bg-gray-50"
          />
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-purple-700">Cerveza Poker</h2>
            <p className="mt-3 text-gray-700">
              La cerveza de la amistad, perfecta para compartir momentos únicos.
            </p>
          </div>
        </div>

        {/* Cerveza Águila */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform">
          <img
            src="https://m.media-amazon.com/images/I/51uzIuPqTQL.jpg"
            alt="Cerveza Águila"
            className="w-full h-64 object-contain bg-gray-50"
          />
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-purple-700">Cerveza Águila</h2>
            <p className="mt-3 text-gray-700">
              Refrescante y popular en todo el país, ideal para cualquier celebración.
            </p>
          </div>
        </div>

        {/* Refajo Colombiano */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform">
          <img
            src="https://mercaldas.vtexassets.com/arquivos/ids/205181-800-auto?v=637863980716000000&width=800&height=auto&aspect=true"
            alt="Refajo Colombiano"
            className="w-full h-64 object-contain bg-gray-50"
          />
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-purple-700">
              Refajo Colombiano
            </h2>
            <p className="mt-3 text-gray-700">
              La mezcla perfecta entre cerveza y gaseosa, infaltable en las fiestas típicas.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
