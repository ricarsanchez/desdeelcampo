import type { NextApiRequest, NextApiResponse } from "next";
import { createInstagramWebhookRepository } from "../../../../lib/instagramWebhookRepository";

type WebhookEventDto = {
  caption: string | null;
  media_id: string;
  permalink: string | null;
  media_url: string | null;
  created_at: string;
};

type WebhookEventsResponse = {
  events: WebhookEventDto[];
  total: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<WebhookEventsResponse | { error: string }>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const parsePositiveInt = (value: string | string[] | undefined, fallback: number) => {
      const raw = Array.isArray(value) ? value[0] : value;
      if (typeof raw !== "string") return fallback;

      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed) || parsed < 0) return fallback;
      return parsed;
    };

    const limit = parsePositiveInt(req.query.limit, 20);
    const offset = parsePositiveInt(req.query.offset, 0);

    const repository = createInstagramWebhookRepository();
    const events = await repository.list(limit, offset);
    const total = await repository.count();

    const payload: WebhookEventsResponse = {
      events: events.map((item) => ({
        caption: item.caption,
        media_id: item.media_id,
        permalink: item.permalink,
        media_url: item.media_url,
        created_at: item.created_at,
      })),
      total,
    };

    return res.status(200).json(payload);
  } catch {
    return res.status(200).json({ events: [], total: 0 });
  }
}
