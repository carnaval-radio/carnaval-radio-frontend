// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { prepareSocialPosts, type SocialPost } from "@/GlobalState/ApiCalls/fetchSocials";
import Widget from "@/components/Socials/SocialWidget";

const SocialWidget = ({ posts }: { posts: SocialPost[] }) =>
  <Widget posts={prepareSocialPosts(posts)} />;

const post = (
  id: string,
  type: SocialPost["type"],
  day: number,
  text = `Bericht ${id}`,
): SocialPost => ({
  id,
  type,
  date: new Date(`2026-11-${String(day).padStart(2, "0")}T12:00:00Z`),
  text,
  image: `https://example.com/${id}.jpg`,
  link: `https://example.com/posts/${id}`,
});

const cards = () => screen.getAllByRole("link", { name: /Bekijk bericht op/ });

describe("homepage social widget", () => {
  it("does not show an empty section", () => {
    const { container } = render(<SocialWidget posts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("combines matching cross-posts and keeps both platform links", () => {
    render(<SocialWidget posts={[
      post("ig", "Instagram", 6, "  Ons   FEEST!\nTot dan "),
      post("fb", "Facebook", 5, "Ons feest! Tot dan"),
    ]} />);
    expect(cards()).toHaveLength(1);
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Op onze socials" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open dit bericht op Facebook/ }))
      .toHaveAttribute("href", "https://example.com/posts/fb");
    expect(screen.getByRole("link", { name: /Open dit bericht op Instagram/ }))
      .toHaveAttribute("href", "https://example.com/posts/ig");
    expect(screen.queryByText("Facebook + Instagram")).not.toBeInTheDocument();
    expect(screen.getAllByText("Facebook")[0]).toHaveClass("bg-orange-500");
    expect(screen.getAllByText("Instagram")[0]).toHaveClass("bg-red-500");
  });

  it("combines identical cross-platform images with different genuine captions", () => {
    render(<SocialWidget posts={[
      post("same", "Instagram", 6, "Feest"),
      post("same", "Facebook", 6, "Tot dan!"),
    ]} />);
    expect(cards()).toHaveLength(1);
  });

  const announcement = "De derde artiest is bekend! Onze jubileumfeestavond wordt steeds mooier. Beppie Kraft komt naar Brunssum met onvergetelijke nummers en aanstekelijke energie. Samen maken we een groot feest in de Brikke Oave op zaterdag. Kaarten zijn zondag verkrijgbaar.";

  it("combines long captions with small emoji, mention and tag differences", () => {
    render(<SocialWidget posts={[
      post("ig", "Instagram", 6, `🎉 ${announcement} 🎶 @beppiekraft #Feest`),
      post("fb", "Facebook", 6, `${announcement} Beppie Kraft PLUS Quaedvlieg #Brunssum`),
    ]} />);
    expect(cards()).toHaveLength(1);
  });

  it("does not combine different announcements with shared boilerplate", () => {
    render(<SocialWidget posts={[
      post("ig", "Instagram", 6, announcement),
      post("fb", "Facebook", 6, announcement.replace("derde", "vierde").replace("Beppie Kraft", "Erwin")),
    ]} />);
    expect(cards()).toHaveLength(2);
  });

  it("does not combine substantially different captions with the same opening", () => {
    render(<SocialWidget posts={[
      post("ig", "Instagram", 6, announcement),
      post("fb", "Facebook", 6, "De derde artiest is bekend! Onze jubileumfeestavond begint met een nieuwe show vol verrassingen dansers muzikanten licht geluid optredens gezelligheid hapjes drankjes plezier vrienden familie tickets reserveringen"),
    ]} />);
    expect(cards()).toHaveLength(2);
  });

  it("filters empty captions but keeps same-platform posts and later reposts", () => {
    render(<SocialWidget posts={[
      post("ig", "Instagram", 6, ""),
      post("fb", "Facebook", 6, ""),
      post("fb-new", "Facebook", 6, "Feest"),
      post("fb-other", "Facebook", 5, "Feest"),
      post("ig-old", "Instagram", 1, "Feest"),
    ]} />);
    expect(cards()).toHaveLength(3);
  });

  it("mixes platforms newest-first and does not mutate input", () => {
    const posts = [
      post("fb-old", "Facebook", 1),
      post("ig-new", "Instagram", 6),
      post("fb-new", "Facebook", 5),
      post("ig-old", "Instagram", 2),
    ];
    render(<SocialWidget posts={posts} />);
    expect(cards().map((card) => card.getAttribute("href"))).toEqual([
      "https://example.com/posts/ig-new",
      "https://example.com/posts/fb-new",
      "https://example.com/posts/ig-old",
      "https://example.com/posts/fb-old",
    ]);
    expect(posts[0].id).toBe("fb-old");
    expect(screen.getByRole("link", { name: /Alles bekijken/ })).toHaveAttribute("href", "/social");
  });

  it("keeps the latest posts first even when one platform has more recent posts", () => {
    render(<SocialWidget posts={[
      post("fb-1", "Facebook", 6),
      post("fb-2", "Facebook", 5),
      post("fb-3", "Facebook", 4),
      post("ig-1", "Instagram", 3),
    ]} />);
    expect(cards().map((card) => card.getAttribute("href")?.split("/").pop()))
      .toEqual(["fb-1", "fb-2", "fb-3", "ig-1"]);
  });

  it("splits one prepared feed into distinct widgets without losing cross-platform links", () => {
    const posts = Array.from({ length: 6 }, (_, index) => [
      post(`fb-${index}`, "Facebook", index + 1, `Announcement ${index}`),
      post(`ig-${index}`, "Instagram", index + 1, `Announcement ${index}`),
    ]).flat();
    const prepared = prepareSocialPosts(posts);
    render(<>
      <Widget posts={prepared.slice(0, 3)} />
      <Widget posts={prepared.slice(3, 6)} continuation />
    </>);
    expect(cards()).toHaveLength(6);
    expect(new Set(cards().map((card) => card.getAttribute("href"))).size).toBe(6);
    expect(cards().map((card) => card.getAttribute("href")?.split("/").pop()))
      .toEqual(["ig-5", "ig-4", "ig-3", "ig-2", "ig-1", "ig-0"]);
    expect(screen.getByRole("heading", { name: "Op onze socials" })).toHaveAttribute("id", "social-widget-title");
    expect(screen.getByRole("heading", { name: "Meer op onze socials" })).toHaveAttribute("id", "social-widget-more-title");
    expect(screen.getAllByRole("link", { name: /Open dit bericht op Instagram/ })).toHaveLength(6);
  });

  it.each(["Facebook", "Instagram"] as const)("works with only %s available", (type) => {
    render(<SocialWidget posts={[post("older", type, 1), post("newer", type, 6)]} />);
    expect(cards()).toHaveLength(2);
    expect(cards()[0]).toHaveAttribute("href", "https://example.com/posts/newer");
  });

  it("uses safe new-tab links, short captions, dated posts and an image fallback", () => {
    const item = { ...post("long", "Facebook", 6, "x".repeat(200)), image: "" };
    render(<SocialWidget posts={[item, post("empty", "Instagram", 5, "")]} />);
    expect(screen.getByText(`${"x".repeat(160)}...`)).toBeInTheDocument();
    expect(screen.queryByText(/Een kijkje bij/)).not.toBeInTheDocument();
    expect(cards()).toHaveLength(1);
    for (const card of cards()) {
      expect(card).toHaveAttribute("target", "_blank");
      expect(card).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(screen.getByAltText("Foto bij bericht op Facebook").getAttribute("src"))
      .toContain("res.cloudinary.com");
    expect(screen.getByText("6 november 2026")).toHaveAttribute("dateTime", item.date.toISOString());
    expect(screen.getByRole("region", { name: "Recente social posts" })).toHaveAttribute("tabindex", "0");
  });

  it.each(["", " \n ", "🎉 🎶", "#Feest @carnavalradio https://example.com"])(
    "filters captionless or non-content updates: %s", (text) => {
      expect(prepareSocialPosts([post("update", "Facebook", 6, text)])).toEqual([]);
    },
  );

  it("keeps short genuine posts rather than imposing a minimum length", () => {
    expect(prepareSocialPosts([post("short", "Instagram", 6, "Tot zo!")])).toHaveLength(1);
  });

  it("renders platform pills as independent links, never nested inside the image link", () => {
    render(<SocialWidget posts={[
      post("fb", "Facebook", 6, "Feest"),
      post("ig", "Instagram", 5, "Feest"),
    ]} />);
    expect(cards()[0]).toHaveAttribute("href", "https://example.com/posts/ig");
    for (const type of ["Facebook", "Instagram"]) {
      const pill = screen.getByRole("link", { name: new RegExp(`Open dit bericht op ${type}`) });
      expect(pill.parentElement?.closest("a")).toBeNull();
      expect(pill).toHaveAttribute("target", "_blank");
      expect(pill).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("uses a full grid without a self-link on the see-all page", () => {
    render(<Widget posts={prepareSocialPosts([post("all", "Facebook", 6)])} allPosts />);
    expect(screen.queryByRole("link", { name: /Alles bekijken/ })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Recente social posts" })).toHaveClass("grid-cols-1");
  });
});
