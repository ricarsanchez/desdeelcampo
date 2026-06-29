/** @deprecated Los eventos ahora se leen desde Supabase (instagram_posts). Este archivo se eliminará en la etapa de limpieza. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export type InstagramWebhookRecord = {
  id: string;
  caption: string | null;
  media_id: string;
  permalink: string | null;
  media_url: string | null;
  created_at: string;
};

export type NewInstagramWebhookRecord = Omit<InstagramWebhookRecord, "id">;

export interface InstagramWebhookRepository {
  save(records: NewInstagramWebhookRecord[]): Promise<void>;
  list(limit?: number, offset?: number): Promise<InstagramWebhookRecord[]>;
  count(): Promise<number>;
}

function sortByCreatedAtDesc(records: InstagramWebhookRecord[]) {
  return [...records].sort((left, right) => {
    const leftTime = new Date(left.created_at).getTime();
    const rightTime = new Date(right.created_at).getTime();
    return rightTime - leftTime;
  });
}

class JsonInstagramWebhookRepository implements InstagramWebhookRepository {
  private readonly filePath = path.join(process.cwd(), "data", "instagramWebhookEvents.json");

  async save(records: NewInstagramWebhookRecord[]) {
    if (records.length === 0) return;

    await mkdir(path.dirname(this.filePath), { recursive: true });
    const current = await this.readCurrent();

    const next = [
      ...records.map((record) => ({
        id: crypto.randomUUID(),
        caption: record.caption,
        media_id: record.media_id,
        permalink: record.permalink,
        media_url: record.media_url,
        created_at: record.created_at,
      })),
      ...current,
    ];

    await writeFile(this.filePath, JSON.stringify(next, null, 2), "utf-8");
  }

  private async readCurrent(): Promise<InstagramWebhookRecord[]> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((item) => {
          if (typeof item !== "object" || item === null) {
            return null;
          }

          const record = item as Partial<InstagramWebhookRecord> & { receivedAt?: string };
          if (typeof record.id !== "string" || typeof record.media_id !== "string") {
            return null;
          }

          return {
            id: record.id,
            caption: typeof record.caption === "string" ? record.caption : null,
            media_id: record.media_id,
            permalink: typeof record.permalink === "string" ? record.permalink : null,
            media_url: typeof record.media_url === "string" ? record.media_url : null,
            created_at:
              typeof record.created_at === "string"
                ? record.created_at
                : typeof record.receivedAt === "string"
                  ? record.receivedAt
                  : new Date().toISOString(),
          } satisfies InstagramWebhookRecord;
        })
        .filter((item): item is InstagramWebhookRecord => Boolean(item));
    } catch {
      return [];
    }
  }

  async list(limit = 100, offset = 0): Promise<InstagramWebhookRecord[]> {
    const current = sortByCreatedAtDesc(await this.readCurrent());
    const safeLimit = Math.max(0, limit);
    const safeOffset = Math.max(0, offset);
    return current.slice(safeOffset, safeOffset + safeLimit);
  }

  async count(): Promise<number> {
    const current = await this.readCurrent();
    return current.length;
  }
}

export function createInstagramWebhookRepository(): InstagramWebhookRepository {
  return new JsonInstagramWebhookRepository();
}
