// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { describeContent, pageMetadata, SITE_URL } from "@/helpers/seo";
import StructuredData from "@/components/StructuredData";
import { generateMetadata as contentMetadata, generateStaticParams } from "@/app/[slug]/page";
import { generateMetadata as eventsMetadata } from "@/app/events/page";
import { generateMetadata as teamMetadata } from "@/app/team/[sortorder]/page";
import { generateMetadata as newsMetadata } from "@/app/articles/page";
import { generateMetadata as homeMetadata } from "@/app/page";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/GlobalState/ApiCalls/api.config", () => ({ client: { query: mocks.query } }));
vi.mock("@/app/fonts/font", () => ({ Indie: { className: "indie" } }));
vi.mock("@/components/Sponsors/Sponsors", () => ({ default: () => null }));
vi.mock("@/components/Hero/Hero", () => ({ default: () => null }));
vi.mock("@/components/LatestComments", () => ({ default: () => null }));
vi.mock("@/components/Team/TeamMember", () => ({ default: () => null }));

beforeEach(() => {
  mocks.query.mockReset();
  mocks.query.mockResolvedValue({
    data: { pages: { data: [{ attributes: {
      Title: "Over ons",
      Slug: "over-ons",
      Content: "<p>Een team uit <strong>Brunssum</strong> &amp; Parkstad.</p>",
    } }] } },
  });
});

describe("search metadata", () => {
  it("extracts readable descriptions without markup, encoded entities or scripts", () => {
    expect(describeContent("<p>Radio &amp; muziek</p><p>Uit Limburg&nbsp;!</p><script>hidden()</script><style>hidden</style>"))
      .toBe("Radio & muziek Uit Limburg !");
    const result = describeContent("Carnavalsmuziek ".repeat(20));
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result).toMatch(/Carnavalsmuziek\.\.\.$/);
    expect(describeContent("a".repeat(200))).toHaveLength(160);
    expect(describeContent("")).toBe("");
  });

  it("keeps search and sharing metadata consistent", () => {
    const metadata = pageMetadata("Title", "Description", "/example");
    expect(metadata).toMatchObject({
      title: "Title", description: "Description",
      alternates: { canonical: "/example" },
      openGraph: { title: "Title", description: "Description", url: "/example" },
      twitter: { title: "Title", description: "Description" },
    });
  });

  it("gives the main sitelink pages unique descriptions and canonicals", async () => {
    const items = await Promise.all([homeMetadata(), newsMetadata(), eventsMetadata(), teamMetadata()]);
    expect(new Set(items.map((item) => item.description)).size).toBe(4);
    expect(items.map((item) => item.alternates?.canonical))
      .toEqual(["/", "/nieuwsberichten", "/evenementen", "/team/standaard"]);
  });

  it("uses Strapi titles and content rather than inheriting the homepage description", async () => {
    expect(await contentMetadata({ params: { slug: "over-ons" } })).toMatchObject({
      title: "Over ons | Carnaval Radio",
      description: "Een team uit Brunssum & Parkstad.",
      alternates: { canonical: "/over-ons" },
    });
    expect(mocks.query).toHaveBeenCalledWith(expect.objectContaining({
      variables: { slugUrl: "over-ons" },
      context: { fetchOptions: { next: { revalidate: 60, tags: ["pages"] } } },
    }));
  });

  it("uses distinct listening and live broadcast descriptions", async () => {
    const listen = await contentMetadata({ params: { slug: "luisteren" } });
    const live = await contentMetadata({ params: { slug: "live-uitzendingen" } });
    expect(listen.description).toContain("Luister gratis online");
    expect(live.description).toContain("waar en wanneer");
    expect(listen.description).not.toBe(live.description);
  });

  it("does not index missing CMS pages or swallow CMS failures", async () => {
    mocks.query.mockResolvedValueOnce({ data: { pages: { data: [] } } });
    expect(await contentMetadata({ params: { slug: "missing" } }))
      .toMatchObject({ robots: { index: false } });
    mocks.query.mockRejectedValueOnce(new Error("CMS unavailable"));
    await expect(contentMetadata({ params: { slug: "over-ons" } })).rejects.toThrow("CMS unavailable");
  });

  it("generates the Next.js parameter objects from Strapi's Slug field", async () => {
    expect(await generateStaticParams()).toEqual([{ slug: "over-ons" }]);
  });

  it("renders linked station and website entities in a native server-renderable script", () => {
    const { container } = render(<StructuredData />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent!);
    expect(data["@graph"]).toHaveLength(2);
    expect(data["@graph"][0]).toMatchObject({
      "@type": "RadioStation", "@id": `${SITE_URL}/#station`,
      address: { addressLocality: "Brunssum", addressRegion: "Limburg" },
    });
    expect(data["@graph"][0]).not.toHaveProperty("broadcastFrequency");
    expect(data["@graph"][0].areaServed).toContainEqual(expect.objectContaining({
      "@type": "AdministrativeArea", name: "Limburg",
    }));
    expect(data["@graph"][0].areaServed).toContainEqual({
      "@type": "City", name: "Beekdaelen",
      containedInPlace: { "@type": "AdministrativeArea", name: "Limburg" },
    });
    expect(data["@graph"][0].areaServed.filter((area: { "@type": string }) => area["@type"] === "City")
      .map((city: { name: string }) => city.name)).toEqual([
      "Brunssum", "Beekdaelen", "Heerlen", "Maastricht", "Sittard", "Geleen",
      "Roermond", "Venlo", "Weert", "Kerkrade", "Landgraaf", "Venray",
    ]);
    expect(data["@graph"][1]).toMatchObject({
      "@type": "WebSite", publisher: { "@id": `${SITE_URL}/#station` },
    });
  });
});
