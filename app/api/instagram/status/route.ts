import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../_utils/supabaseServer";

export const runtime = "nodejs";

type StatusResponse = {
  ok: boolean;
  connected: boolean;
  lastSyncedAt: string | null;
  totalPosts: number;
  mostRecentPostDate: string | null;
  tokenDaysRemaining: number | null;
  error?: string;
};

async function getTokenExpiration(token: string): Promise<number | null> {
  try {
    const endpoint = `https://graph.facebook.com/v22.0/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      data?: {
        expires_at?: number;
        data_access_expires_at?: number;
        is_valid?: boolean;
      };
    };
    const data = payload.data;
    let expiresAt = data?.expires_at;
    if (!expiresAt || expiresAt === 0) {
      expiresAt = data?.data_access_expires_at;
    }
    if (!expiresAt || expiresAt === 0) return null;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, Math.ceil((expiresAt - now) / 86400));
  } catch {
    return null;
  }
}

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const connected = Boolean(token && businessAccountId);

  const result: StatusResponse = {
    ok: true,
    connected,
    lastSyncedAt: null,
    totalPosts: 0,
    mostRecentPostDate: null,
    tokenDaysRemaining: null,
  };

  try {
    const supabase = getSupabaseServer();

    if (supabase) {
      const { count, error: countError } = await supabase
        .from("instagram_posts")
        .select("*", { count: "exact", head: true });

      if (!countError) {
        result.totalPosts = count ?? 0;
      }

      const { data: latest, error: latestError } = await supabase
        .from("instagram_posts")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestError && latest) {
        result.mostRecentPostDate = latest.created_at;
      }

      const { data: syncRow, error: syncError } = await supabase
        .from("instagram_sync_status")
        .select("last_synced_at")
        .eq("id", 1)
        .maybeSingle();

      if (!syncError && syncRow) {
        result.lastSyncedAt = syncRow.last_synced_at;
      }
    }

    if (token) {
      result.tokenDaysRemaining = await getTokenExpiration(token);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ...result,
        ok: false,
        error: error instanceof Error ? error.message : "Error al obtener el estado.",
      },
      { status: 500 },
    );
  }
}
