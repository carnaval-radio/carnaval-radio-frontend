import { AsyncLocalStorage } from "node:async_hooks";
import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
import { CacheHandler, IncrementalCache, type CacheHandlerValue } from "next/dist/server/lib/incremental-cache";
import * as serverHooks from "next/dist/client/components/hooks-server-context";
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
    // Next aliases React to its server build; this test uses ordinary React 18.
    // Disable only request memoization so the real Next persistent cache is exercised.
    const require = createRequire(import.meta.url);
    const react: typeof import("react") = require("react");
    const cacheDescriptor = Object.getOwnPropertyDescriptor(react, "cache");
    react.cache = (fn) => fn;
    try {
      const { patchFetch }: typeof import("next/dist/server/lib/patch-fetch") =
        require("next/dist/server/lib/patch-fetch");
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
      const storage = new AsyncLocalStorage<StaticGenerationStore>();
      patchFetch({ serverHooks, staticGenerationAsyncStorage: storage });
      const renderFeed = async () => {
        const store: StaticGenerationStore = {
          isStaticGeneration: false,
          urlPathname: "/social",
          prerenderState: null,
          incrementalCache,
          revalidate: 0,
        };
        const posts = await storage.run(store, fetchSocialPosts);
        await Promise.all(Object.values(store.pendingRevalidates ?? {}));
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
    } finally {
      if (cacheDescriptor) Object.defineProperty(react, "cache", cacheDescriptor);
      else Reflect.deleteProperty(react, "cache");
    }
  });
});
