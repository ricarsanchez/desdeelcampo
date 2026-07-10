import { NextResponse } from "next/server";
import {
  isInstagramWebhookSignatureRequired,
  normalizeInstagramWebhookRecords,
  verifyInstagramWebhookSignature,
} from "../../_utils/instagramWebhook";
import { getSupabaseServer } from "../../_utils/supabaseServer";

export const runtime = "nodejs";

const DEFAULT_VERIFY_TOKEN = "desdeelcampo2026";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const verifyToken =
    searchParams.get("hub.verify_token") ||
    searchParams.get("hub.verify-token") ||
    searchParams.get("verify_token");
  const challenge = searchParams.get("hub.challenge") || searchParams.get("challenge");

  if (!mode || !verifyToken || !challenge) {
    return NextResponse.json({ ok: false, error: "Solicitud de verificación inválida." }, { status: 400 });
  }

  const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || DEFAULT_VERIFY_TOKEN;
  if (verifyToken !== expectedToken) {
    return NextResponse.json({ ok: false, error: "Token de verificación inválido." }, { status: 403 });
  }

  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (isInstagramWebhookSignatureRequired() && !verifyInstagramWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ ok: false, error: "Firma inválida." }, { status: 403 });
    }

    const body = JSON.parse(rawBody) as Parameters<typeof normalizeInstagramWebhookRecords>[0];
    const records = normalizeInstagramWebhookRecords(body);

    if (records.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ ok: true, inserted: 0, warning: "Supabase no configurado." });
    }

    const { error } = await supabase.from("instagram_posts").upsert(records, {
      onConflict: "media_id",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error("Instagram webhook: error al guardar en Supabase.", {
        message: error.message,
        code: error.code,
        recordCount: records.length,
      });
      return NextResponse.json({ ok: false, error: "No se pudieron guardar los eventos." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inserted: records.length });
  } catch (error) {
    console.error("Instagram webhook: error no controlado.", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: "No se pudo procesar webhook." }, { status: 500 });
  }
}
