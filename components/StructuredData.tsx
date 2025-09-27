import Script from 'next/script'

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    "name": "Carnaval Radio",
    "description": "Carnaval Radio uit Brunssum houdt de Limburgse Vastelaovend traditie in ere met 24/7 carnavalsmuziek",
    "url": "https://www.carnaval-radio.nl",
    "logo": "https://www.carnaval-radio.nl/assets/logo-2.png",
    "sameAs": [
      "https://www.facebook.com/carnavalradio",
      "https://www.instagram.com/carnaval.radio"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Brunssum",
      "addressRegion": "Limburg",
      "addressCountry": "NL"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Parkstad, Zuid-Limburg"
    },
    "genre": ["Carnavalsmuziek", "Limburgse muziek", "Vastelaovend", "Polonaise", "LVK"],
    "broadcastFrequency": "24/7",
    "broadcastTimezone": "Europe/Amsterdam",
    "inLanguage": "nl",
    "foundingDate": "2005",
    "slogan": "24/7 Vastelaovend Muziek"
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
