import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCronRequest, requireAdminRequest } from "@/lib/auth";
import { getSupabaseServer } from "../../_utils/supabaseServer";

export const runtime = "nodejs";

class InstagramSyncError extends Error {}

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
  media_type: string | null;
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
      media_type: item.media_type?.trim() || null,
    }));
}

async function fetchInstagramMedia(): Promise<InstagramMediaItem[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();

  if (!token) {
    throw new InstagramSyncError("Instagram no configurado: falta INSTAGRAM_ACCESS_TOKEN.");
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

  // /me usa la cuenta autorizada por Instagram Login, sin mezclar IDs de Facebook.
  const endpoint = `https://graph.instagram.com/v22.0/me/media?fields=${encodeURIComponent(fields)}&limit=50`;

  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {
    throw new InstagramSyncError("No se pudo conectar con Instagram. Intentá nuevamente.");
  });
  if (!response.ok) {
    console.error("Instagram sync: error fetching media.", {
      status: response.status,
      statusText: response.statusText,
    });
    throw new InstagramSyncError(
      response.status === 401 || response.status === 403
        ? "Instagram rechazó el acceso. Revisá el token y sus permisos."
        : "No se pudo consultar Instagram. Revisá el token, los permisos o intentá nuevamente.",
    );
  }

  const payload = (await response.json()) as { data?: InstagramMediaItem[] };
  if (!Array.isArray(payload.data)) {
    throw new InstagramSyncError("Instagram devolvió una respuesta inválida.");
  }
  return payload.data;
}

async function runSync() {
  try {
    const mediaItems = await fetchInstagramMedia();

    if (mediaItems.length === 0) {
      return NextResponse.json({
        ok: true,
        upserted: 0,
        note: "La cuenta no tiene publicaciones disponibles.",
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

    await supabase
      .from("instagram_sync_status")
      .upsert({ id: 1, last_synced_at: new Date().toISOString() })
      .select()
      .maybeSingle();

    return NextResponse.json({ ok: true, upserted: records.length });
  } catch (error) {
    console.error("Instagram sync: error no controlado.", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof InstagramSyncError
          ? error.message
          : "No se pudo ejecutar la sincronización.",
        upserted: 0,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      { ok: false, error: "No autorizado" },
      { status: 401 },
    );
  }

  return runSync();
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  return runSync();
}
