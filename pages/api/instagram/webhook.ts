import type { NextApiRequest, NextApiResponse } from "next";
import {
  createInstagramWebhookRepository,
  type NewInstagramWebhookRecord,
} from "../../../lib/instagramWebhookRepository";

const VERIFY_TOKEN = "desdeelcampo2026";

type MetaWebhookValue = {
  caption?: string;
  media_id?: string;
  id?: string;
  media?: { id?: string } | string;
  permalink?: string;
  media_url?: string;
  created_at?: string;
  timestamp?: string;
};

type MetaWebhookBody = {
  entry?: Array<{
    changes?: Array<{
      value?: MetaWebhookValue;
    }>;
  }>;
};

function extractPostSummaries(body: MetaWebhookBody) {
  const summaries: NewInstagramWebhookRecord[] = [];

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;

      const mediaFromObject =
        typeof value.media === "object" && value.media !== null ? value.media.id : undefined;
      const mediaFromString = typeof value.media === "string" ? value.media : undefined;
      const mediaId = value.media_id ?? value.id ?? mediaFromObject ?? mediaFromString;
      if (!mediaId) continue;

      summaries.push({
        caption: value.caption ?? null,
        media_id: mediaId,
        permalink: value.permalink ?? null,
        media_url: value.media_url ?? null,
        created_at: value.created_at ?? value.timestamp ?? new Date().toISOString(),
      });
    }
  }

  return summaries;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const verifyToken = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const modeValue = Array.isArray(mode) ? mode[0] : mode;
    const verifyTokenValue = Array.isArray(verifyToken) ? verifyToken[0] : verifyToken;
    const challengeValue = Array.isArray(challenge) ? challenge[0] : challenge;

    if (modeValue === "subscribe" && verifyTokenValue === VERIFY_TOKEN && challengeValue) {
      return res.status(200).send(challengeValue);
    }

    return res.status(403).send("Forbidden");
  }

  if (req.method === "POST") {
    const body = (req.body ?? {}) as MetaWebhookBody;
    const summaries = extractPostSummaries(body);
    const repository = createInstagramWebhookRepository();

    if (summaries.length > 0) {
      for (const summary of summaries) {
        console.log("Instagram webhook:", {
          caption: summary.caption,
          media_id: summary.media_id,
          permalink: summary.permalink,
          media_url: summary.media_url,
          created_at: summary.created_at,
        });
      }

      try {
        await repository.save(summaries);
      } catch (error) {
        console.error("Error al guardar eventos de Instagram webhook:", error);
      }
    } else {
      console.log("Instagram webhook body:", body);
    }

    return res.status(200).send("OK");
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).send("Method Not Allowed");
}
