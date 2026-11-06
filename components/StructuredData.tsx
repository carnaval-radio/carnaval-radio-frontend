import { SITE_URL, SITE_DESCRIPTION } from "@/helpers/seo";

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RadioStation",
        "@id": `${SITE_URL}/#station`,
        name: "Carnaval Radio",
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        logo: `${SITE_URL}/assets/logo-2.png`,
        sameAs: [
          "https://www.facebook.com/carnavalradio",
          "https://www.instagram.com/carnaval.radio",
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Brunssum",
          addressRegion: "Limburg",
          addressCountry: "NL",
        },
        areaServed: [
          { "@type": "AdministrativeArea", name: "Limburg", containedInPlace: { "@type": "Country", name: "Nederland" } },
          { "@type": "Place", name: "Parkstad" },
          ...[
            "Brunssum", "Beekdaelen", "Heerlen", "Maastricht", "Sittard", "Geleen",
            "Roermond", "Venlo", "Weert", "Kerkrade", "Landgraaf", "Venray",
          ].map((name) => ({
            "@type": "City",
            name,
            containedInPlace: { "@type": "AdministrativeArea", name: "Limburg" },
          })),
        ],
        foundingDate: "2005",
        slogan: "24/7 Vastelaovend Muziek",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Carnaval Radio",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "nl-NL",
        publisher: { "@id": `${SITE_URL}/#station` },
      },
    ],
  };

  return (
    <script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
