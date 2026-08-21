import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export type AdAssetType = "banner" | "video";

export type AdSlot = "sidebar" | "horizontal" | "hero" | "footer";

export type AdAsset = {
  id: string;
  type: AdAssetType;
  fileName: string;
  fileUrl: string;
  destino?: string;
  contentType?: string;
  activo?: boolean;
  titulo?: string;
  orden?: number;
  slot?: AdSlot | string;
  esVideo?: boolean;
  width?: number;
  height?: number;
  fileSize?: number;
  updatedAt?: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
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

export type SiteConfig = {
  whatsappNumber?: string;
  instagram?: string;
  facebook?: string;
  email?: string;
  address?: string;
  quienesSomosTitle?: string;
  quienesSomosContent?: string;
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

function normalizeBanners(value: unknown): AdAsset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: (AdAsset | null)[] = value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => {
      const type = item.type === "video" ? "video" : "banner";
      const fileUrl = String(item.fileUrl ?? item.file_url ?? "");
      const fileName = String(item.fileName ?? item.file_name ?? "");
      const id = String(item.id ?? "");

      if (!id || !fileUrl) {
        return null;
      }

      const orden = Number(item.orden ?? item.order ?? 0);
      const width = Number(item.width ?? item.Width ?? NaN);
      const height = Number(item.height ?? item.Height ?? NaN);
      const fileSize = Number(item.fileSize ?? item.file_size ?? NaN);

      return {
        id,
        type: type as AdAssetType,
        fileName,
        fileUrl,
        destino: item.destino !== undefined ? String(item.destino) : undefined,
        contentType: item.contentType !== undefined ? String(item.contentType) : undefined,
        activo: typeof item.activo === "boolean" ? item.activo : true,
        titulo: item.titulo !== undefined ? String(item.titulo) : undefined,
        orden: Number.isFinite(orden) ? orden : 0,
        slot: String(item.slot ?? "sidebar"),
        esVideo: typeof item.esVideo === "boolean" ? item.esVideo : type === "video",
        width: Number.isFinite(width) ? width : undefined,
        height: Number.isFinite(height) ? height : undefined,
        fileSize: Number.isFinite(fileSize) ? fileSize : undefined,
        updatedAt:
          item.updatedAt !== undefined
            ? String(item.updatedAt)
            : item.updated_at !== undefined
              ? String(item.updated_at)
              : undefined,
      };
    });

  return normalized.filter((item): item is AdAsset => item !== null);
}

export type StoreData = {
  siteName: string;
  logo: LogoState;
  dollarDisplayTypes: string[];
  lotes: Lote[];
  banners: AdAsset[];
  noticias: NewsArticle[];
  siteConfig: SiteConfig;
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
      banners: normalizeBanners(data.banners),
      noticias: data.noticias ?? [],
      siteName: data.siteName ?? "Desde el Campo 2026",
      logo: data.logo ?? null,
      siteConfig: data.siteConfig ?? {},
    };
  } catch {
    return {
      siteName: "Desde el Campo 2026",
      logo: null,
      dollarDisplayTypes: [...DEFAULT_DOLLAR_DISPLAY_TYPES],
      lotes: [],
      banners: [],
      noticias: [],
      siteConfig: {},
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
