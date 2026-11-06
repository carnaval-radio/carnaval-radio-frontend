// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PostCard from "@/components/Post/PostCard";
import LatestComments from "@/components/LatestComments";
import type { Post } from "@/types/articleTypes";

vi.mock("@/app/fonts/font", () => ({ Indie: { className: "indie-font" } }));

vi.mock("@/components/Comments/SongCommentsModal", () => ({
  default: ({ songTitle, onClose }: { songTitle: string; onClose: () => void }) =>
    <div role="dialog" aria-label={songTitle}><button onClick={onClose}>Sluiten</button></div>,
}));
vi.mock("@/components/Video", () => ({
  default: ({ src }: { src: string }) => <video data-testid="news-video" src={src} />,
}));

const article = (id: string, date: string): Post => ({
  id,
  attributes: {
    Title: `Nieuws ${id}`,
    Slug: `nieuws-${id}`,
    Content: "<p>Een <strong>mooi</strong> verhaal &amp; meer.</p><iframe>Niet tonen</iframe>",
    publishedAt: date,
    CoverImage: { data: { attributes: { url: `https://example.com/${id}.jpg` } } },
    CoverVideo: { data: { attributes: { url: "" } } },
  },
});
const comment = {
  id: "comment-1",
  content: "Dit liedje brengt mooie herinneringen terug!",
  created_at: "2026-11-06T20:00:00Z",
  song: { custom_song_id: "song-1", title: "Ons liedje", artist: "Onze artiest", cover_url: null },
};

describe("homepage news cards", () => {
  it("sorts without mutating and preserves news links, readable excerpts and images", () => {
    const posts = [article("old", "2026-11-04"), article("new", "2026-11-06")];
    render(<PostCard posts={posts} />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent))
      .toEqual(["Nieuws new", "Nieuws old"]);
    expect(posts[0].id).toBe("old");
    expect(screen.getByRole("link", { name: "Alle nieuws" })).toHaveAttribute("href", "/nieuwsberichten");
    expect(screen.getAllByRole("link", { name: "Nieuws new" })[0]).toHaveAttribute("href", "/nieuwsberichten/nieuws-new");
    expect(screen.getAllByText("Een mooi verhaal & meer.")).toHaveLength(2);
    expect(screen.queryByText("Niet tonen")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")[0]).toHaveClass("bg-tertiaryShade_2");
    expect(screen.getAllByRole("article")[1]).toHaveClass("bg-secondaryShade_2");
    const readLinks = screen.getAllByRole("link", { name: "Lees verder" });
    expect(readLinks[0]).toHaveClass("bg-white", "border-tertiary", "text-tertiary");
    expect(readLinks[1]).toHaveClass("bg-white", "border-secondary", "text-secondary");
    expect(screen.queryByText("Bij Carnaval Radio")).not.toBeInTheDocument();
    expect(screen.queryByText("Verhalen, aankondigingen en alles wat er speelt.")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nieuws" })).toHaveClass("indie-font", "text-3xl", "font-semibold");
    expect(screen.getByRole("link", { name: "Alle nieuws" })).toHaveClass("bg-gradient-to-r");
  });

  it("preserves video covers and renders an explicit second-section title", () => {
    const post = article("video", "2026-11-06");
    post.attributes.CoverVideo.data.attributes.url = "/cover.mp4";
    render(<PostCard posts={[post]} hideTitle />);
    expect(screen.getByRole("heading", { name: "Meer nieuws" })).toHaveAttribute("id", "more-news-title");
    expect(screen.getByTestId("news-video")).toHaveAttribute("src", "/cover.mp4");
  });

  it("preserves archived article routes and handles missing covers", () => {
    const legacy = { ...article("legacy", "2026-11-06"), title: "Oud nieuws!", description: "Archief", pubDate: "2026-11-06" };
    legacy.attributes.CoverImage.data.attributes.url = "";
    render(<PostCard posts={[legacy]} />);
    expect(screen.getAllByRole("link", { name: "Oud nieuws!" })[0])
      .toHaveAttribute("href", "/nieuwsberichten/o/Oud-nieuws");
    expect(screen.getByText("Archief")).toBeInTheDocument();
  });
});

describe("latest comments cards", () => {
  it("shows only the three newest reactions with distinct colourful cards", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      comments: Array.from({ length: 6 }, (_, index) => ({ ...comment, id: String(index), content: `Reactie ${index}` })),
    })));
    render(<LatestComments />);
    await screen.findByText("Reactie 0");
    const cards = screen.getAllByRole("button", { name: /Bekijk reacties op/ });
    expect(cards).toHaveLength(3);
    expect(screen.queryByText("Reactie 3")).not.toBeInTheDocument();
    expect(cards[0]).toHaveClass("border-orange-400");
    expect(cards[1]).toHaveClass("border-rose-400");
    expect(cards[2]).toHaveClass("border-emerald-400");
    expect(screen.getByRole("heading", { name: "Laatste reacties" })).toHaveClass("indie-font", "sm:text-3xl", "font-semibold");
  });

  it("shows a loading state then song/comment cards and refreshes after closing the modal", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ comments: [comment] })));
    render(<LatestComments />);
    expect(screen.getByRole("status", { name: "Reacties laden" })).toBeInTheDocument();
    const card = await screen.findByRole("button", { name: "Bekijk reacties op Ons liedje van Onze artiest" });
    expect(screen.getByText(comment.content)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Alle reacties" })).toHaveAttribute("href", "/reacties");
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ comments: [comment] })));
    fireEvent.click(card);
    expect(screen.getByRole("dialog", { name: "Ons liedje" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sluiten" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows an invitation when there are no comments", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ comments: [] })));
    render(<LatestComments />);
    expect(await screen.findByText(/Nog geen reacties/)).toBeInTheDocument();
  });

  it("reports request errors instead of presenting them as an empty feed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch).mockResolvedValue(new Response("Unavailable", { status: 503 }));
    render(<LatestComments />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Reacties konden niet worden geladen");
    expect(screen.queryByText(/Nog geen reacties/)).not.toBeInTheDocument();
  });
});
