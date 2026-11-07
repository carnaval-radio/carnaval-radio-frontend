import { createHash } from "node:crypto";
import { unstable_cache, unstable_noStore } from "next/cache";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";
import { loadSocialSnapshot, saveSocialSnapshot } from "./socialSnapshots";

export interface SocialPost {
  id: string;
  date: Date;
  text: string;
  image: string;
  link: string;
  type: "Facebook" | "Instagram";
}

export interface SocialFeedPost {
  post: SocialPost;
  sources: SocialPost[];
}

interface GraphResponse<T> {
  data?: T[];
  error?: { code?: number; error_subcode?: number; type?: string };
}

interface FacebookPost {
  id: string;
  created_time: string;
  message?: string;
  full_picture?: string;
  permalink_url: string;
}

interface InstagramPost {
  id: string;
  timestamp: string;
  caption?: string;
  media_url?: string;
  thumbnail_url?: string;
  media_type: string;
  permalink: string;
}

const GRAPH_API_URL = "https://graph.facebook.com/v27.0";

const validPost = (value: unknown, connection: "posts" | "media") => {
  if (!value || typeof value !== "object" ||
    !("id" in value) || typeof value.id !== "string") return false;
  const date = connection === "posts" ? "created_time" : "timestamp";
  const link = connection === "posts" ? "permalink_url" : "permalink";
  if (!(date in value) || !(link in value)) return false;
  const fields: Record<string, unknown> = value;
  const dateValue = fields[date];
  if (typeof dateValue !== "string" || !Number.isFinite(Date.parse(dateValue)) ||
    typeof fields[link] !== "string") return false;
  const optional = connection === "posts"
    ? ["message", "full_picture"]
    : ["caption", "media_url", "thumbnail_url"];
  return optional.every((key) => fields[key] === undefined || typeof fields[key] === "string") &&
    (connection === "posts" || typeof fields.media_type === "string");
};

const validFacebookPosts = (value: unknown): value is FacebookPost[] =>
  Array.isArray(value) && value.every((post) => validPost(post, "posts"));
const validInstagramPosts = (value: unknown): value is InstagramPost[] =>
  Array.isArray(value) && value.every((post) => validPost(post, "media"));

const fetchGraphPosts = async <T>(
  platform: SocialPost["type"],
  accountId: string,
  token: string,
  connection: "posts" | "media",
  fields: string,
  validate: (value: unknown) => value is T[],
  limit?: number
): Promise<T[]> => {
  const query = `${GRAPH_API_URL}:${connection}:${fields}:${limit ?? ""}`;
  // Cache validated payloads, never raw error responses or failure fallbacks.
  // Hash credentials so Next's background revalidation logs cannot expose them.
  const load = unstable_cache(async (): Promise<T[]> => {
    let response: Response;
    let payload: GraphResponse<T>;
    try {
      // unstable_cache bypasses inner fetch caching; explicit no-store breaks Next 14 prerendering.
      response = await fetch(
        `${GRAPH_API_URL}/${accountId}/${connection}?fields=${fields}${
          limit ? `&limit=${limit}` : ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      payload = await response.json();
    } catch (error) {
      if (isDynamicServerError(error)) throw error;
      console.error(`${platform} feed request failed:`, error instanceof Error ? error.name : "Unknown error");
      throw new Error(`${platform} feed request failed.`);
    }

    if (!response.ok || payload?.error || !validate(payload?.data)) {
      console.error(`${platform} API error:`, {
        status: response.status,
        code: payload?.error?.code,
        subcode: payload?.error?.error_subcode,
      });
      throw new Error(`${platform} API returned an invalid feed.`);
    }
    await saveSocialSnapshot(platform, accountId, query, payload.data);
    return payload.data;
  }, [
    "social-validated-v1", GRAPH_API_URL, platform, accountId, connection, fields,
    String(limit), createHash("sha256").update(token).digest("hex"),
  ], { revalidate: 3600, tags: ["social"] });

  try {
    return await load();
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error(`${platform} feed unavailable:`, error instanceof Error ? error.name : "Unknown error");
    // Keep the empty-feed UI, but do not persist a failed render in the route cache.
    unstable_noStore();
    const snapshot = await loadSocialSnapshot(platform, accountId, query);
    if (snapshot !== null) {
      if (validate(snapshot)) {
        console.warn(`${platform} feed using saved snapshot.`);
        return snapshot;
      }
      console.error(`${platform} snapshot contains invalid posts.`);
    }
    return [];
  }
};

export const fetchFacebookPosts = async (
  facebookPageId: string,
  facebookAccessToken: string,
  limit?: number
): Promise<SocialPost[]> => {
  const posts = await fetchGraphPosts<FacebookPost>(
    "Facebook", facebookPageId, facebookAccessToken, "posts",
    "id,message,created_time,full_picture,permalink_url", validFacebookPosts, limit
  );
  return posts.map((post) => ({
    id: post.id,
    date: new Date(post.created_time),
    text: post.message ?? "",
    image: post.full_picture ?? "",
    link: post.permalink_url,
    type: "Facebook",
  }));
};

export const fetchInstagramPosts = async (
  instagramId: string,
  instagramAccessToken: string,
  limit?: number
): Promise<SocialPost[]> => {
  const posts = await fetchGraphPosts<InstagramPost>(
    "Instagram", instagramId, instagramAccessToken, "media",
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp", validInstagramPosts, limit
  );
  return posts.map((post) => ({
    id: post.id,
    date: new Date(post.timestamp),
    text: post.caption ?? "",
    image: (post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url) ?? "",
    link: post.permalink,
    type: "Instagram",
  }));
};

const matchingCaptions = (first: string, second: string) => {
  if (!first || !second) return false;
  if (first === second) return true;

  const words = (text: string) => text
    .replace(/[@#][\p{L}\p{N}_]+/gu, "")
    .match(/[\p{L}\p{N}]+/gu) ?? [];
  const firstWords = words(first);
  const secondWords = words(second);
  const firstSet = new Set(firstWords);
  const secondSet = new Set(secondWords);

  // Require a substantial shared caption and opening, not just common event boilerplate.
  if (Math.min(firstSet.size, secondSet.size) < 20 ||
    firstWords.slice(0, 8).join(" ") !== secondWords.slice(0, 8).join(" ")) {
    return false;
  }
  const sharedWords = Array.from(firstSet).filter((word) => secondSet.has(word)).length;
  return (2 * sharedWords) / (firstSet.size + secondSet.size) >= 0.9;
};

export const prepareSocialPosts = (posts: SocialPost[]): SocialFeedPost[] => {
  const newestFirst = posts
    .filter((post) => /[\p{L}\p{N}]/u.test(
      post.text.replace(/https?:\/\/\S+|[@#][\p{L}\p{N}_]+/gu, "")
    ))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const uniquePosts: { post: SocialPost; sources: SocialPost[]; caption: string }[] = [];
  for (const post of newestFirst) {
    const caption = post.text.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
    const duplicate = uniquePosts.find((item) =>
      !item.sources.some((source) => source.type === post.type) &&
      Math.abs(item.post.date.getTime() - post.date.getTime()) <= 48 * 60 * 60 * 1000 &&
      (matchingCaptions(item.caption, caption) ||
        (post.image.length > 0 && item.post.image === post.image))
    );
    if (duplicate) {
      duplicate.sources.push(post);
      if (post.type === "Instagram") {
        duplicate.post = { ...post, date: duplicate.post.date };
      }
    } else {
      uniquePosts.push({ post, sources: [post], caption });
    }
  }
  return uniquePosts.map(({ post, sources }) => ({ post, sources }));
};

// Same arguments everywhere keep the hourly validated cache shared across pages.
export const fetchSocialPosts = async (): Promise<SocialFeedPost[]> => {
  const facebookPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const instagramId = process.env.NEXT_PUBLIC_INSTAGRAM_ID;
  const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!facebookPageId || !facebookAccessToken) {
    console.warn("Facebook feed is not configured: missing page ID or access token.");
  }
  if (!instagramId || !instagramAccessToken) {
    console.warn("Instagram feed is not configured: missing account ID or access token.");
  }
  const [facebook, instagram] = await Promise.all([
    facebookPageId && facebookAccessToken
      ? fetchFacebookPosts(facebookPageId, facebookAccessToken, 25)
      : Promise.resolve([]),
    instagramId && instagramAccessToken
      ? fetchInstagramPosts(instagramId, instagramAccessToken, 25)
      : Promise.resolve([]),
  ]);
  return prepareSocialPosts([...facebook, ...instagram]);
};
