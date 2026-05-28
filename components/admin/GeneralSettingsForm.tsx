"use client";

type GeneralSettingsFormProps = {
  siteNameDraft: string;
  siteNameSaved: string;
  setSiteNameDraft: (value: string) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  logoPreviewUrl: string | null;
  logoSavedUrl: string | null;
  generalApiError: string | null;
  generalCanSave: boolean;
  isSavingGeneral: boolean;
  onSaveGeneral: () => Promise<void>;
};

export function GeneralSettingsForm({
  siteNameDraft,
  siteNameSaved,
  setSiteNameDraft,
  logoFile,
  setLogoFile,
  logoPreviewUrl,
  logoSavedUrl,
  generalApiError,
  generalCanSave,
  isSavingGeneral,
  onSaveGeneral,
}: GeneralSettingsFormProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-800">Subir logo</label>
          <p className="mt-1 text-xs text-slate-500">Formatos sugeridos: PNG/JPG/SVG.</p>
          <input
            type="file"
            accept="image/*,.svg"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
            disabled={isSavingGeneral}
          />
          {logoPreviewUrl && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-600">Vista previa del logo</p>
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreviewUrl}
                  alt="Vista previa del logo"
                  className="h-14 w-14 rounded-xl bg-white object-contain ring-1 ring-slate-200"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{logoFile?.name}</p>
                  <p className="text-xs text-slate-500">Se guarda al presionar “Guardar”.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">Nombre del sitio</label>
          <input
            type="text"
            value={siteNameDraft}
            onChange={(e) => setSiteNameDraft(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-200 placeholder:text-slate-400 focus:ring-2"
            placeholder="Ej: Desde el Campo"
            disabled={isSavingGeneral}
          />
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-600">Actual</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{siteNameSaved}</p>
            <div className="mt-2 h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo predeterminado"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {generalApiError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {generalApiError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSaveGeneral}
          disabled={!generalCanSave || isSavingGeneral}
          className={
            "rounded-xl px-4 py-2 text-sm font-semibold text-white transition " +
            (!generalCanSave || isSavingGeneral
              ? "bg-slate-300"
              : "bg-emerald-600 hover:bg-emerald-700")
          }
        >
          {isSavingGeneral ? "Guardando..." : "Guardar"}
        </button>
        <p className="text-xs text-slate-500">
          {isSavingGeneral ? "Subiendo a /public/uploads…" : "Listo para guardar."}
        </p>
      </div>
    </>
  );
}
