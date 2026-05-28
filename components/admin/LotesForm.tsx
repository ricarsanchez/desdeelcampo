"use client";

type LoteDraft = {
  titulo: string;
  cantidad: string;
  peso: string;
  categoria: string;
  precio: string;
  localidad: string;
  telefono: string;
};

type LotesFormProps = {
  loteDraft: LoteDraft;
  setLoteDraft: (value: LoteDraft | ((prev: LoteDraft) => LoteDraft)) => void;
  loteImageFile: File | null;
  setLoteImageFile: (file: File | null) => void;
  loteImagePreviewUrl: string | null;
  loteErrors: string[];
  loteApiError: string | null;
  onPublishLote: () => Promise<void>;
  onDeleteLote: (id: string) => Promise<void>;
  isPublishingLote: boolean;
  lotes: Array<{
    id: string;
    titulo: string;
    cantidad: number;
    peso: number;
    categoria: string;
    precio: number;
    localidad: string;
    telefono?: string;
    imageUrl?: string;
  }>;
};

export function LotesForm({
  loteDraft,
  setLoteDraft,
  loteImageFile,
  setLoteImageFile,
  loteImagePreviewUrl,
  loteErrors,
  loteApiError,
  onPublishLote,
  onDeleteLote,
  isPublishingLote,
  lotes,
}: LotesFormProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-800">Título</label>
          <input
            type="text"
            value={loteDraft.titulo}
            onChange={(e) => setLoteDraft((p) => ({ ...p, titulo: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ej: Terneros Angus - 25 cabezas"
            disabled={isPublishingLote}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800">Categoría</label>
          <input
            type="text"
            value={loteDraft.categoria}
            onChange={(e) => setLoteDraft((p) => ({ ...p, categoria: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ej: Terneros / Vaquillonas / Novillos"
            disabled={isPublishingLote}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800">Cantidad</label>
          <input
            type="number"
            inputMode="numeric"
            value={loteDraft.cantidad}
            onChange={(e) => setLoteDraft((p) => ({ ...p, cantidad: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ej: 25"
            disabled={isPublishingLote}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800">Peso</label>
          <input
            type="number"
            inputMode="decimal"
            value={loteDraft.peso}
            onChange={(e) => setLoteDraft((p) => ({ ...p, peso: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ej: 180"
            disabled={isPublishingLote}
          />
          <p className="mt-1 text-xs text-slate-500">En kg.</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800">Precio</label>
          <input
            type="number"
            inputMode="decimal"
            value={loteDraft.precio}
            onChange={(e) => setLoteDraft((p) => ({ ...p, precio: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ej: 1200"
            disabled={isPublishingLote}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800">Localidad</label>
          <input
            type="text"
            value={loteDraft.localidad}
            onChange={(e) => setLoteDraft((p) => ({ ...p, localidad: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ej: San Cristóbal, Santa Fe"
            disabled={isPublishingLote}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800">Teléfono del vendedor</label>
          <input
            type="tel"
            value={loteDraft.telefono}
            onChange={(e) => setLoteDraft((p) => ({ ...p, telefono: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ej: 03492 123456"
            disabled={isPublishingLote}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-800">Imagen del lote</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLoteImageFile(e.target.files?.[0] ?? null)}
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
          disabled={isPublishingLote}
        />
        {loteImagePreviewUrl && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-600">Vista previa</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={loteImagePreviewUrl}
              alt="Vista previa de imagen del lote"
              className="mt-2 w-full max-w-full rounded-xl bg-white object-contain ring-1 ring-slate-200"
            />
          </div>
        )}
      </div>

      {loteErrors.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-900">Revisá lo siguiente:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {loteErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {loteApiError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {loteApiError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onPublishLote}
          disabled={isPublishingLote || loteErrors.length > 0}
          className={
            "rounded-xl px-4 py-2 text-sm font-semibold text-white transition " +
            (isPublishingLote || loteErrors.length > 0
              ? "bg-slate-300"
              : "bg-emerald-600 hover:bg-emerald-700")
          }
        >
          {isPublishingLote ? "Publicando..." : "Publicar lote"}
        </button>
        <p className="text-xs text-slate-500">
          {isPublishingLote ? "Enviando a /api/lotes…" : "Se guarda la imagen en /public/uploads."}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-slate-900">Últimos lotes</h3>
        {lotes.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Todavía no publicaste lotes.</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {lotes.slice(0, 6).map((lote) => (
              <div
                key={lote.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{lote.titulo}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lote.categoria} • {lote.localidad}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-700">${lote.precio}</p>
                      <p className="text-xs text-slate-500">{lote.cantidad} u.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteLote(lote.id)}
                      className="rounded-full border border-rose-600 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                {lote.telefono && (
                  <p className="mt-2 text-xs text-slate-500">Tel: {lote.telefono}</p>
                )}
                {lote.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lote.imageUrl}
                    alt={`Imagen de ${lote.titulo}`}
                    className="mt-3 w-full max-w-full rounded-xl object-contain ring-1 ring-slate-200"
                  />
                )}
                <p className="mt-2 text-xs text-slate-500">Peso: {lote.peso} kg</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
