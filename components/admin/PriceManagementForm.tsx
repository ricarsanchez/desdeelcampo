"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type DollarOption = {
  id: string;
  label: string;
  buy: number | null;
  sell: number | null;
};

type PriceManagementFormProps = {
  initialSelectedTypes: string[];
  availableOptions: DollarOption[];
  updatedAt: string;
  onSave: (selectedTypes: string[]) => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
};

export default function PriceManagementForm({
  initialSelectedTypes,
  availableOptions,
  updatedAt,
  onSave,
  isSaving,
  saveError,
}: PriceManagementFormProps) {
  const [selectedTypes, setSelectedTypes] = useState(initialSelectedTypes);

  useEffect(() => {
    setSelectedTypes(initialSelectedTypes);
  }, [initialSelectedTypes]);

  const canSave = useMemo(() => {
    return selectedTypes.length > 0;
  }, [selectedTypes]);

  function handleToggle(id: string) {
    setSelectedTypes((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      return [...current, id];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave || isSaving) return;
    await onSave(selectedTypes);
  }

  function formatPrice(value: number | null) {
    if (value === null) {
      return "No disponible";
    }

    return `$${value.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {availableOptions.map((option) => (
          <label key={option.id} className="block rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-slate-700">{option.label}</span>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{option.id}</p>
              </div>
              <input
                type="checkbox"
                checked={selectedTypes.includes(option.id)}
                onChange={() => handleToggle(option.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Compra</p>
                <p className="mt-1 font-semibold text-slate-900">{formatPrice(option.buy)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Venta</p>
                <p className="mt-1 font-semibold text-slate-900">{formatPrice(option.sell)}</p>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Fuente actual</p>
        <p>Las cotizaciones se consultan en vivo desde DolarApi cada vez que se recarga la pagina.</p>
        <p className="mt-2 text-xs text-slate-500">Última actualización: {new Date(updatedAt).toLocaleString("es-AR")}</p>
      </div>

      {saveError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {saveError}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={!canSave || isSaving}
          className="inline-flex items-center justify-center rounded-3xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          {isSaving ? "Guardando..." : "Guardar tipos visibles"}
        </button>
      </div>
    </form>
  );
}
