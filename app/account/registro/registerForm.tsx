"use client";

import * as React from "react";

export default function RegisterForm() {
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const payload = {
      nombre: String(fd.get("nombre") || ""),
      apellido: String(fd.get("apellido") || ""),
      tipo_documento: String(fd.get("tipo_documento") || ""),
      documento: String(fd.get("documento") || ""),
      correo_electronico: String(fd.get("correo_electronico") || ""),
      telefono: String(fd.get("telefono") || ""),
      nombre_usuario: String(fd.get("nombre_usuario") || ""),
      contrasena: String(fd.get("contrasena") || ""),
      fecha_nacimiento: String(fd.get("fecha_nacimiento") || ""),
      ciudad: String(fd.get("ciudad") || ""),
      direccion: String(fd.get("direccion") || ""),
    };

    setLoading(true);
    try {
      console.log(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <h1 className="text-2xl font-bold text-center">Crear cuenta en DrinkWare</h1>
      <p className="text-sm text-gray-500 text-center mt-1">
        Completa tus datos para registrarte
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            autoComplete="given-name"
            placeholder="Nombre"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <input
            id="apellido"
            name="apellido"
            type="text"
            required
            autoComplete="family-name"
            placeholder="Apellido"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label htmlFor="tipo_documento" className="block text-sm font-medium text-gray-700">
            Tipo de Documento
          </label>
          <select
            id="tipo_documento"
            name="tipo_documento"
            required
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            defaultValue=""
          >
            <option value="" disabled>Selecciona…</option>
            <option value="CC">Cédula de ciudadanía (CC)</option>
            <option value="CE">Cédula de extranjería (CE)</option>
            <option value="PAS">Pasaporte</option>
            <option value="DNI">DNI</option>
          </select>
        </div>

        <div>
          <label htmlFor="documento" className="block text-sm font-medium text-gray-700">
            Documento de Identificación
          </label>
          <input
            id="documento"
            name="documento"
            type="text"
            required
            inputMode="numeric"
            placeholder="Ej 103667890"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label htmlFor="correo_electronico" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="correo_electronico"
            name="correo_electronico"
            type="email"
            required
            autoComplete="email"
            placeholder="tuemail@example.com"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+57 300 000 0000"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label htmlFor="nombre_usuario" className="block text-sm font-medium text-gray-700">
            Nombre de usuario
          </label>
          <input
            id="nombre_usuario"
            name="nombre_usuario"
            type="text"
            required
            autoComplete="username"
            placeholder="Usuario"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="contrasena"
            name="contrasena"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700">
            Fecha de nacimiento
          </label>
          <input
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            type="date"
            required
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700">
            Ciudad
          </label>
          <input
            id="ciudad"
            name="ciudad"
            type="text"
            required
            autoComplete="address-level2"
            placeholder="Ej. Medellín"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
            Dirección
          </label>
          <input
            id="direccion"
            name="direccion"
            type="text"
            required
            autoComplete="street-address"
            placeholder="Calle 12 #4-67"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-sky-500 transition shadow-sm disabled:opacity-60"
      >
        {loading ? "Registrando…" : "Registrarse"}
      </button>
    </form>
  );
}