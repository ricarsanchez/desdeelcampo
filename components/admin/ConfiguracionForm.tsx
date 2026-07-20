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
  instagramDraft: string;
  setInstagramDraft: (value: string) => void;
  instagramSaved: string;
  facebookDraft: string;
  setFacebookDraft: (value: string) => void;
  facebookSaved: string;
  emailDraft: string;
  setEmailDraft: (value: string) => void;
  emailSaved: string;
  addressDraft: string;
  setAddressDraft: (value: string) => void;
  addressSaved: string;
  isSaving: boolean;
  apiError: string | null;
  successMessage: string | null;
  onSave: () => Promise<void>;
  onReset: () => void;
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
  instagramDraft,
  setInstagramDraft,
  instagramSaved,
  facebookDraft,
  setFacebookDraft,
  facebookSaved,
  emailDraft,
  setEmailDraft,
  emailSaved,
  addressDraft,
  setAddressDraft,
  addressSaved,
  isSaving,
  apiError,
  successMessage,
  onSave,
  onReset,
}: ConfiguracionFormProps) {
  const hasUnsavedChanges =
    whatsappDraft !== whatsappSaved ||
    quienesSomosTitleDraft.trim() !== quienesSomosTitleSaved ||
    quienesSomosContentDraft.trim() !== quienesSomosContentSaved ||
    instagramDraft.trim() !== instagramSaved ||
    facebookDraft.trim() !== facebookSaved ||
    emailDraft.trim() !== emailSaved ||
    addressDraft.trim() !== addressSaved;

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
              Se conservan los saltos de línea.
            </p>
          </div>
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
              Formato internacional sin el signo +.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Camera className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Instagram</h3>
          </div>
          <p className="text-xs text-slate-500">
            Usuario o URL de Instagram que se mostrará en el sitio.
          </p>
          <div className="mt-4">
            <input
              type="text"
              value={instagramDraft}
              onChange={(e) => setInstagramDraft(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ej: @desdeelcampo"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Link className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Facebook</h3>
          </div>
          <p className="text-xs text-slate-500">
            Usuario o URL de Facebook que se mostrará en el sitio.
          </p>
          <div className="mt-4">
            <input
              type="text"
              value={facebookDraft}
              onChange={(e) => setFacebookDraft(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ej: /desdeelcampo"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Correo electrónico</h3>
          </div>
          <p className="text-xs text-slate-500">
            Dirección de correo electrónico de contacto.
          </p>
          <div className="mt-4">
            <input
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ej: contacto@desdeelcampo.com.ar"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Dirección</h3>
          </div>
          <p className="text-xs text-slate-500">
            Dirección física que se mostrará en el sitio.
          </p>
          <div className="mt-4">
            <input
              type="text"
              value={addressDraft}
              onChange={(e) => setAddressDraft(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ej: San Cristóbal, Santa Fe"
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      {apiError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {apiError}
        </p>
      )}

      {successMessage && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
        </div>
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
        <button
          type="button"
          onClick={onReset}
          disabled={isSaving || !hasUnsavedChanges}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          Restablecer cambios
        </button>
        <p className="text-xs text-slate-500">
          {isSaving ? "Enviando a /api/config…" : "Los cambios se reflejan en el sitio automáticamente."}
        </p>
      </div>
    </>
  );
}
