import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { saveFormDataFileToPublicUploads, uploadsDirAbsolute } from "../_utils/upload";
import { createId, readStoreData, writeStoreData } from "../_utils/store";

export const runtime = "nodejs";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function num(formData: FormData, key: string) {
  const v = str(formData, key).trim();
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  const store = await readStoreData();
  return NextResponse.json({ ok: true, lotes: store.lotes });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const titulo = str(formData, "titulo").trim();
    const categoria = str(formData, "categoria").trim();
    const localidad = str(formData, "localidad").trim();
    const telefono = str(formData, "telefono").trim();
    const cantidad = num(formData, "cantidad");
    const peso = num(formData, "peso");
    const precio = num(formData, "precio");

    const image = formData.get("image");

    if (!titulo || !categoria || !localidad || !telefono) {
      return NextResponse.json(
        { ok: false, error: "Campos requeridos: titulo, categoria, localidad, telefono." },
        { status: 400 },
      );
    }
    if (cantidad === null || cantidad <= 0 || peso === null || peso <= 0 || precio === null || precio <= 0) {
      return NextResponse.json(
        { ok: false, error: "cantidad, peso y precio deben ser números > 0." },
        { status: 400 },
      );
    }
    if (!(image instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Falta la imagen. Enviá multipart/form-data con campo 'image'." },
        { status: 400 },
      );
    }

    const saved = await saveFormDataFileToPublicUploads(image, "lote");
    const store = await readStoreData();

    const newLote = {
      id: createId(),
      titulo,
      cantidad,
      peso,
      categoria,
      precio,
      localidad,
      telefono,
      imageUrl: saved.url,
    };

    await writeStoreData({
      ...store,
      lotes: [newLote, ...store.lotes],
    });

    return NextResponse.json({
      ok: true,
      lote: newLote,
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
      return NextResponse.json({ ok: false, error: "Falta el id del lote." }, { status: 400 });
    }

    const store = await readStoreData();
    const lote = store.lotes.find((l) => l.id === id);
    if (!lote) {
      return NextResponse.json({ ok: false, error: "Lote no encontrado." }, { status: 404 });
    }

    if (lote.imageUrl) {
      const filename = path.basename(new URL(lote.imageUrl, "http://localhost").pathname);
      const filePath = path.join(uploadsDirAbsolute(), filename);
      await unlink(filePath).catch(() => {});
    }

    await writeStoreData({
      ...store,
      lotes: store.lotes.filter((l) => l.id !== id),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}

