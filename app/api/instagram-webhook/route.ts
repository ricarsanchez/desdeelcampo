import { NextResponse } from "next/server";
import { refreshInstagramNewsCache } from "../_utils/instagramNews";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!mode || !verifyToken || !challenge) {
    return NextResponse.json({ ok: false, error: "Solicitud de verificación inválida." }, { status: 400 });
  }

  const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
  if (!expectedToken || verifyToken !== expectedToken) {
    return NextResponse.json({ ok: false, error: "Token de verificación inválido." }, { status: 403 });
  }

  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      entry?: Array<{
        changes?: Array<{ field?: string }>;
      }>;
    };

    const hasMediaChange = (body.entry ?? []).some((entry) =>
      (entry.changes ?? []).some((change) => change.field === "media"),
    );

    if (hasMediaChange) {
      await refreshInstagramNewsCache();
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo procesar webhook." }, { status: 500 });
  }
}
