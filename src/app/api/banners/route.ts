import { NextResponse } from "next/server";
import { saveFormDataFileToPublicUploads } from "../_utils/upload";

export const runtime = "nodejs";

type AdType = "banner" | "video";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function isAdType(value: string): value is AdType {
  return value === "banner" || value === "video";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const typeRaw = str(formData, "type").trim();
    const destino = str(formData, "destino").trim();
    const file = formData.get("file");

    const type: AdType = isAdType(typeRaw) ? typeRaw : "banner";

    if (!destino) {
      return NextResponse.json(
        { ok: false, error: "El campo 'destino' (link destino) es obligatorio." },
        { status: 400 },
      );
    }
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Falta el archivo. Enviá multipart/form-data con campo 'file'." },
        { status: 400 },
      );
    }

    const saved = await saveFormDataFileToPublicUploads(file, type);

    return NextResponse.json({
      ok: true,
      asset: {
        type,
        destino,
        fileUrl: saved.url,
        filename: saved.filename,
        contentType: saved.contentType,
      },
      fileUrl: saved.url,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}

