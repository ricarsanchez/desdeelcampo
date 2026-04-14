"use client";
import { useEffect, useMemo, useState } from "react";

type TabKey = "general" | "lotes" | "publicidad";

type Lote = {
  id: string;
  titulo: string;
  cantidad: number;
  peso: number;
  categoria: string;
  precio: number;
  localidad: string;
  imageUrl?: string;
};

type AdAssetType = "banner" | "video";
type AdAsset = {
  id: string;
  type: AdAssetType;
  fileName: string;
  fileUrl?: string;
  destino: string;
};

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

export default function AdminPage() {
  const [tab, setTab] = useState<TabKey>("general");
  const [preview, setPreview] = useState(false);

  // General
  const [siteNameDraft, setSiteNameDraft] = useState("Desde el Campo 2026");
  const [siteNameSaved, setSiteNameSaved] = useState("Desde el Campo 2026");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoSavedUrl, setLogoSavedUrl] = useState<string | null>(null);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [generalApiError, setGeneralApiError] = useState<string | null>(null);

  // Lotes
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loteDraft, setLoteDraft] = useState({
    titulo: "",
    cantidad: "",
    peso: "",
    categoria: "",
    precio: "",
    localidad: "",
  });
  const [loteImageFile, setLoteImageFile] = useState<File | null>(null);
  const [loteImagePreviewUrl, setLoteImagePreviewUrl] = useState<string | null>(null);
  const [isPublishingLote, setIsPublishingLote] = useState(false);
  const [loteApiError, setLoteApiError] = useState<string | null>(null);

  // Publicidad
  const [ads, setAds] = useState<AdAsset[]>([]);
  const [adType, setAdType] = useState<AdAssetType>("banner");
  const [adFile, setAdFile] = useState<File | null>(null);
  const [adPreviewUrl, setAdPreviewUrl] = useState<string | null>(null);
  const [adDestino, setAdDestino] = useState("");
  const [isPublishingAd, setIsPublishingAd] = useState(false);
  const [adApiError, setAdApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    if (!loteImageFile) {
      setLoteImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(loteImageFile);
    setLoteImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [loteImageFile]);

  useEffect(() => {
    if (!adFile) {
      setAdPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(adFile);
    setAdPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [adFile]);

  const generalCanSave = useMemo(() => {
    return siteNameDraft.trim().length > 0 || !!logoFile;
  }, [logoFile, siteNameDraft]);

  const loteErrors = useMemo(() => {
    const errs: string[] = [];
    if (!loteDraft.titulo.trim()) errs.push("El título es obligatorio.");
    if (!loteDraft.categoria.trim()) errs.push("La categoría es obligatoria.");
    if (!loteDraft.localidad.trim()) errs.push("La localidad es obligatoria.");
    if (!loteImageFile) errs.push("La imagen del lote es obligatoria.");

    const cantidad = toNumber(loteDraft.cantidad);
    const peso = toNumber(loteDraft.peso);
    const precio = toNumber(loteDraft.precio);
    if (!Number.isFinite(cantidad) || cantidad <= 0) errs.push("La cantidad debe ser un número mayor a 0.");
    if (!Number.isFinite(peso) || peso <= 0) errs.push("El peso debe ser un número mayor a 0.");
    if (!Number.isFinite(precio) || precio <= 0) errs.push("El precio debe ser un número mayor a 0.");
    return errs;
  }, [loteDraft, loteImageFile]);

  const adErrors = useMemo(() => {
    const errs: string[] = [];
    if (!adFile) errs.push("Debes seleccionar un archivo (banner o video).");
    if (!adDestino.trim()) errs.push("El link destino es obligatorio.");
    return errs;
  }, [adDestino, adFile]);

  async function onSaveGeneral() {
    if (!generalCanSave || isSavingGeneral) return;
    setGeneralApiError(null);
    setIsSavingGeneral(true);
    try {
      if (siteNameDraft.trim()) setSiteNameSaved(siteNameDraft.trim());

      if (logoFile) {
        const fd = new FormData();
        fd.append("file", logoFile);
        const res = await fetch("/api/logo", { method: "POST", body: fd });
        const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
        if (!res.ok || !data.ok || !data.url) {
          throw new Error(data.error ?? `Error ${res.status}`);
        }
        setLogoSavedUrl(data.url);
        setLogoFile(null);
      }
    } catch (e) {
      setGeneralApiError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setIsSavingGeneral(false);
    }
  }

  async function onPublishLote() {
    if (isPublishingLote || loteErrors.length > 0 || !loteImageFile) return;
    setLoteApiError(null);
    setIsPublishingLote(true);
    try {
      const fd = new FormData();
      fd.append("titulo", loteDraft.titulo.trim());
      fd.append("cantidad", loteDraft.cantidad);
      fd.append("peso", loteDraft.peso);
      fd.append("categoria", loteDraft.categoria.trim());
      fd.append("precio", loteDraft.precio);
      fd.append("localidad", loteDraft.localidad.trim());
      fd.append("image", loteImageFile);

      const res = await fetch("/api/lotes", { method: "POST", body: fd });
      const data = (await res.json()) as {
        ok?: boolean;
        lote?: Lote;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.lote) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      const nuevo: Lote = { ...data.lote, id: uid() };
      setLotes((prev) => [nuevo, ...prev]);
      setLoteDraft({
        titulo: "",
        cantidad: "",
        peso: "",
        categoria: "",
        precio: "",
        localidad: "",
      });
      setLoteImageFile(null);
    } catch (e) {
      setLoteApiError(e instanceof Error ? e.message : "No se pudo publicar el lote.");
    } finally {
      setIsPublishingLote(false);
    }
  }

  async function onPublishAd() {
    if (isPublishingAd || adErrors.length > 0 || !adFile) return;
    setAdApiError(null);
    setIsPublishingAd(true);
    try {
      const fd = new FormData();
      fd.append("type", adType);
      fd.append("destino", adDestino.trim());
      fd.append("file", adFile);

      const res = await fetch("/api/banners", { method: "POST", body: fd });
      const data = (await res.json()) as {
        ok?: boolean;
        asset?: { type: AdAssetType; destino: string; fileUrl?: string; filename?: string };
        error?: string;
      };
      if (!res.ok || !data.ok || !data.asset) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      const nuevo: AdAsset = {
        id: uid(),
        type: data.asset.type,
        fileName: data.asset.filename ?? adFile.name,
        fileUrl: data.asset.fileUrl,
        destino: data.asset.destino,
      };
      setAds((prev) => [nuevo, ...prev]);
      setAdFile(null);
      setAdDestino("");
      setAdType("banner");
    } catch (e) {
      setAdApiError(e instanceof Error ? e.message : "No se pudo publicar la publicidad.");
    } finally {
      setIsPublishingAd(false);
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

              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setTab("general")}
                  className={[
                    "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition",
                    tab === "general"
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setTab("lotes")}
                  className={[
                    "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition",
                    tab === "lotes"
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Lotes
                </button>
                <button
                  type="button"
                  onClick={() => setTab("publicidad")}
                  className={[
                    "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition",
                    tab === "publicidad"
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Publicidad
                </button>
              </nav>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className={[
                    "w-full rounded-xl px-3 py-2 text-sm font-semibold transition",
                    preview
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {preview ? "Cerrar vista previa" : "Ver vista previa"}
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  La vista previa resume lo de esta sesión; logo y archivos se guardan vía API.
                </p>
              </div>
            </div>
          </aside>

          <main className="flex-1 space-y-6">
            {tab === "general" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">General</h2>
                  <p className="text-sm text-slate-600">Logo y nombre del sitio.</p>
                </div>

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
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {logoFile?.name}
                            </p>
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
                      {logoSavedUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={logoSavedUrl}
                            alt="Logo guardado en servidor"
                            className="h-10 w-10 rounded-lg bg-white object-contain ring-1 ring-slate-200"
                          />
                          <p className="truncate text-xs text-slate-500">{logoSavedUrl}</p>
                        </div>
                      )}
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
                    className={[
                      "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
                      !generalCanSave || isSavingGeneral
                        ? "bg-slate-300"
                        : "bg-emerald-600 hover:bg-emerald-700",
                    ].join(" ")}
                  >
                    {isSavingGeneral ? "Guardando..." : "Guardar"}
                  </button>
                  <p className="text-xs text-slate-500">
                    {isSavingGeneral ? "Subiendo a /public/uploads…" : "Listo para guardar."}
                  </p>
                </div>
              </section>
            )}

            {tab === "lotes" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Lotes</h2>
                  <p className="text-sm text-slate-600">
                    Publicación con imagen en servidor (<code className="text-xs">/api/lotes</code>).
                  </p>
                </div>

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
                        className="mt-2 h-44 w-full rounded-xl bg-white object-cover ring-1 ring-slate-200"
                      />
                    </div>
                  )}
                </div>

                {loteErrors.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-semibold text-amber-900">Revisá lo siguiente:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                      {loteErrors.map((e) => (
                        <li key={e}>{e}</li>
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
                    className={[
                      "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
                      isPublishingLote || loteErrors.length > 0
                        ? "bg-slate-300"
                        : "bg-emerald-600 hover:bg-emerald-700",
                    ].join(" ")}
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
                      {lotes.slice(0, 6).map((l) => (
                        <div
                          key={l.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">{l.titulo}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {l.categoria} • {l.localidad}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-emerald-700">${l.precio}</p>
                              <p className="text-xs text-slate-500">{l.cantidad} u.</p>
                            </div>
                          </div>
                          {l.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={l.imageUrl}
                              alt={`Imagen de ${l.titulo}`}
                              className="mt-3 h-28 w-full rounded-xl object-cover ring-1 ring-slate-200"
                            />
                          )}
                          <p className="mt-2 text-xs text-slate-500">Peso: {l.peso} kg</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {tab === "publicidad" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Publicidad</h2>
                  <p className="text-sm text-slate-600">Subí banners o videos con link destino.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800">Tipo</label>
                    <select
                      value={adType}
                      onChange={(e) => setAdType(e.target.value as AdAssetType)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      disabled={isPublishingAd}
                    >
                      <option value="banner">Banner</option>
                      <option value="video">Video</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800">Link destino</label>
                    <input
                      type="url"
                      value={adDestino}
                      onChange={(e) => setAdDestino(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="https://..."
                      disabled={isPublishingAd}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-slate-800">Archivo</label>
                  <input
                    type="file"
                    accept={adType === "banner" ? "image/*" : "video/*"}
                    onChange={(e) => setAdFile(e.target.files?.[0] ?? null)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                    disabled={isPublishingAd}
                  />
                  {adPreviewUrl && adType === "banner" && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-600">Vista previa (banner)</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={adPreviewUrl}
                        alt="Vista previa del banner"
                        className="mt-2 h-44 w-full rounded-xl bg-white object-cover ring-1 ring-slate-200"
                      />
                    </div>
                  )}
                  {adPreviewUrl && adType === "video" && (
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
                      {adErrors.map((e) => (
                        <li key={e}>{e}</li>
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
                    className={[
                      "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
                      isPublishingAd || adErrors.length > 0
                        ? "bg-slate-300"
                        : "bg-emerald-600 hover:bg-emerald-700",
                    ].join(" ")}
                  >
                    {isPublishingAd ? "Publicando..." : "Publicar publicidad"}
                  </button>
                  <p className="text-xs text-slate-500">
                    {isPublishingAd ? "Enviando a /api/banners…" : "Banner o video en /public/uploads."}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900">Activos cargados</h3>
                  {ads.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">Todavía no cargaste banners o videos.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {ads.slice(0, 8).map((a) => (
                        <div
                          key={a.id}
                          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900">
                              {a.type === "banner" ? "Banner" : "Video"} • {a.fileName}
                            </p>
                            <a
                              href={a.destino}
                              className="mt-1 block truncate text-sm text-emerald-700 underline underline-offset-2"
                            >
                              {a.destino}
                            </a>
                          </div>
                          <div className="w-full md:w-56">
                            {a.type === "banner" && a.fileUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.fileUrl}
                                alt="Miniatura de banner"
                                className="h-20 w-full rounded-xl object-cover ring-1 ring-slate-200"
                              />
                            )}
                            {a.type === "video" && a.fileUrl && (
                              <video
                                src={a.fileUrl}
                                className="h-20 w-full rounded-xl bg-black object-contain ring-1 ring-slate-200"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {preview && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Vista previa</h2>
                  <p className="text-sm text-slate-600">
                    Resumen de esta sesión; imágenes y videos usan URLs públicas del servidor cuando ya se
                    guardaron.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-600">Sitio</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{siteNameSaved}</p>
                    {logoPreviewUrl || logoSavedUrl ? (
                      <div className="mt-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoPreviewUrl ?? logoSavedUrl ?? ""}
                          alt="Logo (vista previa)"
                          className="h-16 w-16 rounded-xl bg-white object-contain ring-1 ring-slate-200"
                        />
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">Sin logo cargado.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-600">Lotes</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{lotes.length}</p>
                    <div className="mt-3 space-y-2">
                      {lotes.slice(0, 3).map((l) => (
                        <div key={l.id} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                          <p className="truncate text-sm font-semibold text-slate-900">{l.titulo}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {l.cantidad} u. • {l.localidad}
                          </p>
                        </div>
                      ))}
                      {lotes.length === 0 && <p className="text-sm text-slate-500">Sin lotes.</p>}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-600">Publicidad</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{ads.length}</p>
                    <div className="mt-3 space-y-2">
                      {ads.slice(0, 3).map((a) => (
                        <div key={a.id} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                          <p className="text-sm font-semibold text-slate-900">
                            {a.type === "banner" ? "Banner" : "Video"}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">{a.destino}</p>
                        </div>
                      ))}
                      {ads.length === 0 && (
                        <p className="text-sm text-slate-500">Sin banners/videos.</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
