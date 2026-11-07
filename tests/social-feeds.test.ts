import { describe, expect, it, vi } from "vitest";
import { fetchFacebookPosts, fetchInstagramPosts, fetchSocialPosts } from "@/GlobalState/ApiCalls/fetchSocials";
import { unstable_noStore } from "next/cache";
import { DynamicServerError } from "next/dist/client/components/hooks-server-context";
import { loadSocialSnapshot, saveSocialSnapshot } from "@/GlobalState/ApiCalls/socialSnapshots";

vi.mock("@/GlobalState/ApiCalls/socialSnapshots", () => ({
  saveSocialSnapshot: vi.fn(),
  loadSocialSnapshot: vi.fn(async () => null),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  unstable_noStore: vi.fn(),
}));

describe("social feed integration", () => {
  it("fetches Facebook posts on a supported version with credentials outside the URL", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      data: [{
        id: "post-1", message: "New event", created_time: "2026-11-06T20:00:00Z",
        full_picture: "https://example.test/photo.jpg", permalink_url: "https://facebook.com/post-1",
      }],
    })));
    expect(await fetchFacebookPosts("page-id", "test-token", 3)).toEqual([{
      id: "post-1", text: "New event", date: new Date("2026-11-06T20:00:00Z"),
      image: "https://example.test/photo.jpg", link: "https://facebook.com/post-1", type: "Facebook",
    }]);
    expect(fetch).toHaveBeenCalledWith(
      "https://graph.facebook.com/v27.0/page-id/posts?fields=id,message,created_time,full_picture,permalink_url&limit=3",
      {
        headers: { Authorization: "Bearer test-token" },
      },
    );
  });

  it("keeps optional Facebook content compatible with the card component", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      data: [{ id: "post", created_time: "2026-11-06T20:00:00Z", permalink_url: "https://facebook.com/post" }],
    })));
    expect(await fetchFacebookPosts("page", "test-token")).toEqual([
      expect.objectContaining({ text: "", image: "" }),
    ]);
    expect(vi.mocked(fetch).mock.calls[0][0]).not.toContain("limit=");
  });

  it("maps Instagram photos and uses video thumbnails rather than video URLs", async () => {
    const common = { timestamp: "2026-11-06T20:00:00Z", permalink: "https://instagram.com/p/test" };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      data: [
        { ...common, id: "photo", media_type: "IMAGE", media_url: "/photo.jpg", caption: "Photo" },
        { ...common, id: "video", media_type: "VIDEO", media_url: "/video.mp4", thumbnail_url: "/thumb.jpg" },
        { ...common, id: "no-thumb", media_type: "VIDEO", media_url: "/video.mp4" },
      ],
    })));
    const posts = await fetchInstagramPosts("instagram-id", "test-token", 3);
    expect(posts.map(post => post.image)).toEqual(["/photo.jpg", "/thumb.jpg", ""]);
    expect(posts[1]).toMatchObject({ text: "", type: "Instagram", date: new Date(common.timestamp) });
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/v27.0/instagram-id/media?");
    expect(url).toContain("thumbnail_url");
    expect(url).toContain("&limit=3");
    expect(url).not.toContain("test-token");
    expect(options).toEqual({
      headers: { Authorization: "Bearer test-token" },
    });
  });

  it("loads one fixed cached batch per platform, filters and merges before consumers slice", async () => {
    vi.stubEnv("NEXT_PUBLIC_FACEBOOK_PAGE_ID", "page-id");
    vi.stubEnv("FACEBOOK_ACCESS_TOKEN", "test-facebook-token");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_ID", "instagram-id");
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "test-instagram-token");
    vi.mocked(fetch).mockImplementation(async (url) => new Response(JSON.stringify({
      data: String(url).includes("/posts?")
        ? [
          { id: "fb-update", created_time: "2026-11-06T21:00:00Z", permalink_url: "/update" },
          { id: "fb", message: "Feest!", created_time: "2026-11-06T20:00:00Z", permalink_url: "/fb" },
        ]
        : [{ id: "ig", caption: "Feest!", timestamp: "2026-11-06T19:59:00Z", media_type: "IMAGE", permalink: "/ig" }],
    })));
    const posts = await fetchSocialPosts();
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const [url, options] of vi.mocked(fetch).mock.calls) {
      expect(url).toContain("&limit=25");
      expect(options).not.toHaveProperty("cache");
    }
    expect(posts).toHaveLength(1);
    expect(posts[0].post).toMatchObject({ type: "Instagram", link: "/ig", date: new Date("2026-11-06T20:00:00Z") });
    expect(posts[0].sources.map((source) => source.link)).toEqual(["/fb", "/ig"]);
  });

  it("logs incomplete configuration and still loads the available platform", async () => {
    const log = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NEXT_PUBLIC_FACEBOOK_PAGE_ID", "");
    vi.stubEnv("FACEBOOK_ACCESS_TOKEN", "");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_ID", "ig");
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "test-token");
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: [] })));
    expect(await fetchSocialPosts()).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("Facebook feed is not configured: missing page ID or access token.");
  });

  it("logs missing configuration without issuing requests", async () => {
    const log = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const key of ["NEXT_PUBLIC_FACEBOOK_PAGE_ID", "FACEBOOK_ACCESS_TOKEN", "NEXT_PUBLIC_INSTAGRAM_ID", "INSTAGRAM_ACCESS_TOKEN"]) {
      vi.stubEnv(key, "");
    }
    expect(await fetchSocialPosts()).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(2);
  });
  for (const [platform, load] of [
    ["Facebook", fetchFacebookPosts], ["Instagram", fetchInstagramPosts],
  ] as const) {
    it(`${platform} uses a saved snapshot on Meta failure without overwriting it`, async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ error: { code: 190 } }), { status: 401 }));
      vi.mocked(loadSocialSnapshot).mockResolvedValueOnce([platform === "Facebook"
        ? { id: "saved", message: "Saved post", created_time: "2026-11-06T20:00:00Z", permalink_url: "/saved" }
        : { id: "saved", caption: "Saved post", timestamp: "2026-11-06T20:00:00Z", media_type: "IMAGE", permalink: "/saved" }]);
      expect(await load("account", "replacement-token")).toEqual([
        expect.objectContaining({ id: "saved", text: "Saved post", date: new Date("2026-11-06T20:00:00Z") }),
      ]);
      expect(saveSocialSnapshot).not.toHaveBeenCalled();
    });

    it(`${platform} rejects malformed snapshots`, async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValue(new Error("Network unavailable"));
      vi.mocked(loadSocialSnapshot).mockResolvedValueOnce([{ id: "broken" }]);
      expect(await load("account", "test-token")).toEqual([]);
      expect(log).toHaveBeenCalledWith(`${platform} snapshot contains invalid posts.`);
    });

    it(`${platform} propagates Next static-generation control flow without API failure logs`, async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const bailout = new DynamicServerError("static generation bailout");
      vi.mocked(fetch).mockRejectedValue(bailout);
      await expect(load("account", "test-token")).rejects.toBe(bailout);
      expect(log).not.toHaveBeenCalled();
      expect(unstable_noStore).not.toHaveBeenCalled();
    });

    it(`${platform} accepts empty successful feeds`, async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: [] })));
      expect(await load("account", "test-token")).toEqual([]);
      expect(saveSocialSnapshot).toHaveBeenCalledWith(platform, "account", expect.any(String), []);
    });

    it.each([
      [{ error: { code: 190, error_subcode: 463, message: "secret-token" } }, 400],
      [{ data: [] }, 500],
      [{ data: "invalid" }, 200],
      [null, 200],
      [{ data: [{ id: "invalid" }] }, 200],
      [{ data: [null] }, 200],
    ])(`${platform} reports invalid/error responses without exposing credentials`, async (payload, status) => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status }));
      expect(await load("account", "test-token")).toEqual([]);
      expect(log).toHaveBeenCalledWith(`${platform} API error:`, expect.objectContaining({ status }));
      expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token");
      expect(unstable_noStore).toHaveBeenCalled();
    });

    it(`${platform} logs request failures without logging sensitive error messages`, async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValue(new Error("URL contains secret-token"));
      expect(await load("account", "test-token")).toEqual([]);
      expect(log).toHaveBeenCalledWith(`${platform} feed request failed:`, "Error");
      expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token");
      expect(unstable_noStore).toHaveBeenCalled();
    });
  }

  it.each([
    { id: 42 },
    { id: "post", created_time: 42, permalink_url: "/post" },
    { id: "post", created_time: "invalid", permalink_url: "/post" },
    { id: "post", created_time: "2026-11-06T20:00:00Z", permalink_url: 42 },
    { id: "post", created_time: "2026-11-06T20:00:00Z", permalink_url: "/post", message: 42 },
    { id: "post", created_time: "2026-11-06T20:00:00Z", permalink_url: "/post", full_picture: null },
  ])("never persists malformed Meta posts (%j)", async (post) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: [post] })));
    expect(await fetchFacebookPosts("page", "test-token")).toEqual([]);
    expect(saveSocialSnapshot).not.toHaveBeenCalled();
  });
});
