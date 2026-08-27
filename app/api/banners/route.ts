import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, isAdminCookie } from "@/lib/auth";
import { createId, type AdAsset } from "../_utils/store";
import { deletePublicidadFile, savePublicidadFile } from "../_utils/publicidadStorage";
import {
  DEFAULT_PUBLICIDAD_SLOT,
  isPublicidadSlotInput,
  normalizePublicidadSlot,
} from "../../../lib/publicidadSlots";
import {
  MAX_PUBLICIDAD_FILE_BYTES,
  PUBLICIDAD_FILE_TOO_LARGE_ERROR,
} from "../../../lib/publicidadUpload";
import {
  readPublicidad,
  addPublicidadAsset,
  updatePublicidadAsset,
  deletePublicidadAsset,
} from "../_utils/publicidad";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

type AdType = "banner" | "video";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function parseSlot(formData: FormData) {
  const slot = str(formData, "slot").trim();
  if (!slot) return DEFAULT_PUBLICIDAD_SLOT;
  return isPublicidadSlotInput(slot) ? normalizePublicidadSlot(slot) : null;
}

function parseOrder(formData: FormData) {
  const raw = str(formData, "orden").trim();
  if (!raw) return 0;

  const order = Number(raw);
  return Number.isInteger(order) && order >= 0 ? order : null;
}

function parseActive(formData: FormData) {
  const raw = str(formData, "activo").trim();
  if (!raw) return true;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

function detectAdType(contentType: string): { type: AdType; esVideo: boolean } {
  const isVideo = ALLOWED_VIDEO_TYPES.includes(contentType);
  return {
    type: isVideo ? "video" : "banner",
    esVideo: isVideo,
  };
}

function requireAdmin(request: NextRequest) {
  const value = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (isAdminCookie(value)) return null;

  return NextResponse.json(
    { ok: false, error: "No autorizado." },
    { status: 401 },
  );
}

export async function GET() {
  const banners = await readPublicidad();
  return NextResponse.json({ ok: true, banners });
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const formData = await request.formData();

    const titulo = str(formData, "titulo").trim() || undefined;
    const destino = str(formData, "destino").trim() || undefined;
    const slot = parseSlot(formData);
    const orden = parseOrder(formData);
    const activo = parseActive(formData);
    const file = formData.get("file");

    if (!slot) {
      return NextResponse.json({ ok: false, error: "Ubicación de publicidad inválida." }, { status: 400 });
    }

    if (orden === null) {
      return NextResponse.json(
        { ok: false, error: "El orden debe ser un número entero mayor o igual a 0." },
        { status: 400 },
      );
    }

    if (activo === null) {
      return NextResponse.json({ ok: false, error: "El estado activo es inválido." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Falta el archivo. Enviá multipart/form-data con campo 'file'." },
        { status: 400 },
      );
    }

    if (file.size > MAX_PUBLICIDAD_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, error: PUBLICIDAD_FILE_TOO_LARGE_ERROR },
        { status: 400 },
      );
    }

    const contentType = file.type || "";

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { ok: false, error: "Formato no permitido. Solo se aceptan JPG, PNG, WebP, MP4 o WebM." },
        { status: 400 },
      );
    }

    const { type, esVideo } = detectAdType(contentType);

    const saved = await savePublicidadFile(file, type);

    const newAsset: AdAsset = {
      id: createId(),
      type,
      destino,
      fileUrl: saved.url,
      fileName: saved.filename,
      contentType,
      esVideo,
      activo,
      orden,
      slot,
      fileSize: saved.bytes,
      titulo,
      updatedAt: new Date().toISOString(),
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

export async function PUT(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "Falta el id de la publicidad." }, { status: 400 });
    }

    const formData = await request.formData();
    const patch: Parameters<typeof updatePublicidadAsset>[1] = {};

    if (formData.has("titulo")) {
      patch.titulo = str(formData, "titulo").trim();
    }

    if (formData.has("destino")) {
      patch.destino = str(formData, "destino").trim();
    }

    if (formData.has("activo")) {
      const activo = parseActive(formData);
      if (activo === null) {
        return NextResponse.json({ ok: false, error: "El estado activo es inválido." }, { status: 400 });
      }
      patch.activo = activo;
    }

    if (formData.has("orden")) {
      const orden = parseOrder(formData);
      if (orden === null) {
        return NextResponse.json(
          { ok: false, error: "El orden debe ser un número entero mayor o igual a 0." },
          { status: 400 },
        );
      }
      patch.orden = orden;
    }

    if (formData.has("slot")) {
      const slot = parseSlot(formData);
      if (!slot) {
        return NextResponse.json({ ok: false, error: "Ubicación de publicidad inválida." }, { status: 400 });
      }
      patch.slot = slot;
    }

    const updated = await updatePublicidadAsset(id, patch);

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Publicidad no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, asset: updated });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Falta el id del banner." }, { status: 400 });
    }

    const existing = (await readPublicidad()).find((asset) => asset.id === id);
    const deleted = await deletePublicidadAsset(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Banner no encontrado." }, { status: 404 });
    }

    if (existing?.fileUrl) {
      try {
        await deletePublicidadFile(existing.fileUrl);
      } catch (storageError) {
        console.error(
          storageError instanceof Error ? storageError.message : "Error eliminando publicidad de Storage",
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    );
  }
}
