import type { DollarRate } from "../app/api/_utils/marketPrices";

type MarketPricesProps = {
  rates: DollarRate[];
  updatedAt: string;
};

function formatPrice(value: number | null) {
  if (value === null) {
    return "No disponible";
  }

  return `$${value.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
}

export default function MarketPrices({ rates, updatedAt }: MarketPricesProps) {

  return (
    <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400 font-semibold">
            Divisas
          </p>
          <h2 className="text-lg font-bold text-stone-900">Cotizacion del Dolar</h2>
        </div>
        <span className="text-[11px] uppercase tracking-[0.3em] text-emerald-700 font-semibold">
          DolarApi
        </span>
      </div>
    </section>
  );
}
