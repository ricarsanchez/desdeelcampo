"use client";

import { Camera, ExternalLink, Images, Play } from "lucide-react";
import { useInstagramWebhookEvents } from "../hooks/useInstagramWebhookEvents";

const PAGE_SIZE = 6;
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/desdeelcampo/";

function truncateCaption(text: string | null, maxLength = 120) {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "\u2026";
}

export default function InstagramWebhookEventsList() {
  const { events, total, isLoading, error } = useInstagramWebhookEvents({
    limit: PAGE_SIZE,
    offset: 0,
  });

  return (
    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <header className="flex items-center gap-2 px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white">
            <Camera className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-stone-800">Instagram</h2>
            <p className="text-xs text-stone-400">{total} publicaciones</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {isLoading && (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="rounded-xl border border-stone-200 overflow-hidden">
                <div className="aspect-square bg-stone-200" />
                <div className="p-2.5 space-y-1.5">
                  <div className="h-2.5 bg-stone-200 rounded w-full" />
                  <div className="h-2.5 bg-stone-200 rounded w-3/4" />
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
            <Camera className="h-10 w-10 text-stone-300 mb-3" />
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
                className={`group relative block rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:shadow-stone-300/50 hover:border-pink-200 hover:z-10 ${
                  !event.permalink ? "pointer-events-none" : ""
                }`}
              >
                <div className="relative aspect-square bg-stone-100 overflow-hidden">
                  {event.media_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.media_url}
                      alt={event.caption ?? "Publicacion de Instagram"}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-300">
                      <Camera className="h-8 w-8" />
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="pointer-events-none absolute inset-0 flex items-end p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white">
                      Ver publicacion
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>

                  {event.media_type === "CAROUSEL_ALBUM" && (
                    <span className="pointer-events-none absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded bg-black/35 text-white backdrop-blur-sm">
                      <Images className="h-3 w-3" />
                    </span>
                  )}
                  {event.media_type === "VIDEO" && (
                    <span className="pointer-events-none absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded bg-black/35 text-white backdrop-blur-sm pl-px">
                      <Play className="h-3 w-3" />
                    </span>
                  )}
                </div>

                {event.caption && (
                  <div className="p-2.5">
                    <p className="text-[11px] leading-relaxed text-stone-600 line-clamp-2 group-hover:line-clamp-4 transition-all duration-300">
                      {truncateCaption(event.caption)}
                    </p>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      {!isLoading && !error && events.length > 0 && (
        <div className="px-4 pb-4">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Camera className="h-4 w-4" />
            Ver mas en Instagram
          </a>
        </div>
      )}
    </section>
  );
}
