"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useInstagramWebhookEvents } from "../hooks/useInstagramWebhookEvents";

const PAGE_SIZE_STORAGE_KEY = "instagramEventsPageSize";
const ALLOWED_PAGE_SIZES = [10, 20, 50] as const;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-AR");
}

export default function InstagramWebhookEventsList() {
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);
  const offset = page * pageSize;
  const { events, total, isLoading, error, refetch } = useInstagramWebhookEvents({ limit: pageSize, offset });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
      if (!saved) return;

      const parsed = Number.parseInt(saved, 10);
      if (ALLOWED_PAGE_SIZES.includes(parsed as (typeof ALLOWED_PAGE_SIZES)[number])) {
        setPageSize(parsed);
      }
    } catch {
      // Ignora errores de acceso a storage en navegadores restringidos.
    }
  }, []);

  const hasPreviousPage = page > 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasNextPage = page + 1 < totalPages;

  function goPrevious() {
    if (page > 0) {
      setPage((current) => Math.max(0, current - 1));
    }
  }

  function goNext() {
    if (page + 1 < totalPages) {
      setPage((current) => current + 1);
    }
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(0);
    try {
      window.localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(value));
    } catch {
      // Ignora errores de acceso a storage en navegadores restringidos.
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Publicaciones de Instagram</h2>
          <p className="text-sm text-stone-500">
            Eventos recibidos desde el webhook. Página {page + 1} de {totalPages}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700">
            <span className="text-stone-500">Por página</span>
            <select
              value={pageSize}
              onChange={(event) => handlePageSizeChange(Number(event.target.value))}
              className="bg-transparent outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <button
            type="button"
            onClick={goPrevious}
            disabled={!hasPreviousPage || isLoading}
            className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNextPage || isLoading}
            className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Recargar
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Cargando publicaciones...</p>}

      {!isLoading && error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {!isLoading && !error && events.length === 0 && (
        <p className="text-sm text-stone-500">Todavía no hay publicaciones registradas.</p>
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events.map((event) => (
            <article key={`${event.media_id}-${event.created_at}`} className="rounded-xl border border-stone-200 p-4">
              {event.media_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.media_url}
                  alt={event.caption ?? "Publicación de Instagram"}
                  className="mb-3 h-44 w-full rounded-lg object-cover"
                />
              )}

              <p className="mb-2 text-sm text-stone-800">{event.caption ?? "Sin caption"}</p>

              {event.permalink ? (
                <a
                  href={event.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-emerald-700 hover:underline"
                >
                  Ver publicación en Instagram
                </a>
              ) : (
                <p className="text-sm text-stone-500">Sin permalink disponible</p>
              )}

              <p className="mt-3 text-xs text-stone-400">{formatDate(event.created_at)}</p>
            </article>
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
          <span>
            {total === 0
              ? "Sin resultados"
              : `Mostrando ${offset + 1} al ${Math.min(offset + events.length, total)} de ${total}`}
          </span>
          <span>Offset {offset}</span>
        </div>
      )}
    </section>
  );
}
