import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  console.log({
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasAnon: !!process.env.SUPABASE_ANON_KEY,
    hasKey: !!process.env.SUPABASE_KEY,
  });

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  if (!url) {
    console.log("getSupabaseConfig: falta URL");
    return null;
  }
  if (!key) {
    console.log("getSupabaseConfig: falta KEY");
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      console.log("getSupabaseConfig: URL inválida (protocolo no es http ni https)");
      return null;
    }
  } catch {
    console.log("getSupabaseConfig: URL inválida (no se pudo parsear)");
    return null;
  }

  return { url, key };
}

export function getSupabaseServer(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  return createClient(config.url, config.key, {
    auth: { persistSession: false },
  });
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
