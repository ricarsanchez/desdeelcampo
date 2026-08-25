"use client";

type AdAssetType = "banner" | "video";

type AdAsset = {
  id: string;
  type: AdAssetType;
  fileName: string;
  fileUrl?: string;
  destino?: string;
  contentType?: string;
  esVideo?: boolean;
  titulo?: string;
  activo?: boolean;
  orden?: number;
  slot?: string;
  fileSize?: number;
  updatedAt?: string;
};

type PublicidadFormProps = {
  adFile: File | null;
  setAdFile: (file: File | null) => void;
  adPreviewUrl: string | null;
  adTitulo: string;
  setAdTitulo: (value: string) => void;
  adDestino: string;
  setAdDestino: (value: string) => void;
  adErrors: string[];
  adApiError: string | null;
  onPublishAd: () => Promise<void>;
  onDeleteAd: (id: string) => Promise<void>;
  isPublishingAd: boolean;
  ads: AdAsset[];
};

const FILE_ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/webm";

export function PublicidadForm({
  adFile,
  setAdFile,
  adPreviewUrl,
  adTitulo,
  setAdTitulo,
  adDestino,
  setAdDestino,
  adErrors,
  adApiError,
  onPublishAd,
  onDeleteAd,
  isPublishingAd,
  ads,
}: PublicidadFormProps) {
  const previewIsVideo = adFile?.type.startsWith("video/") ?? false;

  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-slate-800">Link destino (opcional)</label>
        <input
          type="url"
          value={adDestino}
          onChange={(e) => setAdDestino(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="https://..."
          disabled={isPublishingAd}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-800">Título (opcional)</label>
        <input
          type="text"
          value={adTitulo}
          onChange={(e) => setAdTitulo(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Ej: Auspiciante principal"
          disabled={isPublishingAd}
        />
        <p className="mt-2 text-xs text-slate-500">
          Solo se muestra en la web pública si se completa.
        </p>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-800">Archivo</label>
        <input
          type="file"
          accept={FILE_ACCEPT}
          onChange={(e) => setAdFile(e.target.files?.[0] ?? null)}
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
          disabled={isPublishingAd}
        />
        <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">Medidas sugeridas</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>Auspiciante lateral: 600 x 300 px o 1200 x 600 px</li>
            <li>Banner horizontal: 1200 x 300 px</li>
            <li>Banner cuadrado: 600 x 600 px</li>
            <li>Banner vertical: 300 x 600 px</li>
          </ul>
          <p className="mt-2 font-semibold text-slate-700">Formatos permitidos</p>
          <p>JPG, PNG, WebP, MP4 o WebM. El sistema detectará automáticamente el tipo.</p>
        </div>
        {adPreviewUrl && !previewIsVideo && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-600">Vista previa (imagen)</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={adPreviewUrl}
              alt="Vista previa de la imagen"
              className="mt-2 h-44 w-full rounded-xl bg-white object-cover ring-1 ring-slate-200"
            />
          </div>
        )}
        {adPreviewUrl && previewIsVideo && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-600">Vista previa (video)</p>
            <video
              src={adPreviewUrl}
              controls
              className="mt-2 h-44 w-full rounded-xl bg-black object-contain ring-1 ring-slate-200"
            />
          </div>
        )}
      </div>

      {adErrors.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-900">Revisá lo siguiente:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {adErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {adApiError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {adApiError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onPublishAd}
          disabled={isPublishingAd || adErrors.length > 0}
          className={
            "rounded-xl px-4 py-2 text-sm font-semibold text-white transition " +
            (isPublishingAd || adErrors.length > 0
              ? "bg-slate-300"
              : "bg-emerald-600 hover:bg-emerald-700")
          }
        >
          {isPublishingAd ? "Publicando..." : "Publicar publicidad"}
        </button>
        <p className="text-xs text-slate-500">
          {isPublishingAd ? "Enviando a /api/banners…" : "Banner o video en Supabase Storage."}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-slate-900">Activos cargados</h3>
        {ads.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Todavía no cargaste banners o videos.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {ads.slice(0, 8).map((ad) => (
              <div
                key={ad.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    {(ad.esVideo ?? ad.type === "video") ? "Video" : "Banner"} • {ad.fileName}
                  </p>
                  {ad.destino ? (
                    <a
                      href={ad.destino}
                      className="mt-1 block truncate text-sm text-emerald-700 underline underline-offset-2"
                    >
                      {ad.destino}
                    </a>
                  ) : (
                    <p className="mt-1 truncate text-sm text-slate-500">Sin link destino</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-full md:w-56">
                    {!(ad.esVideo ?? ad.type === "video") && ad.fileUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ad.fileUrl}
                        alt="Miniatura de banner"
                        className="h-20 w-full rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    )}
                    {(ad.esVideo ?? ad.type === "video") && ad.fileUrl && (
                      <video
                        src={ad.fileUrl}
                        className="h-20 w-full rounded-xl bg-black object-contain ring-1 ring-slate-200"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteAd(ad.id)}
                    className="shrink-0 rounded-full border border-rose-600 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
