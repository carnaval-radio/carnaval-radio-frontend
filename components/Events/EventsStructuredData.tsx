import type { Event } from "@/GlobalState/ApiCalls/fetchEvents";
import { SITE_URL } from "@/helpers/seo";

export default function EventsStructuredData({ events }: { events: Event[] }) {
  const items = events.map((event, index) => {
    const url = `${SITE_URL}/evenementen#event-${encodeURIComponent(event.id)}`;
    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        "@id": url,
        url,
        name: event.Title,
        ...(Number.isNaN(Date.parse(event.Date)) ? {} : { startDate: event.Date }),
        ...(event.Address ? {
          location: { "@type": "Place", name: event.Address },
        } : {}),
      },
    };
  });

  return (
    <script
      id="events-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${SITE_URL}/evenementen#agenda`,
          name: "Carnaval Radio evenementen",
          url: `${SITE_URL}/evenementen`,
          inLanguage: "nl-NL",
          numberOfItems: items.length,
          itemListElement: items,
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
