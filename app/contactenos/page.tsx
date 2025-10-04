import { BiAngry } from "react-icons/bi";

export default function Page() {
  return (
   <main className="bg-gray-100 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-900 shadow-lg z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
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
            <li>
              <a
                href="/contacto"
                className="text-white font-bold hover:text-pink-500 transition-colors"
              >
                Contáctenos
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Encabezado */}
      <header className="bg-gradient-to-r from-purple-700 to-pink-600 text-white py-16 text-center shadow-lg mt-20">
        <h1 className="text-5xl font-extrabold tracking-wide">
          Contáctenos
        </h1>
        <p className="mt-3 text-xl">
          Estamos aquí para atenderte y resolver tus dudas
        </p>
      </header>

      {/* Formulario de contacto */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        {/* Información de contacto */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-purple-700 text-center">
            Información de contacto
          </h2>
          <p className="mt-4 text-gray-700 text-lg">
            Puedes comunicarte con nosotros a través de los siguientes medios:
          </p>
          <ul className="mt-6 space-y-4 text-gray-700 text-lg">
            <li>
              📍 Dirección: Calle 123 #45-67, Medellín, Colombia
            </li>
            <li>📞 Teléfono: +57 300 123 4567</li>
            <li>✉️ Correo: contacto@drinkware.com</li>
            <li>🕒 Horarios: Lunes a Sábado, 9:00am - 8:00pm</li>
          </ul>
        </div>

        {/* Formulario */}
        <form className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-purple-700 text-center">
            Escríbenos
          </h2>
          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Tu nombre"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <input
              type="email"
              placeholder="Tu correo"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <textarea
              placeholder="Tu mensaje"
              rows="5"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition"
            >
              Enviar mensaje
            </button>
          </div>
        </form>
      </section>

    </main>
  );
}
