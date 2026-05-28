import {
  MessageCircle,
  MapPin,
  Weight,
  TrendingUp,
  Eye,
} from "lucide-react";
import MarketPrices from "../components/MarketPrices";
import InstagramWebhookEventsList from "../components/InstagramWebhookEventsList";
import { fetchDollarRates, getSelectedDollarRates } from "./api/_utils/marketPrices";
import { readStoreData, type Lote, type AdAsset } from "./api/_utils/store";
import { readNewsArticles, type NewsArticle } from "../lib/news";
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

function Header({ siteName }: { siteName: string }) {
  const whatsappUrl =
    `https://wa.me/5493492000000?text=Hola!%20Me%20comunico%20desde%20${encodeURIComponent(
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
          {["Inicio", "Quienes Somos", "Remates", "Contacto"].map((item) => (
            <a
              key={item}
              href="#"
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-green-800 hover:bg-green-50 transition-all"
            >
              {item}
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
// Lot Card
// ─────────────────────────────────────────────────────────────
function LotCard({ lot }: { lot: Lote }) {
  const whatsappText = encodeURIComponent(
    `Hola! Estoy interesado en el lote: "${lot.titulo}" - ${lot.peso} kg - ${lot.localidad}`,
  );
  const phoneNumber = lot.telefono?.replace(/\D/g, "") || "5493492000000";
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
// Ad Space Widget
// ─────────────────────────────────────────────────────────────
function AdSpaceWidget() {
  const adSlots = [
    { id: "leaderboard", label: "Banner Horizontal", size: "1200 x 300", className: "aspect-[4/1] min-h-[84px]" },
    { id: "square", label: "Banner Cuadrado", size: "600 x 600", className: "aspect-square min-h-[140px]" },
    { id: "vertical", label: "Banner Vertical", size: "300 x 600", className: "aspect-[1/2] min-h-[180px]" },
  ];

  return (
    <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 rounded-full bg-[#14532D]" />
        <h3 className="font-bold text-stone-700 text-base">Espacio Publicitario</h3>
      </div>
      <p className="text-xs text-stone-500 mb-4">
        Area preparada para banners o imagenes de distintos formatos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {adSlots.map((slot) => (
          <div
            key={slot.id}
            id={`ad-slot-${slot.id}`}
            className={`rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/80 ${slot.className} flex items-center justify-center text-center px-3`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{slot.label}</p>
              <p className="text-[11px] text-stone-400 mt-1">{slot.size}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
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
      {banners.length === 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              id={`sponsor-slot-${i}`}
              className="sponsor-slot rounded-xl h-20 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-slate-400 text-xs font-medium text-center px-2">
                Espacio Publicitario
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {banners.slice(0, 4).map((banner) => (
            <a
              key={banner.id}
              href={banner.destino}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden border border-stone-200 bg-slate-50 shadow-sm hover:border-emerald-300 transition-colors"
            >
              {banner.type === "banner" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={banner.fileUrl}
                  alt={banner.fileName}
                  className="h-20 w-full object-cover"
                />
              ) : (
                <video
                  src={banner.fileUrl}
                  className="h-20 w-full bg-black object-cover"
                  muted
                  playsInline
                />
              )}
              <div className="p-3">
                <p className="text-xs font-semibold text-stone-500">{banner.type}</p>
                <p className="text-sm font-medium text-stone-700 truncate">
                  {banner.fileName}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
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
// Quick Links Widget
// ─────────────────────────────────────────────────────────────
function QuickLinksWidget() {
  const links = [
    "📋 Ver todos los remates",
    "📰 Últimas noticias",
    "📞 Contactar corredor",
  ];
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-[#451A03]" />
        <h3 className="font-bold text-stone-700 text-base">Accesos Rápidos</h3>
      </div>
      <div className="space-y-2">
        {links.map((l) => (
          <a
            key={l}
            href="#"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-stone-50 hover:bg-green-50 hover:text-green-800 transition-colors text-sm text-stone-700 font-medium"
          >
            {l}
          </a>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default async function HomePage() {
  const [store, noticias] = await Promise.all([readStoreData(), readNewsArticles()]);
  const marketPrices = await fetchDollarRates().catch(() => ({
    updatedAt: new Date().toISOString(),
    dolar: [],
    availableTypes: [],
  }));
  const siteName = store.siteName || "Desde el Campo 2026";
  const lotes = store.lotes.length > 0 ? store.lotes : defaultLotes;
  const sortedNews = [...noticias].sort((a, b) => b.date.localeCompare(a.date));
  const selectedDollarRates = getSelectedDollarRates(marketPrices, store.dollarDisplayTypes);
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
      <Header siteName={siteName} />
      <MarketTicker items={tickerItems} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT: Noticias (25%) ── */}
          <InstagramWebhookEventsList />

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
                <LotCard key={lot.id} lot={lot} />
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
          <aside className="w-full lg:w-1/4 shrink-0 space-y-5">
            <AdSpaceWidget />
            <MarketPrices rates={selectedDollarRates} updatedAt={marketPrices.updatedAt} />
            <SponsorsWidget banners={store.banners} />
            <QuickLinksWidget />
          </aside>
        </div>

        <NewsSection news={sortedNews} />
      </main>

      <footer className="mt-16 bg-[#1c1917] text-center py-6">
        <p className="text-stone-400 text-sm">
          © 2026 Desde el Campo · San Cristóbal, Santa Fe · Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}
