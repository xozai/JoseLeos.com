import { unstable_cache } from "next/cache";

export interface InstagramMedia {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

async function fetchInstagramFeed(limit: number): Promise<InstagramMedia[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    console.warn("[Instagram] INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID not set.");
    return [];
  }

  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
  const url = `https://graph.instagram.com/${userId}/media?fields=${fields}&limit=${limit}&access_token=${token}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    console.error("[Instagram] API error:", res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as { data?: InstagramMedia[] };
  return data.data ?? [];
}

/**
 * Fetches the latest Instagram media posts, cached for 1 hour.
 * Returns an empty array if credentials are missing or the API call fails.
 */
export const getInstagramFeed = unstable_cache(
  (limit = 9) => fetchInstagramFeed(limit),
  ["instagram-feed"],
  { revalidate: 3600, tags: ["instagram"] }
);
