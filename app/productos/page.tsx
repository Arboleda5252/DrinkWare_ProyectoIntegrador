
import Image from 'next/image';


export default function Page() {
  return (
    <main className="bg-gray-100 font-sans">
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
          <Image
            src="/productos/agt1-2.png"
            alt="Aguardiente Antioqueño"
            width={100}
            height={100}
            className='w-full h-64 object-contain'
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
          <Image
            src="/productos/ronMed1-2.png"
            alt="Ron Medellín"
            width={100}
            height={100}
            className="w-full h-64 object-contain"
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
          <Image
            src="/productos/ronCaldasLitro.png"           
            alt="Ron Viejo de Caldas"
            width={100}
            height={100}
            className="w-full h-64 object-contain"
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
          <Image
            src="/productos/Poker0.png"
            width={100}
            height={100}
            alt="Cerveza Poker"
            className="w-full h-64 object-contain"
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
          <Image
            src="/productos/aguila0.png"
            alt="Cerveza Águila"
            width={100}
            height={100}
            className="w-full h-64 object-contain"
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
          <Image
            src="/productos/refajox6.png"
            width={100}
            height={100}
            alt="Refajo Colombiano"
            className="w-full h-64 object-contain"
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
