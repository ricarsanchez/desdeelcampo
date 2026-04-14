"use client";

import {
  Wheat,
  MessageCircle,
  MapPin,
  Weight,
  Sun,
  Wind,
  Droplets,
  TrendingUp,
  Eye,
  Star,
} from "lucide-react";

// ─── Instagram SVG (not in lucide-react) ──────────────────────
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const tickerItems = [
  "🐄 Novillo: $450/kg",
  "🐂 Ternero: $520/kg",
  "🐮 Vaca: $380/kg",
  "🌱 Soja: $75.000/tn",
  "🌽 Maíz: $38.000/tn",
];

const instagramNews = [
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80",
    title: "Récord histórico en el remate de hacienda de San Cristóbal",
    date: "12 Abr 2026",
    likes: "1.2k",
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80",
    title: "Nueva cosecha de soja: perspectivas para la zona norte de SF",
    date: "11 Abr 2026",
    likes: "987",
  },
  {
    id: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80",
    title: "Tecnología ganadera: productores adoptan el rastreo satelital",
    date: "10 Abr 2026",
    likes: "742",
  },
];

const lots = [
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80",
    title: "50 Terneros Invernada",
    weight: "180 kg promedio",
    location: "San Cristóbal, SF",
    category: "Bovinos",
    views: 234,
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
    title: "30 Novillos Gordos",
    weight: "450 kg promedio",
    location: "Ceres, SF",
    category: "Bovinos",
    views: 187,
  },
  {
    id: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80",
    title: "80 Terneras Vaquillonas",
    weight: "220 kg promedio",
    location: "Tostado, SF",
    category: "Bovinos",
    views: 312,
  },
  {
    id: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80",
    title: "25 Vacas Preñadas",
    weight: "400 kg promedio",
    location: "San Cristóbal, SF",
    category: "Bovinos",
    views: 421,
  },
];

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────
function Header() {
  const whatsappUrl =
    "https://wa.me/5493492000000?text=Hola!%20Me%20comunico%20desde%20Desde%20el%20Campo.";
  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7] border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-[#14532D] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Wheat className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <span className="block font-extrabold text-lg tracking-tight text-[#14532D]">
              Desde el Campo
            </span>
            <span className="block text-xs text-stone-500 font-medium -mt-0.5">
              2026 · San Cristóbal, SF
            </span>
          </div>
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {["Inicio", "Noticias", "Remates", "Contacto"].map((item) => (
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
function MarketTicker() {
  const doubled = [...tickerItems, ...tickerItems];
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
// Instagram Card
// ─────────────────────────────────────────────────────────────
function InstagramCard({ news }: { news: (typeof instagramNews)[0] }) {
  return (
    <article className="card-hover bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
      <div className="relative h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={news.imageUrl}
          alt={news.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-semibold text-stone-700">
            {news.likes}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-medium text-stone-800 leading-snug line-clamp-2 mb-2">
          {news.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-400">{news.date}</span>
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
            <InstagramIcon className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// Lot Card
// ─────────────────────────────────────────────────────────────
function LotCard({ lot }: { lot: (typeof lots)[0] }) {
  const whatsappText = encodeURIComponent(
    `Hola! Estoy interesado en el lote: "${lot.title}" - ${lot.weight} - ${lot.location}`
  );
  const whatsappUrl = `https://wa.me/5493492000000?text=${whatsappText}`;

  return (
    <article className="card-hover bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm flex flex-col">
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lot.imageUrl}
          alt={lot.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
          <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
          Disponible
        </div>
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {lot.category}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/90 text-xs">
          <Eye className="w-3.5 h-3.5" />
          {lot.views}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-stone-800 text-base mb-3 leading-tight">
          {lot.title}
        </h3>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Weight className="w-4 h-4 shrink-0 text-[#14532D]" />
            <span>{lot.weight}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <MapPin className="w-4 h-4 shrink-0 text-[#14532D]" />
            <span>{lot.location}</span>
          </div>
        </div>
        <div className="mt-auto">
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
// Weather Widget
// ─────────────────────────────────────────────────────────────
function WeatherWidget() {
  const forecast = [
    { day: "Mar", icon: "🌤️", temp: "26°" },
    { day: "Mié", icon: "⛅", temp: "22°" },
    { day: "Jue", icon: "🌧️", temp: "18°" },
    { day: "Vie", icon: "☀️", temp: "27°" },
  ];
  return (
    <div
      className="rounded-2xl p-5 text-white shadow-lg"
      style={{
        background: "linear-gradient(135deg, #0ea5e9 0%, #14532D 100%)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
            Clima
          </p>
          <p className="font-bold text-base mt-0.5">San Cristóbal, SF</p>
        </div>
        <Sun className="w-10 h-10 text-yellow-300 drop-shadow-lg" />
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-6xl font-extrabold leading-none">24°</span>
        <span className="text-white/70 text-lg mb-1">C</span>
      </div>
      <p className="text-white/90 text-sm font-medium mb-4">
        ☀️ Soleado — Cielo despejado
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-200" />
          <div>
            <p className="text-white/60 text-xs">Humedad</p>
            <p className="font-semibold text-sm">42%</p>
          </div>
        </div>
        <div className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
          <Wind className="w-4 h-4 text-blue-200" />
          <div>
            <p className="text-white/60 text-xs">Viento</p>
            <p className="font-semibold text-sm">18 km/h</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 pt-4">
        <p className="text-white/60 text-xs mb-2 font-medium uppercase tracking-wider">
          Próximos días
        </p>
        <div className="flex justify-between text-center">
          {forecast.map((d) => (
            <div key={d.day}>
              <p className="text-white/60 text-xs">{d.day}</p>
              <p className="text-xl my-0.5">{d.icon}</p>
              <p className="text-white font-semibold text-sm">{d.temp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sponsors Widget
// ─────────────────────────────────────────────────────────────
function SponsorsWidget() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-[#14532D]" />
        <h3 className="font-bold text-stone-700 text-base">
          Nuestros Auspiciantes
        </h3>
      </div>
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
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      <MarketTicker />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT: Instagram News (25%) ── */}
          <aside className="w-full lg:w-1/4 shrink-0">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <InstagramIcon className="w-3 h-3 text-white" />
              </div>
              <h2 className="font-bold text-stone-700 text-lg">
                Últimas de Instagram
              </h2>
            </div>
            <div className="space-y-4">
              {instagramNews.map((n) => (
                <InstagramCard key={n.id} news={n} />
              ))}
            </div>
            <a
              href="#"
              className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-stone-200 text-stone-500 text-sm font-medium hover:border-purple-400 hover:text-purple-600 transition-all"
            >
              Ver más en Instagram
            </a>
          </aside>

          {/* ── CENTER: Marketplace (50%) ── */}
          <section className="w-full lg:flex-1">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-7 rounded-full bg-[#14532D]" />
                <h1 className="font-extrabold text-stone-800 text-2xl">
                  Lotes Disponibles
                </h1>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                {lots.length} activos
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {lots.map((lot) => (
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
            <WeatherWidget />
            <SponsorsWidget />
            <QuickLinksWidget />
          </aside>
        </div>
      </main>

      <footer className="mt-16 bg-[#1c1917] text-center py-6">
        <p className="text-stone-400 text-sm">
          © 2026 Desde el Campo · San Cristóbal, Santa Fe · Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}
