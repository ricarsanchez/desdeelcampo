export type DollarRate = {
  id: string;
  label: string;
  buy: number | null;
  sell: number | null;
  source: string;
  updatedAt: string;
};

export type DollarOption = {
  id: string;
  label: string;
};

export type MarketPricesState = {
  updatedAt: string;
  dolar: DollarRate[];
  availableTypes: DollarOption[];
};

type DolarApiItem = {
  casa?: string;
  nombre?: string;
  compra?: number | null;
  venta?: number | null;
  fechaActualizacion?: string;
  moneda?: string;
};

const DOLAR_API_URL = "https://dolarapi.com/v1/dolares";
const DOLLAR_PRIORITY = ["oficial", "blue", "bolsa", "contadoconliqui", "tarjeta", "mayorista", "cripto"];

function fallbackLabel(id: string) {
  return `Dolar ${id.charAt(0).toUpperCase()}${id.slice(1)}`;
}

function normalizeLabel(item: DolarApiItem, id: string) {
  const rawName = typeof item.nombre === "string" ? item.nombre.trim() : "";
  if (!rawName) {
    return fallbackLabel(id);
  }

  return /^d[oó]lar/i.test(rawName) ? rawName : `Dolar ${rawName}`;
}

function normalizeDollarItem(item: DolarApiItem): DollarRate | null {
  if (typeof item.casa !== "string") {
    return null;
  }

  const id = item.casa.trim().toLowerCase();
  if (!id) {
    return null;
  }

  return {
    id,
    label: normalizeLabel(item, id),
    buy: typeof item.compra === "number" ? item.compra : null,
    sell: typeof item.venta === "number" ? item.venta : null,
    source: "DolarApi",
    updatedAt:
      typeof item.fechaActualizacion === "string" && item.fechaActualizacion.trim()
        ? item.fechaActualizacion
        : new Date().toISOString(),
  };
}

function sortDollarRates(rates: DollarRate[]) {
  return [...rates].sort((left, right) => {
    const leftIndex = DOLLAR_PRIORITY.indexOf(left.id);
    const rightIndex = DOLLAR_PRIORITY.indexOf(right.id);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.label.localeCompare(right.label, "es");
    }
    if (leftIndex === -1) {
      return 1;
    }
    if (rightIndex === -1) {
      return -1;
    }
    return leftIndex - rightIndex;
  });
}

export async function fetchDollarRates(): Promise<MarketPricesState> {
  const response = await fetch(DOLAR_API_URL, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener la cotizacion del dolar desde DolarApi.");
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload)) {
    throw new Error("La respuesta de DolarApi no tiene el formato esperado.");
  }

  const rates = sortDollarRates(
    payload
      .map((item) => normalizeDollarItem(item as DolarApiItem))
      .filter((item): item is DollarRate => item !== null),
  );

  if (rates.length === 0) {
    throw new Error("DolarApi no devolvio cotizaciones utilizables.");
  }

  return {
    updatedAt: rates[0]?.updatedAt ?? new Date().toISOString(),
    dolar: rates,
    availableTypes: rates.map((item) => ({ id: item.id, label: item.label })),
  };
}

export function getSelectedDollarRates(snapshot: MarketPricesState, selectedTypes: string[]): DollarRate[] {
  const normalizedSelection = selectedTypes.map((item) => item.trim().toLowerCase()).filter(Boolean);
  const seen = new Set<string>();
  const selected = normalizedSelection
    .map((id) => snapshot.dolar.find((item) => item.id === id) ?? null)
    .filter((item): item is DollarRate => item !== null)
    .filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });

  if (selected.length > 0) {
    return selected;
  }

  return snapshot.dolar.filter((item) => item.id === "oficial" || item.id === "blue").slice(0, 2);
}
