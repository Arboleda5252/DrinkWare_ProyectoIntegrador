"use client";
import { useState } from "react";
import Link from "next/link";
import { MdOutlineDeleteForever } from "react-icons/md";

export default function Page() {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="text-3xl text-black font-semibold">Panel de usuario</h1>
        <p className="text-slate-900">
          Administra tu cuenta y tus métodos de pago desde aquí.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <button
            onClick={() => setShowAccountModal(true)}
            
            className="w-full inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium shadow-sm ring-1 ring-gray-200 hover:bg-sky-300 text-black"
          >
            Administrar cuenta
          </button>

          <Link
            href="/user/usuario/pago"
            className="w-full inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium shadow-sm ring-1 ring-gray-200 hover:bg-sky-300 text-black"
          >
            Método de pago
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium shadow-sm ring-1 ring-gray-200 hover:bg-red-300 text-black"
          >
            Eliminar cuenta
          </button>
        </div>
      </div>

      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 text-left text-slate-900 shadow-lg">
            <h2 className="text-xl text-center font-semibold">Administrar cuenta</h2>
            <p className="mt-2 text-sm text-center text-slate-600">
              Aquí puedes configurar los datos de tu cuenta. 
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAccountModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 text-left text-slate-900 shadow-lg">
            <h2 className="text-xl font-semibold text-red-600">
              Confirmar eliminación 
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará permanentemente tu cuenta ¿Deseas continuar?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                }}
                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-white hover:bg-red-200"
              >
                <MdOutlineDeleteForever className="text-2xl text-red-600"/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
