import { createHash } from "node:crypto";
import { BlobNotFoundError, get, head, put, type HeadBlobResult } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";

const snapshotPath = (platform: string, accountId: string, query: string) =>
  `social-feeds/v1/${process.env.VERCEL_ENV ?? "development"}/${platform.toLowerCase()}/${createHash("sha256").update(`${accountId}:${query}`).digest("hex")}.json`;

export async function saveSocialSnapshot(
  platform: string, accountId: string, query: string, posts: unknown[],
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;
  try {
    const pathname = snapshotPath(platform, accountId, query);
    let existing: HeadBlobResult | null;
    try {
      existing = await head(pathname, { token });
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) throw error;
      existing = null;
    }
    if (existing && Date.now() - existing.uploadedAt.getTime() < 24 * 60 * 60 * 1000) return;
    await put(pathname, JSON.stringify({
      version: 1, savedAt: new Date().toISOString(), posts,
    }), {
      token, access: "private", addRandomSuffix: false, allowOverwrite: existing !== null,
      ...(existing ? { ifMatch: existing.etag } : {}),
      contentType: "application/json", cacheControlMaxAge: 60,
    });
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error(`${platform} snapshot write failed:`, error instanceof Error ? error.name : "Unknown error");
  }
}

export async function loadSocialSnapshot(
  platform: string, accountId: string, query: string,
): Promise<unknown[] | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  const pathname = snapshotPath(platform, accountId, query);
  // No token arguments: Next can print cache invocation arguments on errors.
  const load = unstable_cache(async (): Promise<unknown[] | null> => {
    const blob = await get(pathname, { token, access: "private", useCache: false });
    if (!blob) {
      console.warn(`${platform} snapshot not found.`);
      return null;
    }
    if (blob.statusCode !== 200) throw new Error("Unexpected snapshot response.");
    const snapshot: unknown = await new Response(blob.stream).json();
    if (!snapshot || typeof snapshot !== "object" ||
      !("version" in snapshot) || snapshot.version !== 1 ||
      !("savedAt" in snapshot) || typeof snapshot.savedAt !== "string" ||
      !Number.isFinite(Date.parse(snapshot.savedAt)) ||
      !("posts" in snapshot) || !Array.isArray(snapshot.posts)) {
      throw new Error("Invalid social snapshot.");
    }
    return snapshot.posts;
  }, ["social-snapshot-v1", pathname], { revalidate: 300, tags: ["social"] });
  try {
    return await load();
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error(`${platform} snapshot read failed:`, error instanceof Error ? error.name : "Unknown error");
    return null;
  }
}
