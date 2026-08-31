import {
  Beef,
  Camera,
  House,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Inicio", href: "#inicio", icon: House },
  { label: "Lotes", href: "#compra-venta", icon: Beef },
  { label: "Instagram", href: "#instagram", icon: Camera },
  { label: "Precios", href: "#precios-hoy", icon: TrendingUp },
] as const;

export function MobileBottomNav({ contactUrl }: { contactUrl: string }) {
  const isExternalContact = contactUrl.startsWith("https://");

  return (
    <>
      <div
        className="md:hidden"
        style={{ height: "calc(4.5rem + env(safe-area-inset-bottom))" }}
        aria-hidden="true"
      />
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-[#FDFBF7]/95 shadow-[0_-4px_18px_rgba(28,25,23,0.10)] backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navegación inferior"
      >
        <div className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-5 px-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold leading-none text-stone-600 transition-colors hover:bg-green-50 hover:text-[#14532D] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#14532D]"
              aria-label={label}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </a>
          ))}
          <a
            href={contactUrl}
            target={isExternalContact ? "_blank" : undefined}
            rel={isExternalContact ? "noopener noreferrer" : undefined}
            className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold leading-none text-stone-600 transition-colors hover:bg-green-50 hover:text-[#14532D] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#14532D]"
            aria-label="Contacto"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <span className="max-w-full truncate">Contacto</span>
          </a>
        </div>
      </nav>
    </>
  );
}
