"use client";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "../../components/admin/AdminShell";
import { AdminSection } from "../../components/admin/AdminSection";
import { LotesForm } from "../../components/admin/LotesForm";
import { NewsManagementForm } from "../../components/admin/NewsManagementForm";
import PriceManagementForm from "../../components/admin/PriceManagementForm";
import { PublicidadForm } from "../../components/admin/PublicidadForm";
import type { NewsArticle } from "../../lib/news";

type TabKey = "lotes" | "publicidad" | "noticias" | "precios";

type MarketPriceItem = {
  id: string;
  label: string;
  buy: number | null;
  sell: number | null;
  source: string;
  updatedAt: string;
};

type DollarOption = {
  id: string;
  label: string;
};

type MarketPrices = {
  updatedAt: string;
  dolar: MarketPriceItem[];
  availableTypes: DollarOption[];
  selectedTypes: string[];
};

type Lote = {
  id: string;
  titulo: string;
  cantidad: number;
  peso: number;
  categoria: string;
  precio: number;
  localidad: string;
  telefono?: string;
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
  const [tab, setTab] = useState<TabKey>("lotes");
  const [preview, setPreview] = useState(false);

  // Lotes
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loteDraft, setLoteDraft] = useState({
    titulo: "",
    cantidad: "",
    peso: "",
    categoria: "",
    precio: "",
    localidad: "",
    telefono: "",
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsDraft, setNewsDraft] = useState({
    title: "",
    content: "",
    date: "",
  });
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [newsImagePreviewUrl, setNewsImagePreviewUrl] = useState<string | null>(null);
  const [newsApiError, setNewsApiError] = useState<string | null>(null);
  const [isSavingNews, setIsSavingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const [marketPrices, setMarketPrices] = useState<MarketPrices | null>(null);
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [priceApiError, setPriceApiError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!newsImageFile) {
      return;
    }
    const url = URL.createObjectURL(newsImageFile);
    setNewsImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newsImageFile]);

  useEffect(() => {
    async function loadAdminData() {
      setLoadError(null);
      try {
        const [logoRes, lotesRes, bannersRes, pricesRes, newsRes] = await Promise.all([
          fetch("/api/logo"),
          fetch("/api/lotes"),
          fetch("/api/banners"),
          fetch("/api/market-prices"),
          fetch("/api/news"),
        ]);

        const [logoData, lotesData, bannersData, pricesData, newsData] = await Promise.all([
          logoRes.json(),
          lotesRes.json(),
          bannersRes.json(),
          pricesRes.json(),
          newsRes.json(),
        ]);

        if (!logoRes.ok || !logoData.ok) {
          throw new Error(logoData.error ?? "No se pudo cargar la configuración del sitio.");
        }
        if (!lotesRes.ok || !lotesData.ok) {
          throw new Error(lotesData.error ?? "No se pudieron cargar los lotes.");
        }
        if (!bannersRes.ok || !bannersData.ok) {
          throw new Error(bannersData.error ?? "No se pudo cargar la publicidad.");
        }
        if (!pricesRes.ok || !pricesData.ok) {
          throw new Error(pricesData.error ?? "No se pudieron cargar los precios.");
        }
        if (!newsRes.ok || !newsData.ok) {
          throw new Error(newsData.error ?? "No se pudieron cargar las noticias.");
        }

        setLotes(Array.isArray(lotesData.lotes) ? lotesData.lotes : []);
        setAds(Array.isArray(bannersData.banners) ? bannersData.banners : []);
        setMarketPrices(pricesData.prices ?? null);
        setNews(Array.isArray(newsData.noticias) ? newsData.noticias : []);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Error al cargar datos iniciales.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const loteErrors = useMemo(() => {
    const errs: string[] = [];
    if (!loteDraft.titulo.trim()) errs.push("El título es obligatorio.");
    if (!loteDraft.categoria.trim()) errs.push("La categoría es obligatoria.");
    if (!loteDraft.localidad.trim()) errs.push("La localidad es obligatoria.");
    if (!loteDraft.telefono.trim()) errs.push("El teléfono del vendedor es obligatorio.");
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

  const newsErrors = useMemo(() => {
    const errs: string[] = [];
    if (!newsDraft.title.trim()) errs.push("El título de la noticia es obligatorio.");
    if (!newsDraft.content.trim()) errs.push("El contenido de la noticia es obligatorio.");
    if (!newsDraft.date.trim()) errs.push("La fecha de la noticia es obligatoria.");
    return errs;
  }, [newsDraft]);

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
      fd.append("telefono", loteDraft.telefono.trim());
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

      const nuevo: Lote = { ...data.lote, id: uid(), telefono: loteDraft.telefono.trim() };
      setLotes((prev) => [nuevo, ...prev]);
      setLoteDraft({
        titulo: "",
        cantidad: "",
        peso: "",
        categoria: "",
        precio: "",
        localidad: "",
        telefono: "",
      });
      setLoteImageFile(null);
    } catch (e) {
      setLoteApiError(e instanceof Error ? e.message : "No se pudo publicar el lote.");
    } finally {
      setIsPublishingLote(false);
    }
  }

  async function onSaveNews() {
    if (isSavingNews || newsErrors.length > 0) return;
    setNewsApiError(null);
    setIsSavingNews(true);
    try {
      const fd = new FormData();
      fd.append("title", newsDraft.title.trim());
      fd.append("content", newsDraft.content.trim());
      fd.append("date", newsDraft.date.trim());
      if (newsImageFile) {
        fd.append("image", newsImageFile);
      }

      const endpoint = editingNewsId ? `/api/news?id=${encodeURIComponent(editingNewsId)}` : "/api/news";
      const method = editingNewsId ? "PUT" : "POST";
      const res = await fetch(endpoint, { method, body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      const noticia: NewsArticle = data.noticia;
      setNews((prev) => {
        if (editingNewsId) {
          return prev.map((item) => (item.id === noticia.id ? noticia : item));
        }
        return [noticia, ...prev];
      });
      setNewsDraft({ title: "", content: "", date: "" });
      setNewsImageFile(null);
      setNewsImagePreviewUrl(null);
      setEditingNewsId(null);
    } catch (e) {
      setNewsApiError(e instanceof Error ? e.message : "No se pudo guardar la noticia.");
    } finally {
      setIsSavingNews(false);
    }
  }

  function onEditNews(article: NewsArticle) {
    setEditingNewsId(article.id);
    setNewsDraft({ title: article.title, content: article.content, date: article.date });
    setNewsImageFile(null);
    setNewsImagePreviewUrl(article.imageUrl ?? null);
    setTab("noticias");
  }

  function onCancelEdit() {
    setEditingNewsId(null);
    setNewsDraft({ title: "", content: "", date: "" });
    setNewsImageFile(null);
    setNewsImagePreviewUrl(null);
  }

  async function onDeleteNews(id: string) {
    if (!confirm("¿Eliminar esta noticia?")) return;
    try {
      const res = await fetch(`/api/news?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      setNews((prev) => prev.filter((item) => item.id !== id));
      if (editingNewsId === id) {
        onCancelEdit();
      }
    } catch (e) {
      setNewsApiError(e instanceof Error ? e.message : "No se pudo eliminar la noticia.");
    }
  }

  async function onDeleteLote(id: string) {
    if (!confirm("¿Eliminar este lote?")) return;
    try {
      const res = await fetch(`/api/lotes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      setLotes((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setLoteApiError(e instanceof Error ? e.message : "No se pudo eliminar el lote.");
    }
  }

  async function onDeleteAd(id: string) {
    if (!confirm("¿Eliminar esta publicidad?")) return;
    try {
      const res = await fetch(`/api/banners?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      setAds((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setAdApiError(e instanceof Error ? e.message : "No se pudo eliminar la publicidad.");
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

  async function onSavePrices(selectedTypes: string[]) {
    if (isSavingPrices) return;
    setPriceApiError(null);
    setIsSavingPrices(true);

    try {
      const res = await fetch("/api/market-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTypes }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      setMarketPrices(data.prices);
    } catch (error) {
      setPriceApiError(error instanceof Error ? error.message : "No se pudo guardar la selección.");
    } finally {
      setIsSavingPrices(false);
    }
  }

  return (
    <AdminShell tab={tab} setTab={setTab} preview={preview} setPreview={setPreview}>
            {loadError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">No se pudieron cargar los datos iniciales.</p>
                <p>{loadError}</p>
              </div>
            )}
            {isLoading && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Cargando datos del panel administrativo…
              </div>
            )}
            {tab === "lotes" && (
              <AdminSection title="Lotes" description="Publicación con imagen en servidor (/api/lotes).">
                <LotesForm
                  loteDraft={loteDraft}
                  setLoteDraft={setLoteDraft}
                  loteImageFile={loteImageFile}
                  setLoteImageFile={setLoteImageFile}
                  loteImagePreviewUrl={loteImagePreviewUrl}
                  loteErrors={loteErrors}
                  loteApiError={loteApiError}
                  onPublishLote={onPublishLote}
                  onDeleteLote={onDeleteLote}
                  isPublishingLote={isPublishingLote}
                  lotes={lotes}
                />
              </AdminSection>
            )}

            {tab === "publicidad" && (
              <AdminSection title="Publicidad" description="Subí banners o videos con link destino.">
                <PublicidadForm
                  adType={adType}
                  setAdType={setAdType}
                  adFile={adFile}
                  setAdFile={setAdFile}
                  adPreviewUrl={adPreviewUrl}
                  adDestino={adDestino}
                  setAdDestino={setAdDestino}
                  adErrors={adErrors}
                  adApiError={adApiError}
                  onPublishAd={onPublishAd}
                  onDeleteAd={onDeleteAd}
                  isPublishingAd={isPublishingAd}
                  ads={ads}
                />
              </AdminSection>
            )}

            {tab === "noticias" && (
              <AdminSection title="Gestión de Noticias" description="Crear, editar y eliminar noticias del sitio.">
                <NewsManagementForm
                  news={news}
                  newsDraft={newsDraft}
                  setNewsDraft={setNewsDraft}
                  newsImageFile={newsImageFile}
                  setNewsImageFile={setNewsImageFile}
                  newsImagePreviewUrl={newsImagePreviewUrl}
                  newsErrors={newsErrors}
                  newsApiError={newsApiError}
                  onSaveNews={onSaveNews}
                  onEditNews={onEditNews}
                  onCancelEdit={onCancelEdit}
                  onDeleteNews={onDeleteNews}
                  isSavingNews={isSavingNews}
                  editingNewsId={editingNewsId}
                />
              </AdminSection>
            )}

            {tab === "precios" && (
              <AdminSection title="Gestión de Dólar" description="Elegí qué tipos de dólar se muestran en la portada.">
                {marketPrices ? (
                  <PriceManagementForm
                    initialSelectedTypes={marketPrices.selectedTypes}
                    availableOptions={marketPrices.availableTypes.map((option) => {
                      const liveRate = marketPrices.dolar.find((item) => item.id === option.id);
                      return {
                        ...option,
                        buy: liveRate?.buy ?? null,
                        sell: liveRate?.sell ?? null,
                      };
                    })}
                    updatedAt={marketPrices.updatedAt}
                    onSave={onSavePrices}
                    isSaving={isSavingPrices}
                    saveError={priceApiError}
                  />
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Cargando cotizaciones...
                  </div>
                )}
              </AdminSection>
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

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-600">Noticias</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{news.length}</p>
                    <div className="mt-3 space-y-2">
                      {news.slice(0, 3).map((n) => (
                        <div key={n.id} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                          <p className="text-sm font-semibold text-slate-900 truncate">{n.title}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{new Date(n.date).toLocaleDateString("es-AR")}</p>
                        </div>
                      ))}
                      {news.length === 0 && (
                        <p className="text-sm text-slate-500">Sin noticias aún.</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
    </AdminShell>
  );
}
