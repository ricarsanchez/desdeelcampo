"use client";

import { useCallback, useEffect, useState } from "react";

export type InstagramWebhookEvent = {
  caption: string | null;
  media_id: string;
  permalink: string | null;
  created_at: string;
  media_url: string | null;
  media_type: string | null;
};

type UseInstagramWebhookEventsResult = {
  events: InstagramWebhookEvent[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

type UseInstagramWebhookEventsOptions = {
  limit?: number;
  offset?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringOrNull(value: unknown) {
  return typeof value === "string" ? value : null;
}

function parseEvent(item: unknown): InstagramWebhookEvent | null {
  if (!isRecord(item)) return null;

  const mediaId = item.media_id;
  if (typeof mediaId !== "string" || !mediaId.trim()) return null;

  return {
    caption: toStringOrNull(item.caption),
    media_id: mediaId,
    permalink: toStringOrNull(item.permalink),
    created_at: toStringOrNull(item.created_at) ?? new Date().toISOString(),
    media_url: toStringOrNull(item.media_url),
    media_type: toStringOrNull(item.media_type),
  };
}

type InstagramWebhookEventsResponse = {
  events: InstagramWebhookEvent[];
  total: number;
};

async function fetchInstagramWebhookEvents(
  options: UseInstagramWebhookEventsOptions = {},
): Promise<InstagramWebhookEventsResponse> {
  const params = new URLSearchParams();
  if (typeof options.limit === "number") {
    params.set("limit", String(options.limit));
  }
  if (typeof options.offset === "number") {
    params.set("offset", String(options.offset));
  }

  const query = params.toString();
  const response = await fetch(`/api/instagram/webhook/events${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No se pudo consultar eventos (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  if (!isRecord(payload) || !Array.isArray(payload.events)) {
    return { events: [], total: 0 };
  }

  return {
    events: payload.events.map(parseEvent).filter((event): event is InstagramWebhookEvent => Boolean(event)),
    total: typeof payload.total === "number" && Number.isFinite(payload.total) ? payload.total : 0,
  };
}

export function useInstagramWebhookEvents(options: UseInstagramWebhookEventsOptions = {}): UseInstagramWebhookEventsResult {
  const [events, setEvents] = useState<InstagramWebhookEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await fetchInstagramWebhookEvents(options);
      setEvents(payload.events);
      setTotal(payload.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar eventos.");
    } finally {
      setIsLoading(false);
    }
  }, [options.limit, options.offset]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { events, total, isLoading, error, refetch };
}
