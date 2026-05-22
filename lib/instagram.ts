export type InstagramPost = {
  id: string;
  caption: string;
  mediaType: string;
  mediaUrl: string;
  permalink: string;
  timestamp: string;
};

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

type InstagramResponse = {
  data?: InstagramMedia[];
};

const INSTAGRAM_ENDPOINT = "https://graph.instagram.com";

function normalizePost(post: InstagramMedia): InstagramPost {
  return {
    id: post.id,
    caption: post.caption ?? "",
    mediaType: post.media_type ?? "UNKNOWN",
    mediaUrl: post.media_url ?? post.thumbnail_url ?? "",
    permalink: post.permalink ?? "",
    timestamp: post.timestamp ?? "",
  };
}

export async function getInstagramPosts(limit = 12): Promise<InstagramPost[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !userId) {
    return [];
  }

  const params = new URLSearchParams({
    fields:
      "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
    access_token: accessToken,
    limit: String(limit),
  });

  const response = await fetch(`${INSTAGRAM_ENDPOINT}/${userId}/media?${params}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener publicaciones de Instagram.");
  }

  const data = (await response.json()) as InstagramResponse;
  const posts = data.data ?? [];

  return posts.map(normalizePost).filter((post) => Boolean(post.mediaUrl));
}
