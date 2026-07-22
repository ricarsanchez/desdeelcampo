import { getSupabaseServer } from "./supabaseServer";
import { readStoreData, writeStoreData, type AdAsset } from "./store";

type PublicidadRow = {
  id: string;
  type: string;
  file_name: string;
  file_url: string;
  destino: string;
  content_type: string | null;
  created_at: string | null;
};

function rowToAsset(row: PublicidadRow): AdAsset {
  return {
    id: row.id,
    type: row.type as "banner" | "video",
    fileName: row.file_name,
    fileUrl: row.file_url,
    destino: row.destino,
    contentType: row.content_type ?? undefined,
  };
}

function assetToRow(asset: AdAsset): Record<string, unknown> {
  return {
    type: asset.type,
    file_name: asset.fileName,
    file_url: asset.fileUrl,
    destino: asset.destino,
    content_type: asset.contentType ?? null,
  };
}

export async function readPublicidad(): Promise<AdAsset[]> {
  const supabase = getSupabaseServer();

  if (supabase) {
    const { data, error } = await supabase
      .from("publicidad")
      .select("*")
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
  const supabase = getSupabaseServer();

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

export async function deletePublicidadAsset(id: string): Promise<boolean> {
  const supabase = getSupabaseServer();

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
