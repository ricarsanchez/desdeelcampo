import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../_utils/supabaseServer";

export const runtime = "nodejs";

type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  timestamp?: string;
  permalink?: string;
};

type InstagramWebhookRecord = {
  media_id: string;
  caption: string | null;
  media_url: string | null;
  permalink: string | null;
  created_at: string;
};

function toIsoTimestamp(value: unknown): string {
  if (typeof value === "string" && Number.isNaN(Number(value))) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
    return new Date().toISOString();
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const millis = numeric > 1e12 ? numeric : numeric * 1000;
    return new Date(millis).toISOString();
  }

  return new Date().toISOString();
}

function mapMediaToRecords(items: InstagramMediaItem[]): InstagramWebhookRecord[] {
  return items
    .filter((item) => item.media_url && item.id)
    .map((item) => ({
      media_id: item.id,
      caption: item.caption?.trim() || null,
      media_url: (item.media_type === "VIDEO" ? item.thumbnail_url ?? item.media_url : item.media_url) ?? null,
      permalink: item.permalink || null,
      created_at: toIsoTimestamp(item.timestamp),
    }));
}

async function fetchInstagramMedia(): Promise<InstagramMediaItem[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const businessAccountId =
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ||
    process.env.INSTAGRAM_BUSINESSS_ACCOUNT_ID;

  if (!token || !businessAccountId) {
    return [];
  }

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "timestamp",
    "permalink",
  ].join(",");

  const endpoint = `https://graph.facebook.com/v22.0/${encodeURIComponent(
    businessAccountId,
  )}/media?fields=${encodeURIComponent(fields)}&limit=50&access_token=${encodeURIComponent(token)}`;

  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    console.error("Instagram sync: error fetching media.", {
      status: response.status,
      statusText: response.statusText,
    });
    return [];
  }

  const payload = (await response.json()) as { data?: InstagramMediaItem[] };
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function GET() {
  try {
    const mediaItems = await fetchInstagramMedia();

    if (mediaItems.length === 0) {
      return NextResponse.json({
        ok: true,
        upserted: 0,
        note: "No se encontraron medios o faltan variables de entorno.",
      });
    }

    const records = mapMediaToRecords(mediaItems);

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase no configurado.", upserted: 0 },
        { status: 503 },
      );
    }

    const { error } = await supabase.from("instagram_posts").upsert(records, {
      onConflict: "media_id",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error("Instagram sync: error al guardar en Supabase.", {
        message: error.message,
        code: error.code,
        recordCount: records.length,
      });
      return NextResponse.json(
        { ok: false, error: "No se pudieron guardar los posts.", upserted: 0 },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, upserted: records.length });
  } catch (error) {
    console.error("Instagram sync: error no controlado.", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: "No se pudo ejecutar la sincronización.", upserted: 0 },
      { status: 500 },
    );
  }
}
