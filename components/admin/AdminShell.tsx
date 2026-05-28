"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type TabKey = "lotes" | "publicidad" | "noticias" | "precios";

type AdminShellProps = {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
  preview: boolean;
  setPreview: (preview: boolean | ((prev: boolean) => boolean)) => void;
  children: ReactNode;
};

export function AdminShell({ tab, setTab, preview, setPreview, children }: AdminShellProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoStatus, setLogoStatus] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function handleLogoUpload() {
    if (!logoFile || isUploadingLogo) return;
    setLogoStatus(null);
    setIsUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append("file", logoFile);
      const res = await fetch("/api/logo", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo subir el logo.");
      }

      setLogoStatus("Logo alternativo subido correctamente.");
      setLogoFile(null);
    } catch (error) {
      setLogoStatus(error instanceof Error ? error.message : "No se pudo subir el logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-medium tracking-wide text-slate-500">Administración</p>
                <h1 className="text-xl font-bold text-slate-900">Panel</h1>
              </div>

              <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mx-auto flex min-h-[110px] w-full max-w-[220px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="Logo predeterminado"
                    className="w-full h-auto object-contain max-h-[96px]"
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                    disabled={isUploadingLogo}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-slate-900 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleLogoUpload}
                    disabled={!logoFile || isUploadingLogo}
                    className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isUploadingLogo ? "Subiendo..." : "Subir logo alternativo"}
                  </button>
                  {logoStatus && <p className="text-xs text-slate-600">{logoStatus}</p>}
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setTab("lotes")}
                  className={
                    "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition " +
                    (tab === "lotes"
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                      : "text-slate-700 hover:bg-slate-50")
                  }
                >
                  Lotes
                </button>
                <button
                  type="button"
                  onClick={() => setTab("publicidad")}
                  className={
                    "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition " +
                    (tab === "publicidad"
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                      : "text-slate-700 hover:bg-slate-50")
                  }
                >
                  Publicidad
                </button>
                <button
                  type="button"
                  onClick={() => setTab("noticias")}
                  className={
                    "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition " +
                    (tab === "noticias"
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                      : "text-slate-700 hover:bg-slate-50")
                  }
                >
                  Noticias
                </button>
                <button
                  type="button"
                  onClick={() => setTab("precios")}
                  className={
                    "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition " +
                    (tab === "precios"
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                      : "text-slate-700 hover:bg-slate-50")
                  }
                >
                  Gestión de Precios
                </button>
              </nav>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className={
                    "w-full rounded-xl px-3 py-2 text-sm font-semibold transition " +
                    (preview
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50")
                  }
                >
                  {preview ? "Cerrar vista previa" : "Ver vista previa"}
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  La vista previa resume lo de esta sesión; logo y archivos se guardan vía API.
                </p>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
