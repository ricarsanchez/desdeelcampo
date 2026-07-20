"use client";

import { MessageCircle, Camera, Link, Mail, MapPin, Info } from "lucide-react";

type ConfiguracionFormProps = {
  whatsappDraft: string;
  setWhatsappDraft: (value: string) => void;
  whatsappSaved: string;
  quienesSomosTitleDraft: string;
  setQuienesSomosTitleDraft: (value: string) => void;
  quienesSomosContentDraft: string;
  setQuienesSomosContentDraft: (value: string) => void;
  quienesSomosTitleSaved: string;
  quienesSomosContentSaved: string;
  isSaving: boolean;
  apiError: string | null;
  onSave: () => Promise<void>;
};

export function ConfiguracionForm({
  whatsappDraft,
  setWhatsappDraft,
  whatsappSaved,
  quienesSomosTitleDraft,
  setQuienesSomosTitleDraft,
  quienesSomosContentDraft,
  setQuienesSomosContentDraft,
  quienesSomosTitleSaved,
  quienesSomosContentSaved,
  isSaving,
  apiError,
  onSave,
}: ConfiguracionFormProps) {
  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Quiénes Somos</h3>
          </div>
          <p className="text-xs text-slate-500">
            Sección informativa que se muestra en la página principal del sitio.
          </p>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-800">
              Título
            </label>
            <input
              type="text"
              value={quienesSomosTitleDraft}
              onChange={(e) => setQuienesSomosTitleDraft(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ej: Quiénes Somos"
              disabled={isSaving}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-800">
              Texto descriptivo
            </label>
            <textarea
              value={quienesSomosContentDraft}
              onChange={(e) => setQuienesSomosContentDraft(e.target.value)}
              rows={6}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200 resize-y"
              placeholder="Ej: Somos una plataforma dedicada a conectar productores y compradores del sector agropecuario..."
              disabled={isSaving}
            />
            <p className="mt-1 text-xs text-slate-500">
              Se conservan los saltos de línea. Hasta 2000 caracteres.
            </p>
          </div>

          {(quienesSomosTitleSaved || quienesSomosContentSaved) && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-medium text-emerald-800">Contenido guardado</p>
              {quienesSomosTitleSaved && (
                <p className="mt-1 text-sm font-semibold text-emerald-900">{quienesSomosTitleSaved}</p>
              )}
              {quienesSomosContentSaved && (
                <p className="mt-1 text-xs text-emerald-800 line-clamp-2">
                  {quienesSomosContentSaved}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">WhatsApp</h3>
          </div>
          <p className="text-xs text-slate-500">
            Número que se usará en el botón flotante del sitio y como respaldo en los lotes.
          </p>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-800">
              Número de teléfono
            </label>
            <input
              type="tel"
              value={whatsappDraft}
              onChange={(e) => setWhatsappDraft(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ej: 5493492000000"
              disabled={isSaving}
            />
            <p className="mt-1 text-xs text-slate-500">
              Formato internacional sin el signo +. Ej: 5493492000000
            </p>
          </div>

          {whatsappSaved && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-medium text-emerald-800">Número guardado</p>
              <p className="mt-1 text-sm font-semibold text-emerald-900">{whatsappSaved}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm opacity-60">
          <div className="flex items-center gap-2 mb-1">
            <Camera className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500">Instagram</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              Próximamente
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Usuario o URL de Instagram que se mostrará en el sitio.
          </p>
          <div className="mt-4">
            <input
              type="text"
              disabled
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
              placeholder="Disponible próximamente"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm opacity-60">
          <div className="flex items-center gap-2 mb-1">
            <Link className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500">Facebook</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              Próximamente
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Usuario o URL de Facebook que se mostrará en el sitio.
          </p>
          <div className="mt-4">
            <input
              type="text"
              disabled
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
              placeholder="Disponible próximamente"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm opacity-60">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500">Correo electrónico</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              Próximamente
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Dirección de correo electrónico de contacto.
          </p>
          <div className="mt-4">
            <input
              type="text"
              disabled
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
              placeholder="Disponible próximamente"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm opacity-60">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500">Dirección</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              Próximamente
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Dirección física que se mostrará en el sitio.
          </p>
          <div className="mt-4">
            <input
              type="text"
              disabled
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
              placeholder="Disponible próximamente"
            />
          </div>
        </div>
      </div>

      {apiError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {apiError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSaving ? "Guardando..." : "Guardar configuración"}
        </button>
        <p className="text-xs text-slate-500">
          {isSaving ? "Enviando a /api/config…" : "Los cambios se reflejan en el sitio automáticamente."}
        </p>
      </div>
    </>
  );
}
