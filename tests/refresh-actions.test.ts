import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath, revalidateTag } from "next/cache";
import { client } from "@/GlobalState/ApiCalls/api.config";
import refresh from "@/app/refresh/actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock("@/GlobalState/ApiCalls/api.config", () => ({
  client: { query: vi.fn() },
}));

beforeEach(() => {
  vi.mocked(client.query).mockResolvedValue({
    data: {
      articles: {
        data: [
          { attributes: { Slug: "first-article" } },
          { attributes: { Slug: "second-article" } },
          { attributes: {} },
        ],
      },
    },
    loading: false,
    networkStatus: 7,
  });
});

describe("cache refresh actions", () => {
  it("refreshes only the homepage and navigation when explicitly selected", async () => {
    await refresh(["/", "navigation"]);
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/");
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("navigation");
    expect(client.query).not.toHaveBeenCalled();
  });

  it("refreshes all configured site tags, paths, and three recent articles by default", async () => {
    await refresh();
    expect(vi.mocked(revalidateTag).mock.calls.map(([tag]) => tag).sort())
      .toEqual(["pages", "sponsors", "team", "events", "twitch", "slides", "navigation", "social"].sort());
    expect(vi.mocked(revalidatePath).mock.calls.map(([path]) => path).sort()).toEqual([
      "/sponsoren", "/sitemap.xml", "/articles", "/team", "/events", "/",
      "/nieuwsberichten/first-article", "/nieuwsberichten/second-article",
    ].sort());
    expect(client.query).toHaveBeenCalledWith(expect.objectContaining({ variables: { limit: 3 } }));
  });

  it("supports a custom recent article count alongside explicit tags", async () => {
    await refresh(["recent-news=5", "slides"]);
    expect(client.query).toHaveBeenCalledWith(expect.objectContaining({ variables: { limit: 5 } }));
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("slides");
    expect(revalidateTag).not.toHaveBeenCalledWith("recent-news=5");
  });

  it("uses the existing default for an invalid recent article count", async () => {
    await refresh(["recent-news=invalid"]);
    expect(client.query).toHaveBeenCalledWith(expect.objectContaining({ variables: { limit: 3 } }));
  });

  it("handles a CMS response without articles", async () => {
    vi.mocked(client.query).mockResolvedValue({ data: {}, loading: false, networkStatus: 7 });
    await refresh(["recent-news=3"]);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("propagates CMS failures instead of reporting successful refresh", async () => {
    const error = new Error("CMS unavailable");
    vi.mocked(client.query).mockRejectedValue(error);
    await expect(refresh(["recent-news=3"])).rejects.toThrow(error);
  });
});
