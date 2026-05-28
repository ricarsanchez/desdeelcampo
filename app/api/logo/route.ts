import { NextResponse } from "next/server";
import { saveFormDataFileToPublicUploads } from "../_utils/upload";
import { readStoreData, writeStoreData } from "../_utils/store";

export const runtime = "nodejs";

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function GET() {
  const store = await readStoreData();
  return NextResponse.json({ ok: true, logo: store.logo, siteName: store.siteName });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const siteName = str(formData, "siteName").trim();

    if (!siteName && !(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Enviá el nombre del sitio o un archivo de logo para actualizar.",
        },
        { status: 400 },
      );
    }

    const store = await readStoreData();
    let logo = store.logo;
    let savedUrl: string | undefined;
    let savedFilename: string | undefined;

    if (file instanceof File) {
      const saved = await saveFormDataFileToPublicUploads(file, "logo");
      logo = {
        filename: saved.filename,
        url: saved.url,
        contentType: saved.contentType,
        updatedAt: Date.now(),
      };
      savedUrl = saved.url;
      savedFilename = saved.filename;
    }

    const nextStore = {
      ...store,
      siteName: siteName || store.siteName,
      logo,
    };

    await writeStoreData(nextStore);

    return NextResponse.json({
      ok: true,
      url: savedUrl,
      filename: savedFilename,
      siteName: nextStore.siteName,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}

