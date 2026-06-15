import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../_utils/supabaseServer";

type InstagramPostRow = {
  media_id: string;
  caption: string | null;
  media_url: string | null;
  permalink: string | null;
  created_at: string;
};

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return Math.min(parsed, max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parsePositiveInt(searchParams.get("limit"), 20, 100);
  const offset = parsePositiveInt(searchParams.get("offset"), 0, 10_000);

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase no configurado.", events: [], total: 0 },
      { status: 503 },
    );
  }

  const { data, error, count } = await supabase
    .from("instagram_posts")
    .select("media_id, caption, media_url, permalink, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Instagram webhook events: error al consultar Supabase.", {
      message: error.message,
      code: error.code,
    });
    return NextResponse.json(
      { ok: false, error: "No se pudieron cargar los eventos.", events: [], total: 0 },
      { status: 500 },
    );
  }

  const events = ((data ?? []) as InstagramPostRow[]).map((row) => ({
    media_id: row.media_id,
    caption: row.caption,
    media_url: row.media_url,
    permalink: row.permalink,
    created_at: row.created_at,
  }));

  return NextResponse.json(
    {
      ok: true,
      events,
      total: count ?? events.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
