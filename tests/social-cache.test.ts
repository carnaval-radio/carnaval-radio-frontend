import { beforeEach, describe, expect, it, vi } from "vitest";

const nextCache = vi.hoisted(() => {
  const entries = new Map<
    string,
    { value: unknown; expiresAt: number; tags: string[] }
  >();
  const options: Array<{ revalidate: number; tags?: string[] }> = [];
  const unstableCache = (
    callback: () => Promise<unknown>,
    keyParts: string[],
    cacheOptions: { revalidate: number; tags?: string[] },
  ) => {
    const key = JSON.stringify(keyParts);
    options.push(cacheOptions);
    return async () => {
      const current = entries.get(key);
      if (current && current.expiresAt > Date.now()) return current.value;

      try {
        const value = await callback();
        entries.set(key, {
          value,
          expiresAt: Date.now() + cacheOptions.revalidate * 1000,
          tags: cacheOptions.tags ?? [],
        });
        return value;
      } catch (error) {
        if (current) return current.value;
        throw error;
      }
    };
  };

  return {
    entries,
    options,
    unstable_cache: vi.fn(unstableCache),
    unstable_noStore: vi.fn(),
    revalidateTag(tag: string) {
      for (const [key, entry] of entries) {
        if (entry.tags.includes(tag)) entries.delete(key);
      }
    },
  };
});

vi.mock("next/cache", () => ({
  unstable_cache: nextCache.unstable_cache,
  unstable_noStore: nextCache.unstable_noStore,
}));

vi.mock("next/navigation", () => ({
  unstable_rethrow: vi.fn(),
}));

vi.mock("@vercel/blob", async (importOriginal) => ({
  ...await importOriginal<typeof import("@vercel/blob")>(),
  get: vi.fn(),
  head: vi.fn(),
  put: vi.fn(),
}));

import { BlobNotFoundError, get, head, put } from "@vercel/blob";
import { fetchSocialPosts } from "@/GlobalState/ApiCalls/fetchSocials";

beforeEach(() => {
  nextCache.entries.clear();
  nextCache.options.length = 0;
  vi.clearAllMocks();
});

describe("social feed caching", () => {
  it("caches validated responses, refreshes tagged data, and falls back to Blob snapshots", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-06T20:00:00Z"));
    vi.stubEnv("NEXT_PUBLIC_FACEBOOK_PAGE_ID", "cache-test-page");
    vi.stubEnv("FACEBOOK_ACCESS_TOKEN", "fake-facebook-token");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_ID", "cache-test-instagram");
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "fake-instagram-token");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("VERCEL_ENV", "production");

    const upstream = vi.mocked(fetch);
    upstream.mockImplementation(async (url) => new Response(JSON.stringify({
      data: String(url).includes("/posts?")
        ? [{ id: "fb", message: "Feest!", created_time: "2026-11-06T19:00:00Z", permalink_url: "/fb" }]
        : [{ id: "ig", caption: "Feest!", timestamp: "2026-11-06T19:00:00Z", media_type: "IMAGE", permalink: "/ig" }],
    })));

    const renderFeed = () => fetchSocialPosts();

    expect(await renderFeed()).toHaveLength(1);
    expect(upstream).toHaveBeenCalledTimes(2);
    vi.setSystemTime(new Date("2026-11-06T20:59:59Z"));
    expect(await renderFeed()).toHaveLength(1);
    expect(upstream).toHaveBeenCalledTimes(2);

    vi.setSystemTime(new Date("2026-11-06T21:00:01Z"));
    await renderFeed();
    expect(upstream).toHaveBeenCalledTimes(4);
    await renderFeed();
    expect(upstream).toHaveBeenCalledTimes(4);

    nextCache.revalidateTag("social");
    await renderFeed();
    expect(upstream).toHaveBeenCalledTimes(6);

    upstream.mockResolvedValue(new Response(JSON.stringify({ error: { code: 190 } }), { status: 400 }));
    vi.setSystemTime(new Date("2026-11-06T22:00:02Z"));
    expect(await renderFeed()).toHaveLength(1);
    expect(upstream).toHaveBeenCalledTimes(8);
    expect(await renderFeed()).toHaveLength(1);
    expect(upstream).toHaveBeenCalledTimes(10);

    nextCache.revalidateTag("social");
    upstream.mockImplementation(async () => new Response(JSON.stringify({ error: { code: 190 } })));
    expect(await renderFeed()).toEqual([]);
    expect(upstream).toHaveBeenCalledTimes(12);
    upstream.mockImplementation(async () => new Response(JSON.stringify({ data: "invalid" })));
    expect(await renderFeed()).toEqual([]);
    expect(upstream).toHaveBeenCalledTimes(14);
    upstream.mockRejectedValue(new Error("request with fake-facebook-token failed"));
    expect(await renderFeed()).toEqual([]);
    expect(upstream).toHaveBeenCalledTimes(16);
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("fake-facebook-token");
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("fake-instagram-token");

    upstream.mockImplementation(async () => new Response(JSON.stringify({
      data: [{ id: "recovered", message: "Hersteld!", created_time: "2026-11-06T22:00:00Z", permalink_url: "/recovered" }],
    })));
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "");
    expect((await renderFeed())[0].post.id).toBe("recovered");
    expect(upstream).toHaveBeenCalledTimes(17);
    expect((await renderFeed())[0].post.date).toBeInstanceOf(Date);
    expect(upstream).toHaveBeenCalledTimes(17);

    vi.stubEnv("FACEBOOK_ACCESS_TOKEN", "replacement-token");
    await renderFeed();
    expect(upstream).toHaveBeenCalledTimes(18);

    nextCache.revalidateTag("social");
    upstream.mockImplementation(async () => new Response(JSON.stringify({ data: [] })));
    expect(await renderFeed()).toEqual([]);
    expect(await renderFeed()).toEqual([]);
    expect(upstream).toHaveBeenCalledTimes(19);

    nextCache.revalidateTag("social");
    upstream.mockImplementation(async () => new Response(JSON.stringify({
      data: [{ id: "build-post", message: "Build feed", created_time: "2026-11-06T22:00:00Z", permalink_url: "/build" }],
    })));
    expect((await renderFeed())[0].post.id).toBe("build-post");
    expect(upstream).toHaveBeenCalledTimes(20);
    expect(nextCache.options.at(-1)).toMatchObject({
      revalidate: 3600,
      tags: ["social"],
    });

    const blobs = new Map<string, string>();
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "fake-blob-token");
    vi.mocked(head).mockRejectedValue(new BlobNotFoundError());
    vi.mocked(put).mockImplementation(async (path, body) => {
      blobs.set(path, String(body));
      return { url: path, downloadUrl: path, pathname: path, contentType: "application/json", contentDisposition: "", etag: "etag" };
    });
    vi.mocked(get).mockImplementation(async (path) => {
      const body = blobs.get(path);
      if (!body) return null;
      return {
        statusCode: 200, stream: new Response(body).body!, headers: new Headers(),
        blob: {
          url: path, downloadUrl: path, pathname: path, contentType: "application/json",
          contentDisposition: "", cacheControl: "", etag: "etag", size: body.length, uploadedAt: new Date(),
        },
      };
    });
    nextCache.revalidateTag("social");
    await renderFeed();
    expect(put).toHaveBeenCalledTimes(1);
    expect(blobs.size).toBe(1);

    vi.stubEnv("FACEBOOK_ACCESS_TOKEN", "another-meta-token");
    upstream.mockImplementation(async () => new Response(JSON.stringify({ error: { code: 190 } }), { status: 401 }));
    expect((await renderFeed())[0].post.id).toBe("build-post");
    expect((await renderFeed())[0].post.id).toBe("build-post");
    expect(get).toHaveBeenCalledTimes(1);
    expect(put).toHaveBeenCalledTimes(1);
  });
});
