// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SocialPost } from "@/GlobalState/ApiCalls/fetchSocials";
import HomePage from "@/app/page";
import SocialPage from "@/app/social/page";

const mocks = vi.hoisted(() => ({
  news: vi.fn(),
  social: vi.fn(),
}));

vi.mock("@/GlobalState/ApiCalls/fetchPosts", () => ({ fetchPosts: mocks.news }));
vi.mock("@/GlobalState/ApiCalls/fetchSocials", () => ({
  fetchSocialPosts: mocks.social,
}));
vi.mock("@/components/Hero/Hero", () => ({ default: () => null }));
vi.mock("@/components/Sponsors/Sponsors", () => ({ default: () => null }));
vi.mock("@/components/LatestComments", () => ({
  default: () => <h2>Laatste reacties</h2>,
}));
vi.mock("@/components/Post/PostCard", () => ({
  default: ({ posts }: { posts: { id: number }[] }) => <h2>Nieuws {posts.map((post) => post.id).join(",")}</h2>,
}));

const feed = (type: SocialPost["type"]): SocialPost[] =>
  Array.from({ length: 6 }, (_, index) => ({
    id: `${type}-${index}`,
    type,
    date: new Date(`2026-11-0${6 - index}T12:00:00Z`),
    text: `Announcement ${index}`,
    image: `https://example.com/${type}-${index}.jpg`,
    link: `https://example.com/${type}/${index}`,
  }));

beforeEach(() => {
  vi.stubEnv("ENABLE_SOCIAL_POSTS", "true");
  mocks.news.mockResolvedValue(Array.from({ length: 6 }, (_, index) => ({ id: index + 1 })));
  mocks.social.mockResolvedValue(feed("Instagram").map((post, index) => ({
    post, sources: [post, feed("Facebook")[index]],
  })));
});

describe("homepage social layout", () => {
  it("reuses the shared feed and places six unique recent posts around comments", async () => {
    render(await HomePage());
    expect(mocks.social).toHaveBeenCalledExactlyOnceWith();
    expect(screen.getAllByRole("heading").slice(0, 5).map((heading) => heading.textContent))
      .toEqual(["Nieuws 1,2,3", "Op onze socials", "Laatste reacties", "Meer op onze socials", "Nieuws 4,5,6"]);
    const first = screen.getByRole("region", { name: "Op onze socials" });
    const second = screen.getByRole("region", { name: "Meer op onze socials" });
    expect(first.querySelectorAll("article")).toHaveLength(3);
    expect(second.querySelectorAll("article")).toHaveLength(3);
    expect(Array.from(document.querySelectorAll("article time")).map((time) => time.getAttribute("datetime")))
      .toEqual(feed("Facebook").map((post) => post.date.toISOString()));
  });

  it("does not fetch or render widgets when disabled", async () => {
    vi.stubEnv("ENABLE_SOCIAL_POSTS", "false");
    render(await HomePage());
    expect(mocks.social).not.toHaveBeenCalled();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "Laatste reacties" })).toBeInTheDocument();
  });

  it("keeps the available platform when the other feed is empty", async () => {
    mocks.social.mockResolvedValue(feed("Instagram").map((post) => ({ post, sources: [post] })));
    render(await HomePage());
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.queryByText("Facebook")).not.toBeInTheDocument();
  });

  it("uses the same widget and all shared posts on the see-all page, regardless of homepage flag", async () => {
    vi.stubEnv("ENABLE_SOCIAL_POSTS", "false");
    render(await SocialPage());
    expect(mocks.social).toHaveBeenCalledExactlyOnceWith();
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getByRole("heading", { name: "Op onze socials" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Alles bekijken/ })).not.toBeInTheDocument();
  });

  it("shows an explicit empty state on the see-all page", async () => {
    mocks.social.mockResolvedValue([]);
    render(await SocialPage());
    expect(screen.getByText("Er zijn momenteel geen social posts beschikbaar.")).toBeInTheDocument();
  });
});
