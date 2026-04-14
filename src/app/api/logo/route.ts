import { NextResponse } from "next/server";
import { saveFormDataFileToPublicUploads } from "../_utils/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Falta el archivo. Enviá multipart/form-data con campo 'file'." },
        { status: 400 },
      );
    }

    const saved = await saveFormDataFileToPublicUploads(file, "logo");
    return NextResponse.json({ ok: true, url: saved.url, filename: saved.filename });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}

