import path from "node:path";
import { getSupabaseAdmin } from "./supabaseServer";

const PUBLICIDAD_BUCKET = "publicidad";

function safeBaseName(input: string) {
  const base = path.basename(input).replace(/\s+/g, "-");
  return base.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80) || "archivo";
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function requireSupabaseAdmin() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error(
      "Faltan SUPABASE_URL y una clave de servidor: SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return supabase;
}

export async function savePublicidadFile(file: File, prefix: string) {
  const supabase = requireSupabaseAdmin();
  const original = safeBaseName(file.name || "archivo");
  const ext = path.extname(original);
  const base = path.basename(original, ext);
  const filename = `${prefix}-${base}-${uid()}${ext}`;
  const objectPath = `${prefix}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(PUBLICIDAD_BUCKET).upload(objectPath, buffer, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Error subiendo archivo a Supabase Storage: ${error.message}`);
  }

  const { data } = supabase.storage.from(PUBLICIDAD_BUCKET).getPublicUrl(objectPath);

  return {
    filename,
    objectPath,
    url: data.publicUrl,
    bytes: buffer.byteLength,
    contentType: file.type || undefined,
  };
}

function objectPathFromPublicUrl(fileUrl: string) {
  const marker = `/storage/v1/object/public/${PUBLICIDAD_BUCKET}/`;

  try {
    const parsed = new URL(fileUrl);
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function deletePublicidadFile(fileUrl: string) {
  const objectPath = objectPathFromPublicUrl(fileUrl);
  if (!objectPath) return;

  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.storage.from(PUBLICIDAD_BUCKET).remove([objectPath]);

  if (error) {
    throw new Error(`Error eliminando archivo de Supabase Storage: ${error.message}`);
  }
}
