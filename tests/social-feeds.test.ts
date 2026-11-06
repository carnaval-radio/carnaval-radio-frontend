import { describe, expect, it, vi } from "vitest";
import { fetchFacebookPosts, fetchInstagramPosts } from "@/GlobalState/ApiCalls/fetchSocials";

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
        next: { revalidate: 3600, tags: ["social"] },
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
      next: { revalidate: 3600, tags: ["social"] },
    });
  });

  for (const [platform, load] of [
    ["Facebook", fetchFacebookPosts], ["Instagram", fetchInstagramPosts],
  ] as const) {
    it(`${platform} accepts empty successful feeds`, async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: [] })));
      expect(await load("account", "test-token")).toEqual([]);
    });

    it.each([
      [{ error: { code: 190, error_subcode: 463, message: "secret-token" } }, 400],
      [{ data: [] }, 500],
      [{ data: "invalid" }, 200],
    ])(`${platform} reports invalid/error responses without exposing credentials`, async (payload, status) => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status }));
      expect(await load("account", "test-token")).toEqual([]);
      expect(log).toHaveBeenCalledWith(`${platform} API error:`, expect.objectContaining({ status }));
      expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token");
    });

    it(`${platform} logs request failures without logging sensitive error messages`, async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValue(new Error("URL contains secret-token"));
      expect(await load("account", "test-token")).toEqual([]);
      expect(log).toHaveBeenCalledWith(`${platform} feed request failed:`, "Error");
      expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token");
    });
  }
});
