import { NextResponse } from "next/server";
import { readStoreData, writeStoreData, type SiteConfig } from "../_utils/store";

export const runtime = "nodejs";

export async function GET() {
  const store = await readStoreData();
  return NextResponse.json({ ok: true, config: store.siteConfig });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SiteConfig>;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "El cuerpo debe ser un objeto JSON con los campos de configuración." },
        { status: 400 },
      );
    }

    const store = await readStoreData();
    const nextConfig: SiteConfig = { ...store.siteConfig };

    if (typeof body.whatsappNumber === "string") {
      const cleaned = body.whatsappNumber.replace(/\D/g, "");
      if (cleaned && !/^\d{6,20}$/.test(cleaned)) {
        return NextResponse.json(
          { ok: false, error: "El número de WhatsApp debe contener entre 6 y 20 dígitos." },
          { status: 400 },
        );
      }
      nextConfig.whatsappNumber = cleaned || undefined;
    }

    if (typeof body.instagram === "string") {
      nextConfig.instagram = body.instagram.trim() || undefined;
    }

    if (typeof body.facebook === "string") {
      nextConfig.facebook = body.facebook.trim() || undefined;
    }

    if (typeof body.email === "string") {
      nextConfig.email = body.email.trim() || undefined;
    }

    if (typeof body.address === "string") {
      nextConfig.address = body.address.trim() || undefined;
    }

    if (typeof body.quienesSomosTitle === "string") {
      nextConfig.quienesSomosTitle = body.quienesSomosTitle.trim() || undefined;
    }

    if (typeof body.quienesSomosContent === "string") {
      nextConfig.quienesSomosContent = body.quienesSomosContent.trim() || undefined;
    }

    await writeStoreData({ ...store, siteConfig: nextConfig });

    return NextResponse.json({ ok: true, config: nextConfig });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}
