import "next/dist/server/node-environment";
import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
import { CacheHandler, IncrementalCache, type CacheHandlerValue } from "next/dist/server/lib/incremental-cache";
import type { StaticGenerationStore } from "next/dist/client/components/static-generation-async-storage.external";
import { fetchSocialPosts } from "@/GlobalState/ApiCalls/fetchSocials";
import * as serverHooks from "next/dist/client/components/hooks-server-context";
import { BlobNotFoundError, get, head, put } from "@vercel/blob";

vi.mock("@vercel/blob", async (importOriginal) => ({
  ...await importOriginal<typeof import("@vercel/blob")>(),
  get: vi.fn(), head: vi.fn(), put: vi.fn(),
}));

class MemoryCache extends CacheHandler {
  private entries = new Map<string, CacheHandlerValue>();

  async get(key: string) {
    return this.entries.get(key) ?? null;
  }

  async set(key: string, value: CacheHandlerValue["value"]) {
    this.entries.set(key, { value, lastModified: Date.now() });
  }

  async revalidateTag() {
    this.entries.clear();
  }
}

describe("Next social data cache", () => {
  it("reuses Meta responses across renders, expires after an hour and refreshes the social tag", async () => {
    const require = createRequire(import.meta.url);
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
    const createCache = () => new IncrementalCache({
      dev: false,
      requestHeaders: {},
      CurCacheHandler: MemoryCache,
      getPrerenderManifest: () => ({
        version: 4,
        routes: {},
        dynamicRoutes: {},
        notFoundRoutes: [],
        preview: { previewModeId: "", previewModeSigningKey: "", previewModeEncryptionKey: "" },
      }),
      experimental: { ppr: false },
    });
    const incrementalCache = createCache();
    const { staticGenerationAsyncStorage: storage }: typeof import("next/dist/client/components/static-generation-async-storage.external") =
        require("next/dist/client/components/static-generation-async-storage.external");
    // Ordinary React lacks the server-only cache API. Disable only render memoization.
    const dedupeModule = require.cache[require.resolve("next/dist/server/lib/dedupe-fetch")];
    if (!dedupeModule) throw new Error("Next fetch deduplication module was not loaded.");
    const originalDedupeExports: unknown = dedupeModule.exports;
    dedupeModule.exports = { createDedupeFetch: (fn: typeof fetch) => fn };
    const patchFetchPath = require.resolve("next/dist/server/lib/patch-fetch");
    const originalPatchModule = require.cache[patchFetchPath];
    delete require.cache[patchFetchPath];
    try {
      const { patchFetch }: typeof import("next/dist/server/lib/patch-fetch") = require(patchFetchPath);
      patchFetch({ serverHooks, staticGenerationAsyncStorage: storage });
    } finally {
      dedupeModule.exports = originalDedupeExports;
      if (originalPatchModule) require.cache[patchFetchPath] = originalPatchModule;
      else delete require.cache[patchFetchPath];
    }
    const renderFeed = async (failed = false) => {
      const store: StaticGenerationStore = {
        isStaticGeneration: false,
        urlPathname: "/social",
        prerenderState: null,
        incrementalCache,
        revalidate: 0,
      };
      const posts = await storage.run(store, fetchSocialPosts);
      await Promise.all(Object.values(store.pendingRevalidates ?? {}));
      expect(store.isUnstableNoStore).toBe(failed ? true : undefined);
      return posts;
    };

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
    await incrementalCache.revalidateTag("social");
    await renderFeed();
    expect(upstream).toHaveBeenCalledTimes(6);

    // A failed hourly refresh must not replace the last good platform payload.
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    upstream.mockResolvedValue(new Response(JSON.stringify({ error: { code: 190 } }), { status: 400 }));
    vi.setSystemTime(new Date("2026-11-06T22:00:02Z"));
    expect(await renderFeed()).toHaveLength(1);
    expect(upstream).toHaveBeenCalledTimes(8);
    expect(await renderFeed()).toHaveLength(1);
    expect(upstream).toHaveBeenCalledTimes(10);
    expect(JSON.stringify(log.mock.calls)).not.toContain("fake-facebook-token");
    expect(JSON.stringify(log.mock.calls)).not.toContain("fake-instagram-token");

    // After explicit invalidation, failures are not stored, including HTTP 200 errors.
    await incrementalCache.revalidateTag("social");
    upstream.mockImplementation(async () => new Response(JSON.stringify({ error: { code: 190 } })));
    expect(await renderFeed(true)).toEqual([]);
    expect(upstream).toHaveBeenCalledTimes(12);
    upstream.mockImplementation(async () => new Response(JSON.stringify({ data: "invalid" })));
    expect(await renderFeed(true)).toEqual([]);
    expect(upstream).toHaveBeenCalledTimes(14);
    upstream.mockRejectedValue(new Error("request with fake-facebook-token failed"));
    expect(await renderFeed(true)).toEqual([]);
    expect(upstream).toHaveBeenCalledTimes(16);
    upstream.mockImplementation(async () => new Response(JSON.stringify({
      data: [{ id: "recovered", message: "Hersteld!", created_time: "2026-11-06T22:00:00Z", permalink_url: "/recovered" }],
    })));
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "");
    expect((await renderFeed())[0].post.id).toBe("recovered");
    expect(upstream).toHaveBeenCalledTimes(17);
    expect((await renderFeed())[0].post.date).toBeInstanceOf(Date);
    expect(upstream).toHaveBeenCalledTimes(17);

    // Credential changes use a new key rather than reusing the previous account response.
    vi.stubEnv("FACEBOOK_ACCESS_TOKEN", "replacement-token");
    await renderFeed();
    expect(upstream).toHaveBeenCalledTimes(18);

    await incrementalCache.revalidateTag("social");
    upstream.mockImplementation(async () => new Response(JSON.stringify({ data: [] })));
    expect(await renderFeed()).toEqual([]);
    expect(await renderFeed()).toEqual([]);
    expect(upstream).toHaveBeenCalledTimes(19);

    // Build-time cache misses must reach Meta without forcing the route dynamic.
    await incrementalCache.revalidateTag("social");
    upstream.mockImplementation(async () => new Response(JSON.stringify({
      data: [{ id: "build-post", message: "Build feed", created_time: "2026-11-06T22:00:00Z", permalink_url: "/build" }],
    })));
    const buildStore: StaticGenerationStore = {
      isStaticGeneration: true,
      urlPathname: "/social",
      prerenderState: null,
      incrementalCache,
    };
    expect((await storage.run(buildStore, fetchSocialPosts))[0].post.id).toBe("build-post");
    expect(upstream).toHaveBeenCalledTimes(20);
    expect(buildStore.revalidate).toBe(3600);
    expect(buildStore.dynamicUsageErr).toBeUndefined();
    expect(buildStore.isUnstableNoStore).toBeUndefined();

    // Blob survives a completely new Next cache and rotated Meta credentials.
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
    await incrementalCache.revalidateTag("social");
    await storage.run(buildStore, fetchSocialPosts);
    expect(put).toHaveBeenCalledTimes(1);
    expect(blobs.size).toBe(1);
    vi.stubEnv("FACEBOOK_ACCESS_TOKEN", "another-meta-token");
    upstream.mockImplementation(async () => new Response(JSON.stringify({ error: { code: 190 } }), { status: 401 }));
    const coldStore: StaticGenerationStore = {
      ...buildStore, isStaticGeneration: false, incrementalCache: createCache(), revalidate: 0,
    };
    expect((await storage.run(coldStore, fetchSocialPosts))[0].post.id).toBe("build-post");
    expect((await storage.run({ ...coldStore }, fetchSocialPosts))[0].post.id).toBe("build-post");
    expect(get).toHaveBeenCalledTimes(1);
    expect(put).toHaveBeenCalledTimes(1);
  });
});
