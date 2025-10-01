
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
       inicio
    </main>
  );
  <html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drinkware - Distribuidora de Licores</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html {
      scroll-behavior: smooth;
    }
  </style>
</head>
<body class="bg-gray-100 text-gray-800">

  <!-- Navbar -->
  <nav class="fixed top-0 left-0 w-full bg-gray-900 shadow-lg z-50">
    <ul class="flex justify-center gap-8 py-4">
      <li><a href="#inicio" class="text-white font-bold hover:text-pink-500">Inicio</a></li>
      <li><a href="#quienes-somos" class="text-white font-bold hover:text-pink-500">Quiénes Somos</a></li>
      <li><a href="#mision" class="text-white font-bold hover:text-pink-500">Misión</a></li>
      <li><a href="#vision" class="text-white font-bold hover:text-pink-500">Visión</a></li>
      <li><a href="#valor-agregado" class="text-white font-bold hover:text-pink-500">Valor Agregado</a></li>
    </ul>
  </nav>

  <!-- Encabezado -->
  <header id="inicio" class="bg-gradient-to-r from-purple-700 to-pink-600 text-white text-center py-28 mt-16">
    <h1 class="text-5xl font-extrabold tracking-wider">Drinkware</h1>
    <p class="mt-3 text-lg">La mejor distribuidora de licores en Colombia</p>
  </header>

  <!-- Quiénes somos -->
  <section id="quienes-somos" class="max-w-5xl mx-auto my-16 p-8 bg-white rounded-xl shadow-lg">
    <h2 class="text-3xl font-bold text-purple-700 text-center relative pb-3 after:content-[''] after:block after:w-20 after:h-1 after:bg-pink-600 after:mx-auto after:mt-3">
      ¿Quiénes Somos?
    </h2>
    <p class="mt-6 text-lg text-justify">
      En <strong>Drinkware</strong> somos una distribuidora de licores comprometida con ofrecer 
      productos de alta calidad y un excelente servicio. Contamos con un catálogo variado 
      que satisface los gustos de todos nuestros clientes, siempre garantizando 
      confianza, cumplimiento y responsabilidad.
    </p>
  </section>

  <!-- Misión -->
  <section id="mision" class="max-w-5xl mx-auto my-16 p-8 bg-white rounded-xl shadow-lg">
    <h2 class="text-3xl font-bold text-purple-700 text-center relative pb-3 after:content-[''] after:block after:w-20 after:h-1 after:bg-pink-600 after:mx-auto after:mt-3">
      Misión
    </h2>
    <p class="mt-6 text-lg text-justify">
      Nuestra misión es llevar a cada cliente experiencias únicas a través de la distribución 
      responsable de licores nacionales e internacionales, ofreciendo precios competitivos 
      y un servicio ágil y seguro.
    </p>
  </section>

  <!-- Visión -->
  <section id="vision" class="max-w-5xl mx-auto my-16 p-8 bg-white rounded-xl shadow-lg">
    <h2 class="text-3xl font-bold text-purple-700 text-center relative pb-3 after:content-[''] after:block after:w-20 after:h-1 after:bg-pink-600 after:mx-auto after:mt-3">
      Visión
    </h2>
    <p class="mt-6 text-lg text-justify">
      Ser reconocidos como la distribuidora de licores líder en el país, destacándonos por 
      la innovación, la confianza y el compromiso con nuestros clientes, proveedores y la comunidad.
    </p>
  </section>

  <!-- Valor agregado -->
  <section id="valor-agregado" class="max-w-5xl mx-auto my-16 p-8 bg-orange-50 border-l-8 border-orange-500 rounded-xl shadow-lg">
    <h2 class="text-3xl font-bold text-orange-600 text-center relative pb-3 after:content-[''] after:block after:w-20 after:h-1 after:bg-orange-500 after:mx-auto after:mt-3">
      Valor Agregado
    </h2>
    <ul class="mt-6 list-disc list-inside space-y-3 text-lg">
      <li><strong>Atención personalizada:</strong> servicio cercano, adaptado a las necesidades de cada cliente.</li>
      <li><strong>Variedad de productos:</strong> amplio portafolio de licores nacionales e importados con disponibilidad inmediata.</li>
      <li><strong>Distribución rápida:</strong> sistema logístico eficiente para que tu pedido llegue a tiempo y en perfectas condiciones.</li>
    </ul>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-200 text-center py-6">
    <p>&copy; 2025 Drinkware - Distribuidora de Licores. Todos los derechos reservados.</p>
  </footer>

</body>
</html>
}
