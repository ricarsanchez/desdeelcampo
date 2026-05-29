import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sqlite3 from "sqlite3";

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

class SqliteInstagramWebhookRepository implements InstagramWebhookRepository {
  private readonly dbPath = path.join(process.cwd(), "data", "instagramWebhookEvents.db");

  async save(records: NewInstagramWebhookRecord[]) {
    if (records.length === 0) return;

    await mkdir(path.dirname(this.dbPath), { recursive: true });
    const db = await this.openDatabase();

    try {
      await this.run(
        db,
        `CREATE TABLE IF NOT EXISTS instagram_webhook_events (
          id TEXT PRIMARY KEY,
          caption TEXT,
          media_id TEXT NOT NULL,
          permalink TEXT,
          media_url TEXT,
          received_at TEXT,
          created_at TEXT NOT NULL,
          UNIQUE(media_id)
        )`,
      );

      await this.ensureColumn(db, "instagram_webhook_events", "media_url", "TEXT");
      await this.ensureColumn(db, "instagram_webhook_events", "received_at", "TEXT");
      await this.ensureColumn(db, "instagram_webhook_events", "created_at", "TEXT");

      await this.run(db, "BEGIN TRANSACTION");
      try {
        for (const record of records) {
          await this.run(
            db,
            `INSERT OR IGNORE INTO instagram_webhook_events
              (id, caption, media_id, permalink, media_url, received_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              crypto.randomUUID(),
              record.caption,
              record.media_id,
              record.permalink,
              record.media_url,
              record.created_at,
              record.created_at,
            ],
          );
        }
        await this.run(db, "COMMIT");
      } catch (error) {
        await this.run(db, "ROLLBACK");
        throw error;
      }
    } finally {
      await this.close(db);
    }
  }

  async list(limit = 100, offset = 0): Promise<InstagramWebhookRecord[]> {
    await mkdir(path.dirname(this.dbPath), { recursive: true });
    const db = await this.openDatabase();

    try {
      await this.run(
        db,
        `CREATE TABLE IF NOT EXISTS instagram_webhook_events (
          id TEXT PRIMARY KEY,
          caption TEXT,
          media_id TEXT NOT NULL,
          permalink TEXT,
          media_url TEXT,
          received_at TEXT,
          created_at TEXT NOT NULL,
          UNIQUE(media_id)
        )`,
      );

      await this.ensureColumn(db, "instagram_webhook_events", "media_url", "TEXT");
      await this.ensureColumn(db, "instagram_webhook_events", "received_at", "TEXT");
      await this.ensureColumn(db, "instagram_webhook_events", "created_at", "TEXT");

      const rows = await this.all<{
        id: string;
        caption: string | null;
        media_id: string;
        permalink: string | null;
        media_url: string | null;
        created_at: string | null;
        received_at?: string | null;
      }>(
        db,
        `SELECT id, caption, media_id, permalink, media_url, created_at, received_at
         FROM instagram_webhook_events
         ORDER BY datetime(COALESCE(created_at, received_at)) DESC
         LIMIT ? OFFSET ?`,
        [Math.max(0, limit), Math.max(0, offset)],
      );

      return rows.map((row) => ({
        id: row.id,
        caption: row.caption,
        media_id: row.media_id,
        permalink: row.permalink,
        media_url: row.media_url,
        created_at: row.created_at ?? row.received_at ?? new Date().toISOString(),
      }));
    } finally {
      await this.close(db);
    }
  }

  async count(): Promise<number> {
    await mkdir(path.dirname(this.dbPath), { recursive: true });
    const db = await this.openDatabase();

    try {
      await this.run(
        db,
        `CREATE TABLE IF NOT EXISTS instagram_webhook_events (
          id TEXT PRIMARY KEY,
          caption TEXT,
          media_id TEXT NOT NULL,
          permalink TEXT,
          media_url TEXT,
          received_at TEXT,
          created_at TEXT NOT NULL,
          UNIQUE(media_id)
        )`,
      );

      const rows = await this.all<{ total: number }>(
        db,
        `SELECT COUNT(*) AS total FROM instagram_webhook_events`,
      );

      return rows[0]?.total ?? 0;
    } finally {
      await this.close(db);
    }
  }

  private openDatabase() {
    return new Promise<sqlite3.Database>((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(db);
      });
    });
  }

  private run(db: sqlite3.Database, sql: string, params: unknown[] = []) {
    return new Promise<void>((resolve, reject) => {
      db.run(sql, params as any[], (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  private all<T>(db: sqlite3.Database, sql: string, params: unknown[] = []) {
    return new Promise<T[]>((resolve, reject) => {
      db.all(sql, params as any[], (error, rows) => {
        if (error) {
          reject(error);
          return;
        }
        resolve((rows ?? []) as T[]);
      });
    });
  }

  private async ensureColumn(
    db: sqlite3.Database,
    tableName: string,
    columnName: string,
    definition: string,
  ) {
    const columns = await this.all<{ name: string }>(db, `PRAGMA table_info(${tableName})`);
    const hasColumn = columns.some((column) => column.name === columnName);
    if (!hasColumn) {
      await this.run(db, `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    }
  }

  private close(db: sqlite3.Database) {
    return new Promise<void>((resolve, reject) => {
      db.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

export function createInstagramWebhookRepository(): InstagramWebhookRepository {
  const storage = (process.env.INSTAGRAM_WEBHOOK_STORAGE ?? "sqlite").toLowerCase();

  if (storage === "json") {
    return new JsonInstagramWebhookRepository();
  }

  return new SqliteInstagramWebhookRepository();
}
