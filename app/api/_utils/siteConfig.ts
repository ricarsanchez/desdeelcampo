import { getSupabaseServer } from "./supabaseServer";
import { readStoreData, type SiteConfig } from "./store";

type SiteConfigRow = {
  id: number;
  whatsapp_number: string | null;
  instagram: string | null;
  facebook: string | null;
  email: string | null;
  address: string | null;
  quienes_somos_title: string | null;
  quienes_somos_content: string | null;
};

export function rowToConfig(row: SiteConfigRow): SiteConfig {
  return {
    whatsappNumber: row.whatsapp_number ?? undefined,
    instagram: row.instagram ?? undefined,
    facebook: row.facebook ?? undefined,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
    quienesSomosTitle: row.quienes_somos_title ?? undefined,
    quienesSomosContent: row.quienes_somos_content ?? undefined,
  };
}

export function configToRow(config: SiteConfig): Record<string, unknown> {
  return {
    id: 1,
    whatsapp_number: config.whatsappNumber ?? null,
    instagram: config.instagram ?? null,
    facebook: config.facebook ?? null,
    email: config.email ?? null,
    address: config.address ?? null,
    quienes_somos_title: config.quienesSomosTitle ?? null,
    quienes_somos_content: config.quienesSomosContent ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function readSiteConfig(): Promise<SiteConfig> {
  const supabase = getSupabaseServer();

  if (supabase) {
    const { data, error } = await supabase
      .from("site_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!error && data) {
      return rowToConfig(data as SiteConfigRow);
    }
  }

  const store = await readStoreData();
  return store.siteConfig;
}
