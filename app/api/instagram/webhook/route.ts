import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.INSTAGRAM_VERIFY_TOKEN &&
    challenge
  ) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verificación inválida" }, { status: 403 });
}

export async function POST(request: Request) {
  const payload = await request.json();

  if (payload?.object !== "instagram" && payload?.object !== "page") {
    return NextResponse.json({ error: "Evento no soportado" }, { status: 400 });
  }

  revalidatePath("/");

  return NextResponse.json({ received: true });
}
