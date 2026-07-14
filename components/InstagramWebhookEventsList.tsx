"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Images, Instagram, Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useInstagramWebhookEvents } from "../hooks/useInstagramWebhookEvents";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

function truncateCaption(text: string | null, maxLength = 120) {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

const PAGE_SIZE = 8;

export default function InstagramWebhookEventsList() {
  const [page, setPage] = useState(0);
  const offset = page * PAGE_SIZE;
  const { events, total, isLoading, error, refetch } = useInstagramWebhookEvents({
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasNextPage = page + 1 < totalPages;

  function goPrevious() {
    if (page > 0) setPage((current) => current - 1);
  }

  function goNext() {
    if (page + 1 < totalPages) setPage((current) => current + 1);
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <header className="flex items-center gap-2 px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white">
            <Instagram className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-stone-800">Instagram</h2>
            <p className="text-xs text-stone-400">{total} publicaciones</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isLoading}
          className="ml-auto rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 disabled:opacity-50 transition-colors"
          title="Recargar"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </header>

      <div className="p-4">
        {isLoading && (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="rounded-xl border border-stone-200 overflow-hidden">
                <div className="aspect-square bg-stone-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-stone-200 rounded w-full" />
                  <div className="h-3 bg-stone-200 rounded w-2/3" />
                  <div className="h-2 bg-stone-100 rounded w-1/2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Instagram className="h-10 w-10 text-stone-300 mb-3" />
            <p className="text-sm text-stone-500">Todavia no hay publicaciones.</p>
            <p className="text-xs text-stone-400 mt-1">Las novedades de Instagram apareceran aca.</p>
          </div>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {events.map((event) => (
              <a
                key={`${event.media_id}-${event.created_at}`}
                href={event.permalink ?? "#"}
                target={event.permalink ? "_blank" : undefined}
                rel={event.permalink ? "noopener noreferrer" : undefined}
                className={`group relative block rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:border-pink-200 hover:z-10 ${
                  !event.permalink ? "pointer-events-none" : ""
                }`}
              >
                <div className="aspect-square bg-stone-100 overflow-hidden">
                  {event.media_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.media_url}
                      alt={event.caption ?? "Publicacion de Instagram"}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-300">
                      <Instagram className="h-8 w-8" />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {event.media_type === "CAROUSEL_ALBUM" && (
                    <span className="pointer-events-none absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded bg-black/40 text-white backdrop-blur-sm">
                      <Images className="h-3 w-3" />
                    </span>
                  )}
                  {event.media_type === "VIDEO" && (
                    <span className="pointer-events-none absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded bg-black/40 text-white backdrop-blur-sm pl-px">
                      <Play className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="p-3">
                  {event.caption && (
                    <div className="min-h-[5rem]">
                      <p className="text-xs leading-relaxed text-stone-700 line-clamp-2 group-hover:line-clamp-4 transition-all duration-300">
                        {truncateCaption(event.caption)}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <p className="text-[10px] text-stone-400">{formatDate(event.created_at)}</p>
                    <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-pink-600 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Ver publicación
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {!isLoading && !error && total > PAGE_SIZE && (
        <footer className="flex items-center justify-between border-t border-stone-100 px-4 py-3">
          <span className="text-xs text-stone-400">
            Pag. {page + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrevious}
              disabled={page === 0}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!hasNextPage}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      )}
    </section>
  );
}
