import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export type AdAssetType = "banner" | "video";

export type AdAsset = {
  id: string;
  type: AdAssetType;
  fileName: string;
  fileUrl: string;
  destino: string;
  contentType?: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
};

export type InstagramWebhookPost = {
  id: string;
  caption: string;
  media_url: string;
  permalink: string;
  instagramMediaId: string;
  instagramUserId?: string;
  receivedAt: string;
};

export type Lote = {
  id: string;
  titulo: string;
  cantidad: number;
  peso: number;
  categoria: string;
  precio: number;
  localidad: string;
  imageUrl: string;
  telefono?: string;
};

export type LogoState = {
  filename: string;
  url: string;
  contentType?: string;
  updatedAt: number;
} | null;

export const DEFAULT_DOLLAR_DISPLAY_TYPES = ["oficial", "blue"];

function normalizeDollarDisplayTypes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_DOLLAR_DISPLAY_TYPES];
  }

  const unique = Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

  return unique.length > 0 ? unique : [...DEFAULT_DOLLAR_DISPLAY_TYPES];
}

export type StoreData = {
  siteName: string;
  logo: LogoState;
  dollarDisplayTypes: string[];
  lotes: Lote[];
  banners: AdAsset[];
  noticias: NewsArticle[];
  instagramWebhookPosts: InstagramWebhookPost[];
};

const dataDirAbsolute = path.join(process.cwd(), "data");
const storeFileAbsolute = path.join(dataDirAbsolute, "store.json");

export async function ensureDataDir() {
  await mkdir(dataDirAbsolute, { recursive: true });
}

export async function readStoreData(): Promise<StoreData> {
  try {
    const raw = await readFile(storeFileAbsolute, "utf-8");
    const data = JSON.parse(raw) as Partial<StoreData>;
    return {
      ...data,
      dollarDisplayTypes: normalizeDollarDisplayTypes(data.dollarDisplayTypes),
      lotes: data.lotes ?? [],
      banners: data.banners ?? [],
      noticias: data.noticias ?? [],
      instagramWebhookPosts: data.instagramWebhookPosts ?? [],
      siteName: data.siteName ?? "Desde el Campo 2026",
      logo: data.logo ?? null,
    };
  } catch {
    return {
      siteName: "Desde el Campo 2026",
      logo: null,
      dollarDisplayTypes: [...DEFAULT_DOLLAR_DISPLAY_TYPES],
      lotes: [],
      banners: [],
      noticias: [],
      instagramWebhookPosts: [],
    };
  }
}

export async function writeStoreData(data: StoreData) {
  await ensureDataDir();
  await writeFile(
    storeFileAbsolute,
    JSON.stringify(
      {
        ...data,
        dollarDisplayTypes: normalizeDollarDisplayTypes(data.dollarDisplayTypes),
      },
      null,
      2,
    ),
    "utf-8",
  );
}

export function createId() {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
