import { NextResponse, type NextRequest } from "next/server";
import { requireAdminRequest } from "@/lib/auth";
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

async function checkInstagramConnection(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://graph.instagram.com/v22.0/me?fields=id",
      {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) return false;
    const payload = (await response.json()) as { id?: unknown };
    return typeof payload.id === "string" && payload.id.length > 0;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const connected = token ? await checkInstagramConnection(token) : false;

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

    // Instagram Login no entrega la caducidad al consultar el perfil.
    // Mantener null evita mostrar una vigencia estimada como si fuera verificada.

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
