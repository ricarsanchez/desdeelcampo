import { NextResponse } from "next/server";
import { saveFormDataFileToPublicUploads } from "../_utils/upload";
import { createId } from "../_utils/store";
import {
  readPublicidad,
  addPublicidadAsset,
  deletePublicidadAsset,
} from "../_utils/publicidad";

export const runtime = "nodejs";

type AdType = "banner" | "video";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function isAdType(value: string): value is AdType {
  return value === "banner" || value === "video";
}

export async function GET() {
  const banners = await readPublicidad();
  return NextResponse.json({ ok: true, banners });
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

    const newAsset = {
      id: createId(),
      type,
      destino,
      fileUrl: saved.url,
      fileName: saved.filename,
      contentType: saved.contentType,
    };

    await addPublicidadAsset(newAsset);

    return NextResponse.json({
      ok: true,
      asset: newAsset,
      fileUrl: saved.url,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Falta el id del banner." }, { status: 400 });
    }

    const deleted = await deletePublicidadAsset(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Banner no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}
