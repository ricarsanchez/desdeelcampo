import { NextResponse } from "next/server";
import { saveFormDataFileToPublicUploads } from "../_utils/upload";
import { createId, readStoreData, writeStoreData } from "../_utils/store";

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
  const store = await readStoreData();
  return NextResponse.json({ ok: true, banners: store.banners });
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
    const store = await readStoreData();

    const newAsset = {
      id: createId(),
      type,
      destino,
      fileUrl: saved.url,
      fileName: saved.filename,
      contentType: saved.contentType,
    };

    await writeStoreData({
      ...store,
      banners: [newAsset, ...store.banners],
    });

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

    const store = await readStoreData();
    const exists = store.banners.some((b) => b.id === id);
    if (!exists) {
      return NextResponse.json({ ok: false, error: "Banner no encontrado." }, { status: 404 });
    }

    await writeStoreData({
      ...store,
      banners: store.banners.filter((b) => b.id !== id),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}

