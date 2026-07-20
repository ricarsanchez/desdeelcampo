import { NextResponse } from "next/server";
import { readStoreData, writeStoreData, type SiteConfig } from "../_utils/store";
import { getSupabaseServer } from "../_utils/supabaseServer";
import { readSiteConfig, configToRow } from "../_utils/siteConfig";

export const runtime = "nodejs";

export async function GET() {
  const config = await readSiteConfig();
  return NextResponse.json({ ok: true, config });
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

    if (typeof body.whatsappNumber === "string") {
      const cleaned = body.whatsappNumber.replace(/\D/g, "");
      if (cleaned && !/^\d{6,20}$/.test(cleaned)) {
        return NextResponse.json(
          { ok: false, error: "El número de WhatsApp debe contener entre 6 y 20 dígitos." },
          { status: 400 },
        );
      }
    }

    const currentConfig = await readSiteConfig();
    const nextConfig: SiteConfig = { ...currentConfig };

    if (typeof body.whatsappNumber === "string") {
      const cleaned = body.whatsappNumber.replace(/\D/g, "");
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

    const supabase = getSupabaseServer();

    if (supabase) {
      const row = configToRow(nextConfig);
      const { error: upsertError } = await supabase
        .from("site_config")
        .upsert(row, { onConflict: "id", ignoreDuplicates: false });

      if (upsertError) {
        console.error("Error al guardar site_config en Supabase:", {
          message: upsertError.message,
          code: upsertError.code,
        });
        const store = await readStoreData();
        await writeStoreData({ ...store, siteConfig: nextConfig });
      }
    } else {
      const store = await readStoreData();
      await writeStoreData({ ...store, siteConfig: nextConfig });
    }

    return NextResponse.json({ ok: true, config: nextConfig });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}
