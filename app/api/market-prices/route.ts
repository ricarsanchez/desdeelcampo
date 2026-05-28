import { NextResponse } from "next/server";
import {
  fetchDollarRates,
  getSelectedDollarRates,
} from "../_utils/marketPrices";
import {
  DEFAULT_DOLLAR_DISPLAY_TYPES,
  readStoreData,
  writeStoreData,
} from "../_utils/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [store, prices] = await Promise.all([readStoreData(), fetchDollarRates()]);
    const selectedTypes =
      store.dollarDisplayTypes.length > 0
        ? store.dollarDisplayTypes
        : [...DEFAULT_DOLLAR_DISPLAY_TYPES];

    return NextResponse.json({
      ok: true,
      prices: {
        ...prices,
        selectedTypes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { selectedTypes } = body as {
      selectedTypes?: string[];
    };

    if (!Array.isArray(selectedTypes)) {
      return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
    }

    const normalizedSelection = Array.from(
      new Set(
        selectedTypes
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
      ),
    );

    if (normalizedSelection.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Debes seleccionar al menos un tipo de dólar." },
        { status: 400 },
      );
    }

    const [store, prices] = await Promise.all([readStoreData(), fetchDollarRates()]);

    const validSelection = normalizedSelection.filter((id) =>
      prices.availableTypes.some((option) => option.id === id),
    );

    if (validSelection.length === 0) {
      return NextResponse.json(
        { ok: false, error: "La selección no coincide con los tipos disponibles en DolarApi." },
        { status: 400 },
      );
    }

    await writeStoreData({
      ...store,
      dollarDisplayTypes: validSelection,
    });

    return NextResponse.json({
      ok: true,
      prices: {
        ...prices,
        selectedTypes: validSelection,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}
