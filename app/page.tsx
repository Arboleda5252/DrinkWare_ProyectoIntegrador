import Link from 'next/link';

export default function Page() {
  return (

<main className="bg-gray-100 text-gray-800">

  <div className="w-full bg-gray-900 shadow-lg z-10">
    <ul className="flex justify-center gap-8 py-4">
      <li><a href="#quienes-somos" className="text-white font-bold hover:text-pink-500">Quiénes Somos</a></li>
      <li><a href="#mision" className="text-white font-bold hover:text-pink-500">Misión</a></li>
      <li><a href="#vision" className="text-white font-bold hover:text-pink-500">Visión</a></li>
      <li><a href="#valor-agregado" className="text-white font-bold hover:text-pink-500">Valor Agregado</a></li>
    </ul>
  </div>

  <header id="inicio" className="bg-gradient-to-r from-purple-700 to-pink-600 text-white text-center py-28 mt-16">
    <h1 className="text-5xl font-extrabold tracking-wider">Drinkware</h1>
    <p className="mt-3 text-lg">La mejor distribuidora de licores en Colombia</p>
  </header>

  <section id="quienes-somos" className="max-w-5xl mx-auto my-16 p-8 bg-white rounded-xl shadow-lg">
    <h2 className="text-3xl font-bold text-purple-700 text-center relative pb-3 after:content-[''] after:block after:w-20 after:h-1 after:bg-pink-600 after:mx-auto after:mt-3">
      ¿Quiénes Somos?
    </h2>
    <p className="mt-6 text-lg text-justify">
      En <strong>Drinkware</strong> somos una distribuidora de licores comprometida con ofrecer 
      productos de alta calidad y un excelente servicio. Contamos con un catálogo variado 
      que satisface los gustos de todos nuestros clientes, siempre garantizando 
      confianza, cumplimiento y responsabilidad.
    </p>
  </section>

  <section id="mision" className="max-w-5xl mx-auto my-16 p-8 bg-white rounded-xl shadow-lg">
    <h2 className="text-3xl font-bold text-purple-700 text-center relative pb-3 after:content-[''] after:block after:w-20 after:h-1 after:bg-pink-600 after:mx-auto after:mt-3">
      Misión
    </h2>
    <p className="mt-6 text-lg text-justify">
      Nuestra misión es llevar a cada cliente experiencias únicas a través de la distribución 
      responsable de licores nacionales e internacionales, ofreciendo precios competitivos 
      y un servicio ágil y seguro.
    </p>
  </section>

  <section id="vision" className="max-w-5xl mx-auto my-16 p-8 bg-white rounded-xl shadow-lg">
    <h2 className="text-3xl font-bold text-purple-700 text-center relative pb-3 after:content-[''] after:block after:w-20 after:h-1 after:bg-pink-600 after:mx-auto after:mt-3">
      Visión
    </h2>
    <p className="mt-6 text-lg text-justify">
      Ser reconocidos como la distribuidora de licores líder en el país, destacándonos por 
      la innovación, la confianza y el compromiso con nuestros clientes, proveedores y la comunidad.
    </p>
  </section>

  <section id="valor-agregado" className="max-w-5xl mx-auto my-16 p-8 bg-orange-50 border-l-8 border-orange-500 rounded-xl shadow-lg">
    <h2 className="text-3xl font-bold text-orange-600 text-center relative pb-3 after:content-[''] after:block after:w-20 after:h-1 after:bg-orange-500 after:mx-auto after:mt-3">
      Valor Agregado
    </h2>
    <ul className="mt-6 list-disc list-inside space-y-3 text-lg">
      <li><strong>Atención personalizada:</strong> servicio cercano, adaptado a las necesidades de cada cliente.</li>
      <li><strong>Variedad de productos:</strong> amplio portafolio de licores nacionales e importados con disponibilidad inmediata.</li>
      <li><strong>Distribución rápida:</strong> sistema logístico eficiente para que tu pedido llegue a tiempo y en perfectas condiciones.</li>
    </ul>
  </section>
</main>
  );
}
