"use client";

import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresa la contraseña de administrador para acceder al panel.
        </p>

        <LoginForm />
      </div>
    </div>
  );
}
