import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { InstagramPost } from "../../../lib/instagram";

type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  timestamp?: string;
  permalink?: string;
  like_count?: number;
};

export type InstagramNewsCache = {
  updatedAt: string;
  version: number;
  posts: InstagramPost[];
};

const dataDirAbsolute = path.join(process.cwd(), "data");
const instagramNewsFileAbsolute = path.join(dataDirAbsolute, "instagramNews.json");

export const DEFAULT_INSTAGRAM_NEWS: InstagramNewsCache = {
  updatedAt: new Date().toISOString(),
  version: 1,
  posts: [],
};

async function ensureDataDir() {
  await mkdir(dataDirAbsolute, { recursive: true });
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toCompactLikes(count?: number) {
  if (typeof count !== "number") return "-";
  if (count < 1000) return String(count);
  return `${(count / 1000).toFixed(1)}k`;
}

function mapInstagramMediaToPosts(items: InstagramMediaItem[]): InstagramPost[] {
  return items
    .filter((item) => (item.media_url || item.thumbnail_url) && item.id)
    .map((item) => ({
      id: item.id,
      imageUrl: item.media_type === "VIDEO" ? item.thumbnail_url ?? item.media_url ?? "" : item.media_url ?? "",
      title: item.caption?.split("\n")[0]?.slice(0, 120) || "Publicación de Instagram",
      date: formatDate(item.timestamp),
      likes: toCompactLikes(item.like_count),
      permalink: item.permalink,
    }))
    .filter((item) => item.imageUrl.length > 0);
}

export async function readInstagramNewsCache(): Promise<InstagramNewsCache> {
  try {
    const raw = await readFile(instagramNewsFileAbsolute, "utf-8");
    const parsed = JSON.parse(raw) as Partial<InstagramNewsCache>;

    return {
      updatedAt:
        typeof parsed.updatedAt === "string" ? parsed.updatedAt : DEFAULT_INSTAGRAM_NEWS.updatedAt,
      version: typeof parsed.version === "number" ? parsed.version : DEFAULT_INSTAGRAM_NEWS.version,
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
    };
  } catch {
    return DEFAULT_INSTAGRAM_NEWS;
  }
}

export async function writeInstagramNewsCache(data: InstagramNewsCache) {
  await ensureDataDir();
  await writeFile(instagramNewsFileAbsolute, JSON.stringify(data, null, 2), "utf-8");
}

export async function fetchInstagramPostsFromApi(): Promise<InstagramPost[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return null;
  }

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "timestamp",
    "permalink",
    "like_count",
  ].join(",");

  const endpoint = `https://graph.instagram.com/${encodeURIComponent(
    userId,
  )}/media?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data?: InstagramMediaItem[] };
    return mapInstagramMediaToPosts(Array.isArray(payload.data) ? payload.data : []);
  } catch {
    return null;
  }
}

export async function refreshInstagramNewsCache() {
  const posts = await fetchInstagramPostsFromApi();
  if (!posts) {
    return null;
  }

  const current = await readInstagramNewsCache();
  const next: InstagramNewsCache = {
    updatedAt: new Date().toISOString(),
    version: current.version + 1,
    posts,
  };

  await writeInstagramNewsCache(next);
  return next;
}
