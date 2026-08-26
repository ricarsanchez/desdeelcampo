import { getSupabaseAdmin, getSupabaseServer } from "./supabaseServer";
import { readStoreData, writeStoreData, type AdAsset } from "./store";

type PublicidadRow = {
  id: string;
  type: string;
  file_name: string;
  file_url: string;
  destino: string | null;
  content_type: string | null;
  activo: boolean | null;
  titulo: string | null;
  orden: number | null;
  slot: string | null;
  es_video: boolean | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string | null;
  updated_at: string | null;
};

function rowToAsset(row: PublicidadRow): AdAsset {
  const type = row.type === "video" ? "video" : "banner";

  return {
    id: row.id,
    type,
    fileName: row.file_name,
    fileUrl: row.file_url,
    destino: row.destino ?? undefined,
    contentType: row.content_type ?? undefined,
    activo: row.activo ?? true,
    titulo: row.titulo ?? undefined,
    orden: row.orden ?? 0,
    slot: row.slot ?? "sidebar",
    esVideo: row.es_video ?? type === "video",
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    fileSize: row.file_size ?? undefined,
    updatedAt: row.updated_at ?? row.created_at ?? undefined,
  };
}

function assetToRow(asset: AdAsset): Record<string, unknown> {
  return {
    type: asset.type,
    file_name: asset.fileName,
    file_url: asset.fileUrl,
    destino: asset.destino ?? null,
    content_type: asset.contentType ?? null,
    activo: asset.activo ?? true,
    titulo: asset.titulo ?? null,
    orden: asset.orden ?? 0,
    slot: asset.slot ?? "sidebar",
    es_video: asset.esVideo ?? asset.type === "video",
    width: asset.width ?? null,
    height: asset.height ?? null,
    file_size: asset.fileSize ?? null,
    updated_at: asset.updatedAt ?? new Date().toISOString(),
  };
}

export async function readPublicidad(): Promise<AdAsset[]> {
  const supabase = getSupabaseServer();

  if (supabase) {
    const { data, error } = await supabase
      .from("publicidad")
      .select("*")
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) {
      return (data as PublicidadRow[]).map(rowToAsset);
    }

    console.error("Error leyendo publicidad de Supabase:", error?.message);
  }

  const store = await readStoreData();
  return store.banners;
}

export async function addPublicidadAsset(asset: AdAsset): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const row = { ...assetToRow(asset), id: asset.id };
    const { error } = await supabase.from("publicidad").insert(row);
    if (!error) return;

    console.error("Error insertando publicidad en Supabase:", error.message);
  }

  const store = await readStoreData();
  await writeStoreData({
    ...store,
    banners: [asset, ...store.banners],
  });
}

export async function updatePublicidadAsset(
  id: string,
  patch: Partial<Pick<AdAsset, "titulo" | "destino" | "activo" | "orden" | "slot">>,
): Promise<AdAsset | null> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data: existing, error: fetchError } = await supabase
      .from("publicidad")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      console.error("Error buscando publicidad en Supabase:", fetchError?.message);
      return null;
    }

    const rowUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (patch.titulo !== undefined) rowUpdate.titulo = patch.titulo ?? null;
    if (patch.destino !== undefined) rowUpdate.destino = patch.destino ?? null;
    if (patch.activo !== undefined) rowUpdate.activo = patch.activo;
    if (patch.orden !== undefined) rowUpdate.orden = patch.orden ?? 0;
    if (patch.slot !== undefined) rowUpdate.slot = patch.slot ?? "sidebar";

    const { data, error } = await supabase
      .from("publicidad")
      .update(rowUpdate)
      .eq("id", id)
      .select("*")
      .single();

    if (!error && data) return rowToAsset(data as PublicidadRow);

    console.error(
      "Error actualizando publicidad en Supabase:",
      error?.message ?? "La actualización no devolvió la publicidad.",
    );
  }

  const store = await readStoreData();
  const index = store.banners.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updated: AdAsset = {
    ...store.banners[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  store.banners[index] = updated;
  await writeStoreData(store);
  return updated;
}

export async function deletePublicidadAsset(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from("publicidad").delete().eq("id", id);
    if (!error) return true;

    console.error("Error eliminando publicidad de Supabase:", error.message);
  }

  const store = await readStoreData();
  const exists = store.banners.some((b) => b.id === id);
  if (!exists) return false;

  await writeStoreData({
    ...store,
    banners: store.banners.filter((b) => b.id !== id),
  });
  return true;
}
