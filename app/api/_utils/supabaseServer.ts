import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  key: string;
};

function getSupabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
}

function hasValidUrl(url: string) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = getSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  if (!hasValidUrl(url) || !key?.trim()) {
    return null;
  }

  return { url, key: key.trim() };
}

function legacyJwtRole(key: string): string | null {
  const parts = key.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      role?: unknown;
    };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function getSupabaseAdminConfig(): SupabaseConfig | null {
  const url = getSupabaseUrl();
  const key = (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  ).trim();

  if (!hasValidUrl(url) || !key) {
    return null;
  }

  if (key.startsWith("sb_publishable_") || legacyJwtRole(key) === "anon") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY contiene una Publishable/anon key. Configurá una Secret key (sb_secret_...) o la service_role legacy.",
    );
  }

  if (!key.startsWith("sb_secret_") && legacyJwtRole(key) !== "service_role") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no tiene formato de Secret key ni de service_role.",
    );
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

/**
 * Cliente exclusivo para operaciones administrativas del servidor.
 * No usa cookies ni permite caer silenciosamente en una clave publica.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const config = getSupabaseAdminConfig();
  if (!config) {
    return null;
  }

  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
