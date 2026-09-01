import {
  MessageCircle,
  MapPin,
  Weight,
  TrendingUp,
  Eye,
  Info,
} from "lucide-react";
import InstagramWebhookEventsList from "../components/InstagramWebhookEventsList";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { SiteHeader } from "../components/SiteHeader";
import { fetchDollarRates, getSelectedDollarRates } from "./api/_utils/marketPrices";
import { readStoreData, type Lote, type AdAsset } from "./api/_utils/store";
import { readSiteConfig } from "./api/_utils/siteConfig";
import { readPublicidad } from "./api/_utils/publicidad";
import { readNewsArticles } from "../lib/news";
import { NewsSection } from "../components/NewsSection";
import {
  normalizePublicidadSlot,
  type PublicidadSlot,
} from "../lib/publicidadSlots";

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
// Market Ticker
// ─────────────────────────────────────────────────────────────
function MarketTicker({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div id="precios-hoy" className="w-full scroll-mt-24 overflow-hidden bg-[#451A03] py-2.5">
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
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#14532D] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
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
function SponsorAdCard({
  banner,
  variant = "sidebar",
}: {
  banner: AdAsset;
  variant?: "sidebar" | "main";
}) {
  const isVideo = banner.esVideo ?? banner.type === "video";
  const className =
    "block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-md";
  const mediaClassName =
    variant === "main"
      ? "aspect-[2/1] w-full overflow-hidden bg-stone-100 sm:aspect-[4/1]"
      : "h-56 w-full overflow-hidden bg-white";
  const videoClassName =
    variant === "main"
      ? "h-full w-full bg-black object-cover"
      : "h-full w-full bg-black object-contain";
  const imageClassName =
    variant === "main"
      ? "h-full w-full object-cover"
      : "h-full w-full object-contain p-2";

  const media = (
    <div className={mediaClassName}>
      {isVideo ? (
        <video
          src={banner.fileUrl}
          className={videoClassName}
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
          className={imageClassName}
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
function SponsorsWidget({
  banners,
  showHeading,
  position,
  sponsorContactUrl,
}: {
  banners: AdAsset[];
  showHeading: boolean;
  position: "top" | "middle" | "bottom";
  sponsorContactUrl: string;
}) {
  const positionClassName =
    position === "middle" ? "lg:my-auto" : position === "bottom" ? "lg:mt-auto" : "";

  return (
    <div
      className={`rounded-2xl border border-stone-100 bg-white p-5 shadow-sm ${positionClassName}`}
    >
      {showHeading && (
        <div className="mb-4 flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-[#14532D]" />
          <h3 className="text-base font-bold text-stone-700">Nuestros Auspiciantes</h3>
        </div>
      )}
      <div className="space-y-4">
        {banners.map((banner) => (
          <SponsorAdCard key={banner.id} banner={banner} />
        ))}
      </div>
      {showHeading && (
        <a
          href={sponsorContactUrl}
          target={sponsorContactUrl.startsWith("https://") ? "_blank" : undefined}
          rel={sponsorContactUrl.startsWith("https://") ? "noopener noreferrer" : undefined}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-[#14532D] hover:bg-green-50 hover:underline"
        >
          → Ser auspiciante
        </a>
      )}
    </div>
  );
}

function MainBannerZone({ banners }: { banners: AdAsset[] }) {
  return (
    <div className="my-5 space-y-4" aria-label="Publicidades centrales">
      {banners.map((banner) => (
        <SponsorAdCard key={banner.id} banner={banner} variant="main" />
      ))}
    </div>
  );
}

function LotesGrid({
  lotes,
  whatsappNumber,
  className = "",
}: {
  lotes: Lote[];
  whatsappNumber: string;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${className}`}>
      {lotes.map((lot) => (
        <LotCard key={lot.id} lot={lot} defaultWhatsappNumber={whatsappNumber} />
      ))}
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
  const configuredWhatsappNumber = siteConfig?.whatsappNumber?.replace(/\D/g, "") ?? "";
  const whatsappNumber = configuredWhatsappNumber || "5493492000000";
  const sponsorContactUrl = configuredWhatsappNumber
    ? `https://wa.me/${configuredWhatsappNumber}?text=${encodeURIComponent(
        "Hola, quiero consultar por publicidad en Desde el Campo.",
      )}`
    : "#contacto";
  const mobileContactUrl = configuredWhatsappNumber
    ? `https://wa.me/${configuredWhatsappNumber}?text=${encodeURIComponent(
        "Hola, me comunico desde Desde el Campo.",
      )}`
    : "#contacto";
  const quienesSomosTitle = siteConfig?.quienesSomosTitle || "";
  const quienesSomosContent = siteConfig?.quienesSomosContent || "";
  const sortedNews = [...noticias].sort((a, b) => b.date.localeCompare(a.date));
  const selectedDollarRates = getSelectedDollarRates(marketPrices, store.dollarDisplayTypes);
  const activeBanners = banners.filter((banner) => banner.activo ?? true);
  const bannersForSlot = (slot: PublicidadSlot) =>
    activeBanners
      .filter((banner) => normalizePublicidadSlot(banner.slot) === slot)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  const sidebarTopBanners = bannersForSlot("sidebar_top");
  const sidebarMiddleBanners = bannersForSlot("sidebar_middle");
  const sidebarBottomBanners = bannersForSlot("sidebar_bottom");
  const mainBanners = bannersForSlot("main_banner");
  const sidebarZones = [
    { id: "top", banners: sidebarTopBanners },
    { id: "middle", banners: sidebarMiddleBanners },
    { id: "bottom", banners: sidebarBottomBanners },
  ] as const;
  const visibleSidebarZones = sidebarZones.filter((zone) => zone.banners.length > 0);
  const firstRowLotes = lotes.slice(0, 2);
  const remainingLotes = lotes.slice(2);
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
    <div id="inicio" className="min-h-screen scroll-mt-24 bg-[#FDFBF7]">
      <SiteHeader siteName={siteName} whatsappNumber={whatsappNumber} />
      <MarketTicker items={tickerItems} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT: Instagram ── */}
          <section id="instagram" className="w-full scroll-mt-24 space-y-5 lg:w-[360px] lg:shrink-0">
            <InstagramWebhookEventsList />
          </section>

          {/* ── CENTER: Marketplace (50%) ── */}
          <section id="compra-venta" className="w-full scroll-mt-24 lg:flex-1">
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
            {mainBanners.length > 0 ? (
              <>
                <LotesGrid lotes={firstRowLotes} whatsappNumber={whatsappNumber} />
                <MainBannerZone banners={mainBanners} />
                {remainingLotes.length > 0 && (
                  <LotesGrid lotes={remainingLotes} whatsappNumber={whatsappNumber} />
                )}
              </>
            ) : (
              <LotesGrid lotes={lotes} whatsappNumber={whatsappNumber} />
            )}
            <div className="mt-6 text-center">
              <a
                href="#"
                id="view-all-lots"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-[#14532D] px-6 py-3 text-sm font-semibold text-[#14532D] transition-colors hover:bg-green-50"
              >
                Ver todos los lotes disponibles →
              </a>
            </div>
          </section>

          {/* ── RIGHT: Sidebar (25%) ── */}
          {visibleSidebarZones.length > 0 && (
            <aside className="flex w-full shrink-0 self-stretch lg:w-1/4">
              <div className="flex w-full flex-1 flex-col gap-8">
                {visibleSidebarZones.map((zone, index) => (
                  <SponsorsWidget
                    key={zone.id}
                    banners={zone.banners}
                    showHeading={index === 0}
                    position={zone.id}
                    sponsorContactUrl={sponsorContactUrl}
                  />
                ))}
              </div>
            </aside>
          )}
        </div>

        <NewsSection news={sortedNews} />
      </main>

      {quienesSomosContent && (
        <QuienesSomosSection title={quienesSomosTitle} content={quienesSomosContent} />
      )}

      <footer id="contacto" className="mt-16 bg-[#1c1917] px-4 py-6 text-center">
        <p className="text-sm leading-relaxed text-stone-400">
          © 2026 Desde el Campo · San Cristóbal, Santa Fe · Todos los derechos reservados
        </p>
      </footer>
      <MobileBottomNav contactUrl={mobileContactUrl} />
    </div>
  );
}
