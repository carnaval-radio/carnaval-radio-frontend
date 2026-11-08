// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EventsStructuredData from "@/components/Events/EventsStructuredData";
import EventsList from "@/components/Events/EventsList";
import Page from "@/app/events/page";
import type { Event } from "@/GlobalState/ApiCalls/fetchEvents";
import { SITE_URL } from "@/helpers/seo";

const mocks = vi.hoisted(() => ({ fetchEvents: vi.fn() }));
vi.mock("@/GlobalState/ApiCalls/fetchEvents", () => ({ fetchEvents: mocks.fetchEvents }));
vi.mock("@/app/fonts/font", () => ({ Indie: { className: "indie" } }));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("@/components/Events/SubmitEventForm", () => ({ default: () => null }));

const event: Event = {
  id: "40",
  Title: "Carnaval Radio feest",
  Date: "2027-01-23T18:30:00.000Z",
  Address: "Brikke Oave, Brunssum",
  Link: "/nieuwsberichten/feest",
  IsHighlighted: true,
};

function readData(container: HTMLElement) {
  const script = container.querySelector("#events-structured-data");
  if (!script?.textContent) throw new Error("Missing event JSON-LD");
  return JSON.parse(script.textContent);
}

describe("agenda structured data", () => {
  it("renders event names, exact dates and factual location text with matching card anchors", () => {
    const { container } = render(<>
      <EventsStructuredData events={[event]} />
      <EventsList events={[event]} />
    </>);
    const data = readData(container);
    expect(data).toMatchObject({
      "@context": "https://schema.org", "@type": "ItemList",
      url: `${SITE_URL}/evenementen`, inLanguage: "nl-NL", numberOfItems: 1,
    });
    expect(data.itemListElement).toEqual([{
      "@type": "ListItem", position: 1,
      item: {
        "@type": "Event", "@id": `${SITE_URL}/evenementen#event-40`,
        url: `${SITE_URL}/evenementen#event-40`, name: event.Title,
        startDate: event.Date, location: { "@type": "Place", name: event.Address },
      },
    }]);
    expect(container.querySelector("#event-40")).toHaveTextContent(event.Title);
  });

  it("escapes CMS script content without altering the parsed data", () => {
    const title = "</script><script>alert(1)</script>";
    const { container } = render(<EventsStructuredData events={[{ ...event, Title: title }]} />);
    expect(container.querySelectorAll("script")).toHaveLength(1);
    expect(container.querySelector("script")?.textContent).not.toContain("<");
    expect(readData(container).itemListElement[0].item.name).toBe(title);
  });

  it("omits unknown dates and locations rather than generating misleading data", () => {
    const { container } = render(<EventsStructuredData events={[{ ...event, Date: "invalid", Address: "" }]} />);
    const item = readData(container).itemListElement[0].item;
    expect(item).not.toHaveProperty("startDate");
    expect(item).not.toHaveProperty("location");
    expect(item).not.toHaveProperty("offers");
    expect(item).not.toHaveProperty("endDate");
    expect(item).not.toHaveProperty("organizer");
  });

  it("supports an empty agenda", () => {
    const { container } = render(<EventsStructuredData events={[]} />);
    expect(readData(container)).toMatchObject({ numberOfItems: 0, itemListElement: [] });
  });

  it("wires the server page to the same published events and order as the visible cards", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-08T10:00:00Z"));
    const past = { ...event, id: "old", Title: "Eerder feest", Date: "2025-01-01T12:00:00Z" };
    mocks.fetchEvents.mockResolvedValue([past, event]);
    const { container } = render(await Page());
    expect(readData(container).itemListElement.map((item: { item: { name: string } }) => item.item.name))
      .toEqual([event.Title, past.Title]);
    expect(Array.from(container.querySelectorAll("article")).map((card) => card.id))
      .toEqual(["event-40", "event-old"]);
  });
});
