import crypto from "node:crypto";

export type InstagramWebhookRecord = {
  media_id: string;
  caption: string | null;
  media_url: string | null;
  permalink: string | null;
  created_at: string;
};

type WebhookBody = {
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: Record<string, unknown>;
    }>;
  }>;
};

function toIsoTimestamp(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" && Number.isNaN(Number(value))) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  const millis = numeric > 1e12 ? numeric : numeric * 1000;
  return new Date(millis).toISOString();
}

function extractMediaId(value: Record<string, unknown>): string | null {
  const candidates = [value.media_id, value.id, (value.media as Record<string, unknown> | undefined)?.id];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return String(candidate);
    }
  }

  return null;
}

function extractString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeInstagramWebhookRecords(body: WebhookBody): InstagramWebhookRecord[] {
  const records: InstagramWebhookRecord[] = [];

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      const mediaId = extractMediaId(value);

      if (!mediaId) {
        continue;
      }

      const mediaObject = value.media as Record<string, unknown> | undefined;

      records.push({
        media_id: mediaId,
        caption: extractString(value.caption),
        media_url:
          extractString(value.media_url) ??
          extractString(mediaObject?.url) ??
          extractString(value.thumbnail_url),
        permalink:
          extractString(value.permalink) ??
          extractString(value.permalink_url) ??
          extractString(value.url),
        created_at:
          toIsoTimestamp(value.timestamp) ??
          toIsoTimestamp(value.created_time) ??
          toIsoTimestamp(value.created_at) ??
          new Date().toISOString(),
      });
    }
  }

  return records;
}

export function verifyInstagramWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appSecret) {
    return true;
  }

  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expected =
    "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function isInstagramWebhookSignatureRequired(): boolean {
  return Boolean(process.env.INSTAGRAM_APP_SECRET);
}
