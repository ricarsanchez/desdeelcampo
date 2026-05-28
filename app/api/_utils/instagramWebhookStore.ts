import { createId, readStoreData, writeStoreData } from "./store";
import type { InstagramWebhookPost } from "./store";

type NewInstagramWebhookPost = {
  caption: string;
  media_url: string;
  permalink: string;
  instagramMediaId: string;
  instagramUserId?: string;
};

export async function addInstagramWebhookPost(
  payload: NewInstagramWebhookPost,
): Promise<InstagramWebhookPost> {
  const store = await readStoreData();

  const alreadyExists = (store.instagramWebhookPosts ?? []).some(
    (item) => item.instagramMediaId === payload.instagramMediaId,
  );
  if (alreadyExists) {
    const existing = (store.instagramWebhookPosts ?? []).find(
      (item) => item.instagramMediaId === payload.instagramMediaId,
    );
    if (existing) {
      return existing;
    }
  }

  const entry: InstagramWebhookPost = {
    id: createId(),
    caption: payload.caption,
    media_url: payload.media_url,
    permalink: payload.permalink,
    instagramMediaId: payload.instagramMediaId,
    instagramUserId: payload.instagramUserId,
    receivedAt: new Date().toISOString(),
  };

  await writeStoreData({
    ...store,
    instagramWebhookPosts: [entry, ...(store.instagramWebhookPosts ?? [])],
  });

  return entry;
}
