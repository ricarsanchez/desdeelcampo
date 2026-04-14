import { NextResponse } from "next/server";
import { saveFormDataFileToPublicUploads } from "../_utils/upload";

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const titulo = str(formData, "titulo").trim();
    const categoria = str(formData, "categoria").trim();
    const localidad = str(formData, "localidad").trim();
    const cantidad = num(formData, "cantidad");
    const peso = num(formData, "peso");
    const precio = num(formData, "precio");

    const image = formData.get("image");

    if (!titulo || !categoria || !localidad) {
      return NextResponse.json(
        { ok: false, error: "Campos requeridos: titulo, categoria, localidad." },
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

    return NextResponse.json({
      ok: true,
      lote: {
        titulo,
        cantidad,
        peso,
        categoria,
        precio,
        localidad,
        imageUrl: saved.url,
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

