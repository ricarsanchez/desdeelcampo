import { NextResponse } from "next/server";
import { saveFormDataFileToPublicUploads } from "../_utils/upload";
import { readNewsArticles, addNewsArticle, updateNewsArticle, deleteNewsArticle } from "../../../lib/news";

export const runtime = "nodejs";

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function GET() {
  const noticias = await readNewsArticles();
  return NextResponse.json({ ok: true, noticias });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = str(formData, "title").trim();
    const content = str(formData, "content").trim();
    const date = str(formData, "date").trim();
    const image = formData.get("image");

    if (!title || !content || !date) {
      return NextResponse.json(
        { ok: false, error: "Campos requeridos: título, contenido y fecha." },
        { status: 400 },
      );
    }

    let imageUrl: string | undefined;
    if (image instanceof File) {
      const saved = await saveFormDataFileToPublicUploads(image, "news");
      imageUrl = saved.url;
    }

    const noticia = await addNewsArticle({ title, content, date, imageUrl });
    return NextResponse.json({ ok: true, noticia });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Falta el id de la noticia." }, { status: 400 });
    }

    const formData = await request.formData();
    const title = str(formData, "title").trim();
    const content = str(formData, "content").trim();
    const date = str(formData, "date").trim();
    const image = formData.get("image");

    if (!title || !content || !date) {
      return NextResponse.json(
        { ok: false, error: "Campos requeridos: título, contenido y fecha." },
        { status: 400 },
      );
    }

    let imageUrl: string | undefined;
    if (image instanceof File) {
      const saved = await saveFormDataFileToPublicUploads(image, "news");
      imageUrl = saved.url;
    }

    const noticia = await updateNewsArticle(id, { title, content, date, imageUrl });
    return NextResponse.json({ ok: true, noticia });
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
      return NextResponse.json({ ok: false, error: "Falta el id de la noticia." }, { status: 400 });
    }

    await deleteNewsArticle(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}
