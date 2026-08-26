import {
  MessageCircle,
  MapPin,
  Weight,
  TrendingUp,
  Eye,
  Info,
} from "lucide-react";
import InstagramWebhookEventsList from "../components/InstagramWebhookEventsList";
import { fetchDollarRates, getSelectedDollarRates } from "./api/_utils/marketPrices";
import { readStoreData, type Lote, type AdAsset } from "./api/_utils/store";
import { readSiteConfig } from "./api/_utils/siteConfig";
import { readPublicidad } from "./api/_utils/publicidad";
import { readNewsArticles } from "../lib/news";
import { NewsSection } from "../components/NewsSection";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const defaultTickerItems = ["💵 Oficial C: $1020 V: $1040", "💵 Blue C: $1180 V: $1200"];

const defaultLotes: Lote[] = [
  {
    id: "1",
    titulo: "50 Terneros Invernada",
    cantidad: 25,
    peso: 180,
    categoria: "Bovinos",
    precio: 520000,
    localidad: "San Cristóbal, SF",
    telefono: "5493491234567",
    imageUrl:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80",
  },
  {
    id: "2",
    titulo: "30 Novillos Gordos",
    cantidad: 30,
    peso: 450,
    categoria: "Bovinos",
    precio: 495000,
    localidad: "Ceres, SF",
    telefono: "5493492345678",
    imageUrl:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
  },
  {
    id: "3",
    titulo: "80 Terneras Vaquillonas",
    cantidad: 80,
    peso: 220,
    categoria: "Bovinos",
    precio: 460000,
    localidad: "Tostado, SF",
    telefono: "5493493456789",
    imageUrl:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80",
  },
  {
    id: "4",
    titulo: "25 Vacas Preñadas",
    cantidad: 25,
    peso: 400,
    categoria: "Bovinos",
    precio: 580000,
    localidad: "San Cristóbal, SF",
    telefono: "5493494567890",
    imageUrl:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80",
  },
];

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────
const defaultLogoUrl = "/logo.png";

function Header({ siteName, whatsappNumber }: { siteName: string; whatsappNumber: string }) {
  const phone = whatsappNumber || "5493492000000";
  const whatsappUrl =
    `https://wa.me/${phone}?text=Hola!%20Me%20comunico%20desde%20${encodeURIComponent(
      siteName,
    )}.`;

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7] border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="#" className="shrink-0 group">
          <div className="w-[280px] max-w-[62vw] overflow-hidden group-hover:scale-105 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={defaultLogoUrl}
              alt="Logo del sitio"
              className="w-full h-auto object-contain max-h-[130px]"
            />
          </div>
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Inicio", href: "#" },
            { label: "Quienes Somos", href: "#quienes-somos" },
            { label: "Remates", href: "#" },
            { label: "Contacto", href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-green-800 hover:bg-green-50 transition-all"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* WhatsApp CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="whatsapp-header-cta"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14532D] text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// Market Ticker
// ─────────────────────────────────────────────────────────────
function MarketTicker({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="w-full bg-[#451A03] overflow-hidden py-2.5">
      <div className="flex items-center gap-3">
        <div className="shrink-0 flex items-center gap-2 pl-4 pr-2">
          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-amber-300 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Precios Hoy
          </span>
        </div>
        <div className="w-px h-5 bg-amber-800 shrink-0" />
        <div className="flex-1 overflow-hidden">
          <div className="ticker-track">
            {doubled.map((item, i) => (
              <span
                key={i}
                className="text-amber-100 text-sm font-medium px-6 whitespace-nowrap"
              >
                {item}
                <span className="text-amber-700 ml-6">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Quienes Somos Section
// ─────────────────────────────────────────────────────────────
function QuienesSomosSection({ title, content }: { title: string; content: string }) {
  return (
    <section id="quienes-somos" className="w-full bg-[#FDFBF7] py-10 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-[#14532D]" />
            <h2 className="text-2xl font-extrabold text-stone-800">
              {title || "Quiénes Somos"}
            </h2>
          </div>
          <p className="text-stone-600 text-base leading-relaxed whitespace-pre-line">
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Lot Card
// ─────────────────────────────────────────────────────────────
function LotCard({ lot, defaultWhatsappNumber }: { lot: Lote; defaultWhatsappNumber: string }) {
  const whatsappText = encodeURIComponent(
    `Hola! Estoy interesado en el lote: "${lot.titulo}" - ${lot.peso} kg - ${lot.localidad}`,
  );
  const phoneNumber = lot.telefono?.replace(/\D/g, "") || defaultWhatsappNumber || "5493492000000";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappText}`;

  return (
    <article className="card-hover bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm flex flex-col">
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lot.imageUrl}
          alt={lot.titulo}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
          <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
          Disponible
        </div>
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {lot.categoria}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/90 text-xs">
          <Eye className="w-3.5 h-3.5" />
          {lot.cantidad} uds.
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-stone-800 text-base mb-3 leading-tight">
          {lot.titulo}
        </h3>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Weight className="w-4 h-4 shrink-0 text-[#14532D]" />
            <span>{lot.peso} kg promedio</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <MapPin className="w-4 h-4 shrink-0 text-[#14532D]" />
            <span>{lot.localidad}</span>
          </div>
          {lot.telefono && (
            <div className="text-sm text-stone-600">Tel: {lot.telefono}</div>
          )}
        </div>
        <div className="mt-auto">
          <p className="text-sm font-semibold text-stone-900 mb-2">
            ${lot.precio.toLocaleString()} ARS
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            id={`lot-whatsapp-${lot.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#14532D] text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// Sponsor Ad Card
// ─────────────────────────────────────────────────────────────
function SponsorAdCard({ banner }: { banner: AdAsset }) {
  const isVideo = banner.esVideo ?? banner.type === "video";
  const className =
    "block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-md";

  const media = (
    <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
      {isVideo ? (
        <video
          src={banner.fileUrl}
          className="h-full w-full bg-black object-cover"
          controls
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.fileUrl}
          alt={banner.titulo ?? "Publicidad"}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );

  const caption = banner.titulo ? (
    <div className="p-3">
      <p className="text-sm font-medium text-stone-700 truncate">
        {banner.titulo}
      </p>
    </div>
  ) : null;

  if (banner.destino) {
    return (
      <a
        href={banner.destino}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {media}
        {caption}
      </a>
    );
  }

  return (
    <div className={className}>
      {media}
      {caption}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sponsors Widget
// ─────────────────────────────────────────────────────────────
function SponsorsWidget({ banners }: { banners: AdAsset[] }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-[#14532D]" />
        <h3 className="font-bold text-stone-700 text-base">
          Nuestros Auspiciantes
        </h3>
      </div>
      <div className="space-y-4">
        {banners.map((banner) => (
          <SponsorAdCard key={banner.id} banner={banner} />
        ))}
      </div>
      <a
        href="#"
        className="mt-4 block text-center text-xs font-semibold text-[#14532D] hover:underline"
      >
        → Ser auspiciante
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default async function HomePage() {
  const [store, noticias, siteConfig, banners] = await Promise.all([
    readStoreData(),
    readNewsArticles(),
    readSiteConfig(),
    readPublicidad(),
  ]);
  const marketPrices = await fetchDollarRates().catch(() => ({
    updatedAt: new Date().toISOString(),
    dolar: [],
    availableTypes: [],
  }));
  const siteName = store.siteName || "Desde el Campo 2026";
  const lotes = store.lotes.length > 0 ? store.lotes : defaultLotes;
  const whatsappNumber = siteConfig?.whatsappNumber || "5493492000000";
  const quienesSomosTitle = siteConfig?.quienesSomosTitle || "";
  const quienesSomosContent = siteConfig?.quienesSomosContent || "";
  const sortedNews = [...noticias].sort((a, b) => b.date.localeCompare(a.date));
  const selectedDollarRates = getSelectedDollarRates(marketPrices, store.dollarDisplayTypes);
  const sidebarBanners = banners
    .filter((banner) => (banner.activo ?? true) && (banner.slot ?? "sidebar") === "sidebar")
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  const tickerItems =
    selectedDollarRates.length > 0
      ? selectedDollarRates.map((item) => {
          const shortLabel = item.label.replace(/^Dolar\s+/i, "");
          const buy = item.buy === null ? "s/d" : item.buy.toLocaleString("es-AR", { maximumFractionDigits: 2 });
          const sell = item.sell === null ? "s/d" : item.sell.toLocaleString("es-AR", { maximumFractionDigits: 2 });
          return `💵 ${shortLabel} C: $${buy} V: $${sell}`;
        })
      : defaultTickerItems;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header siteName={siteName} whatsappNumber={whatsappNumber} />
      <MarketTicker items={tickerItems} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT: Instagram ── */}
          <section className="w-full lg:w-[360px] shrink-0 space-y-5">
            <InstagramWebhookEventsList />
          </section>

          {/* ── CENTER: Marketplace (50%) ── */}
          <section className="w-full lg:flex-1">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-7 rounded-full bg-[#14532D]" />
                <h1 className="font-extrabold text-stone-800 text-2xl">
                  Compra/Venta
                </h1>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                {lotes.length} activos
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {lotes.map((lot) => (
                <LotCard key={lot.id} lot={lot} defaultWhatsappNumber={whatsappNumber} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <a
                href="#"
                id="view-all-lots"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#14532D] text-[#14532D] font-semibold text-sm hover:bg-green-50 transition-colors"
              >
                Ver todos los lotes disponibles →
              </a>
            </div>
          </section>

          {/* ── RIGHT: Sidebar (25%) ── */}
          {sidebarBanners.length > 0 && (
            <aside className="w-full shrink-0 lg:w-1/4">
              <SponsorsWidget banners={sidebarBanners} />
            </aside>
          )}
        </div>

        <NewsSection news={sortedNews} />
      </main>

      {quienesSomosContent && (
        <QuienesSomosSection title={quienesSomosTitle} content={quienesSomosContent} />
      )}

      <footer className="mt-16 bg-[#1c1917] text-center py-6">
        <p className="text-stone-400 text-sm">
          © 2026 Desde el Campo · San Cristóbal, Santa Fe · Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}
