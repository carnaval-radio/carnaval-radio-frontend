import "next/dist/server/node-environment";
import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
import { CacheHandler, IncrementalCache, type CacheHandlerValue } from "next/dist/server/lib/incremental-cache";
import type { StaticGenerationStore } from "next/dist/client/components/static-generation-async-storage.external";
import { fetchSocialPosts } from "@/GlobalState/ApiCalls/fetchSocials";

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
    const upstream = vi.mocked(fetch);
    upstream.mockImplementation(async (url) => new Response(JSON.stringify({
      data: String(url).includes("/posts?")
        ? [{ id: "fb", message: "Feest!", created_time: "2026-11-06T19:00:00Z", permalink_url: "/fb" }]
        : [{ id: "ig", caption: "Feest!", timestamp: "2026-11-06T19:00:00Z", media_type: "IMAGE", permalink: "/ig" }],
    })));
    const incrementalCache = new IncrementalCache({
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
    const { staticGenerationAsyncStorage: storage }: typeof import("next/dist/client/components/static-generation-async-storage.external") =
        require("next/dist/client/components/static-generation-async-storage.external");
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
  });
});
