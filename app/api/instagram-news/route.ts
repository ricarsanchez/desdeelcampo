import { NextResponse } from "next/server";
import {
  readInstagramNewsCache,
  refreshInstagramNewsCache,
} from "../_utils/instagramNews";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  if (forceRefresh) {
    const refreshed = await refreshInstagramNewsCache();
    if (refreshed) {
      return NextResponse.json(
        {
          ok: true,
          posts: refreshed.posts,
          updatedAt: refreshed.updatedAt,
          version: refreshed.version,
          source: "instagram",
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }
  }

  const cache = await readInstagramNewsCache();
  if (cache.posts.length > 0) {
    return NextResponse.json(
      {
        ok: true,
        posts: cache.posts,
        updatedAt: cache.updatedAt,
        version: cache.version,
        source: "cache",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const refreshed = await refreshInstagramNewsCache();
  if (refreshed) {
    return NextResponse.json(
      {
        ok: true,
        posts: refreshed.posts,
        updatedAt: refreshed.updatedAt,
        version: refreshed.version,
        source: "instagram",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      posts: [],
      source: "fallback",
      note: "Configura INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USER_ID para habilitar la sincronización automática.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
