"use client";

import { useMemo, useState } from "react";
import {
  getPublicidadSlotLabel,
  normalizePublicidadSlot,
  PUBLICIDAD_SLOT_OPTIONS,
  type PublicidadSlot,
  type PublicidadSlotInput,
} from "../../lib/publicidadSlots";

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
  slot?: PublicidadSlotInput;
  fileSize?: number;
  updatedAt?: string;
};

type AdMetadataUpdate = {
  titulo: string;
  destino: string;
  orden: number;
  activo: boolean;
  slot: PublicidadSlot;
};

type PublicidadFormProps = {
  adFile: File | null;
  setAdFile: (file: File | null) => void;
  adPreviewUrl: string | null;
  adTitulo: string;
  setAdTitulo: (value: string) => void;
  adDestino: string;
  setAdDestino: (value: string) => void;
  adOrden: string;
  setAdOrden: (value: string) => void;
  adSlot: PublicidadSlot;
  setAdSlot: (value: PublicidadSlot) => void;
  adActivo: boolean;
  setAdActivo: (value: boolean) => void;
  adErrors: string[];
  adApiError: string | null;
  onPublishAd: () => Promise<void>;
  onUpdateAd: (id: string, update: AdMetadataUpdate) => Promise<void>;
  onDeleteAd: (id: string) => Promise<void>;
  isPublishingAd: boolean;
  ads: AdAsset[];
};

type EditDraft = {
  titulo: string;
  destino: string;
  orden: string;
  activo: boolean;
  slot: PublicidadSlot;
};

const FILE_ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/webm";

function isVideo(ad: AdAsset) {
  return ad.esVideo ?? ad.type === "video";
}

export function PublicidadForm({
  adFile,
  setAdFile,
  adPreviewUrl,
  adTitulo,
  setAdTitulo,
  adDestino,
  setAdDestino,
  adOrden,
  setAdOrden,
  adSlot,
  setAdSlot,
  adActivo,
  setAdActivo,
  adErrors,
  adApiError,
  onPublishAd,
  onUpdateAd,
  onDeleteAd,
  isPublishingAd,
  ads,
}: PublicidadFormProps) {
  const previewIsVideo = adFile?.type.startsWith("video/") ?? false;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const sortedAds = useMemo(() => {
    const slotIndex = (ad: AdAsset) =>
      PUBLICIDAD_SLOT_OPTIONS.findIndex(
        (option) => option.value === normalizePublicidadSlot(ad.slot),
      );

    return [...ads].sort(
      (a, b) => slotIndex(a) - slotIndex(b) || (a.orden ?? 0) - (b.orden ?? 0),
    );
  }, [ads]);

  function startEditing(ad: AdAsset) {
    setEditingId(ad.id);
    setEditDraft({
      titulo: ad.titulo ?? "",
      destino: ad.destino ?? "",
      orden: String(ad.orden ?? 0),
      activo: ad.activo ?? true,
      slot: normalizePublicidadSlot(ad.slot),
    });
    setEditError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditDraft(null);
    setEditError(null);
  }

  async function saveEditing() {
    if (!editingId || !editDraft || isSavingEdit) return;

    const order = Number(editDraft.orden);
    if (!Number.isInteger(order) || order < 0) {
      setEditError("El orden debe ser un número entero mayor o igual a 0.");
      return;
    }

    setEditError(null);
    setIsSavingEdit(true);
    try {
      await onUpdateAd(editingId, {
        titulo: editDraft.titulo,
        destino: editDraft.destino,
        orden: order,
        activo: editDraft.activo,
        slot: editDraft.slot,
      });
      cancelEditing();
    } catch {
      setEditError("No se pudieron guardar los cambios. Revisá el mensaje del servidor.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-slate-800">Link destino (opcional)</label>
        <input
          type="url"
          value={adDestino}
          onChange={(event) => setAdDestino(event.target.value)}
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
          onChange={(event) => setAdTitulo(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Ej: Auspiciante principal"
          disabled={isPublishingAd}
        />
        <p className="mt-2 text-xs text-slate-500">Solo se muestra en la web pública si se completa.</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-800">Ubicación</label>
          <select
            value={adSlot}
            onChange={(event) => setAdSlot(event.target.value as PublicidadSlot)}
            disabled={isPublishingAd}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
          >
            {PUBLICIDAD_SLOT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">Elegí dónde se mostrará en la página pública.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">Orden</label>
          <input
            type="number"
            min="0"
            step="1"
            value={adOrden}
            onChange={(event) => setAdOrden(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            disabled={isPublishingAd}
          />
          <p className="mt-2 text-xs text-slate-500">Los números menores aparecen primero.</p>
        </div>
      </div>

      <label className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={adActivo}
          onChange={(event) => setAdActivo(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
          disabled={isPublishingAd}
        />
        <span>
          <span className="block font-semibold text-slate-800">Publicidad activa</span>
          <span className="text-xs text-slate-500">Si se desactiva, no se mostrará en la página pública.</span>
        </span>
      </label>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-800">Archivo</label>
        <input
          type="file"
          accept={FILE_ACCEPT}
          onChange={(event) => setAdFile(event.target.files?.[0] ?? null)}
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
          disabled={isPublishingAd}
        />
        <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">Medidas sugeridas</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {adSlot === "main_banner" ? (
              <li>Banner central: 1200 x 300 px</li>
            ) : (
              <li>Publicidad lateral: 600 x 450 px u 800 x 600 px</li>
            )}
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
              className="mt-2 h-52 w-full rounded-xl bg-white object-contain ring-1 ring-slate-200"
            />
          </div>
        )}
        {adPreviewUrl && previewIsVideo && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-600">Vista previa (video)</p>
            <video
              src={adPreviewUrl}
              controls
              className="mt-2 h-52 w-full rounded-xl bg-black object-contain ring-1 ring-slate-200"
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
          {isPublishingAd ? "Guardando publicidad…" : "Imagen o video guardado en Supabase Storage."}
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">Publicidades cargadas</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {ads.length} {ads.length === 1 ? "publicidad" : "publicidades"}
          </span>
        </div>

        {sortedAds.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Todavía no cargaste imágenes o videos.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {sortedAds.map((ad) => {
              const editing = editingId === ad.id && editDraft;

              return (
                <article key={ad.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                    <div>
                      {ad.fileUrl && !isVideo(ad) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ad.fileUrl}
                          alt={ad.titulo || "Miniatura de publicidad"}
                          className="h-28 w-full rounded-xl bg-slate-100 object-contain ring-1 ring-slate-200"
                        />
                      )}
                      {ad.fileUrl && isVideo(ad) && (
                        <video
                          src={ad.fileUrl}
                          muted
                          playsInline
                          className="h-28 w-full rounded-xl bg-black object-contain ring-1 ring-slate-200"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      {editing ? (
                        <div className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-semibold text-slate-700">Título</label>
                              <input
                                type="text"
                                value={editDraft.titulo}
                                onChange={(event) => setEditDraft({ ...editDraft, titulo: event.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Publicidad sin título"
                                disabled={isSavingEdit}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-700">Link destino</label>
                              <input
                                type="url"
                                value={editDraft.destino}
                                onChange={(event) => setEditDraft({ ...editDraft, destino: event.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                placeholder="https://..."
                                disabled={isSavingEdit}
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-semibold text-slate-700">Ubicación</label>
                              <select
                                value={editDraft.slot}
                                onChange={(event) =>
                                  setEditDraft({
                                    ...editDraft,
                                    slot: event.target.value as PublicidadSlot,
                                  })
                                }
                                disabled={isSavingEdit}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              >
                                {PUBLICIDAD_SLOT_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-700">Orden</label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={editDraft.orden}
                                onChange={(event) => setEditDraft({ ...editDraft, orden: event.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                disabled={isSavingEdit}
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={editDraft.activo}
                              onChange={(event) => setEditDraft({ ...editDraft, activo: event.target.checked })}
                              disabled={isSavingEdit}
                            />
                            Publicidad activa
                          </label>

                          {editError && <p className="text-sm text-red-600">{editError}</p>}

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={saveEditing}
                              disabled={isSavingEdit}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300"
                            >
                              {isSavingEdit ? "Guardando..." : "Guardar cambios"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={isSavingEdit}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">
                                {ad.titulo || "Publicidad sin título"}
                              </h4>
                              <p className="mt-1 text-xs text-slate-500">
                                {isVideo(ad) ? "Video" : "Imagen"} · {getPublicidadSlotLabel(ad.slot)} · Orden {ad.orden ?? 0}
                              </p>
                            </div>
                            <span
                              className={
                                "rounded-full px-2.5 py-1 text-xs font-semibold " +
                                (ad.activo ?? true
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-200 text-slate-600")
                              }
                            >
                              {ad.activo ?? true ? "Activa" : "Inactiva"}
                            </span>
                          </div>

                          {ad.destino ? (
                            <a
                              href={ad.destino}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 block truncate text-sm text-emerald-700 underline underline-offset-2"
                            >
                              {ad.destino}
                            </a>
                          ) : (
                            <p className="mt-3 text-sm text-slate-500">Sin link</p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(ad)}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteAd(ad.id)}
                              className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
