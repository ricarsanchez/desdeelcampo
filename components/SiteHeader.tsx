"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";

const DEFAULT_LOGO_URL = "/logo.png";

const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Compra/Venta", href: "#compra-venta" },
  { label: "Instagram", href: "#instagram" },
  { label: "Últimas Noticias", href: "#ultimas-noticias" },
  { label: "Contacto", href: "#contacto" },
] as const;

export function SiteHeader({
  siteName,
  whatsappNumber,
}: {
  siteName: string;
  whatsappNumber: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const phone = whatsappNumber || "5493492000000";
  const whatsappUrl = `https://wa.me/${phone}?text=Hola!%20Me%20comunico%20desde%20${encodeURIComponent(
    siteName,
  )}.`;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#FDFBF7] shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
        <a href="#inicio" className="group shrink-0" aria-label="Ir al inicio">
          <div className="w-[280px] max-w-[48vw] overflow-hidden transition-transform group-hover:scale-105 sm:max-w-[52vw] lg:max-w-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEFAULT_LOGO_URL}
              alt="Logo del sitio"
              className="h-auto max-h-[130px] w-full object-contain"
            />
          </div>
        </a>

        <nav className="hidden items-center justify-center gap-1 lg:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-all hover:bg-green-50 hover:text-green-800"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-50 lg:hidden"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="whatsapp-header-cta"
            aria-label="WhatsApp"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#14532D] px-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 sm:px-4"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-stone-200 bg-[#FDFBF7] px-4 pb-4 pt-2 lg:hidden"
          aria-label="Navegación móvil"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-stone-700 transition-colors hover:bg-green-50 hover:text-green-800"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
