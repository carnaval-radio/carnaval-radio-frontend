import "./globals.css";
import { Providers } from "@/GlobalState/Providers";
import type { Metadata } from "next";
import SideBar from "@/components/Sidebar/SideBar";
import MobileHeader from "@/components/MobileHeader";
import Player from "@/components/Player/Player";
import Footer from "@/components/Footer";
import { dosis } from "./fonts/font";
import { client } from "@/GlobalState/ApiCalls/api.config";
import { GET_UI_NAVIGATION } from "@/GlobalState/ApiCalls/graphql/navigation_queries";
import { fetchThemeData } from "@/GlobalState/ApiCalls/fetchTheme";
import GoogleAnalytics from "@/components/Analytics/GoogleAnalytics";
import CookieBanner from "@/components/cookieBanner";
import GoogleAnalyticsPageView from "@/components/Analytics/GoogleAnalyticsPageView";
import StructuredData from "@/components/StructuredData";
import { Suspense } from "react";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import LimburgConsoleMessage from "@/components/LimburgConsoleMessage";

export const metadata: Metadata = {
  title: "Carnaval Radio | 24/7 Limburgse Vastelaovend Muziek",
  description: "De vastelaoves Radio. Carnaval Radio uit Brunssum houdt de Limburgse Vastelaovend traditie in ere met 24/7 carnavalsmuziek. Luister naar de beste Limburgse en Duitse carnavalsleedsjes, polonaise en LVK hits. Live stream en verzoekjes mogelijk.",
  keywords: "Carnaval Radio, Brunssum, Limburg, Vastelaovend, carnavalsmuziek, Limburgse muziek, polonaise, LVK, Parkstad, Zuid-Limburg, carnaval traditie, 24/7 radio, Broenssem, Heerlen, Landgraag, Kerkrade, Echt, Sittard, Roermond, Venlo, Maastricht, Duitse carnavalsmuziek, Vastelaovend hits, carnavalsleedsjes, live stream, verzoekjes",
  authors: [{ name: "Carnaval Radio" }],
  creator: "Carnaval Radio",
  publisher: "Carnaval Radio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.carnaval-radio.nl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Carnaval Radio | 24/7 Limburgse Vastelaovend Muziek",
    description: "Carnaval Radio uit Brunssum houdt de Limburgse Vastelaovend traditie in ere met 24/7 carnavalsmuziek. Luister naar de beste Limburgse en Duitse carnavalsleedsjes.",
    url: 'https://www.carnaval-radio.nl',
    siteName: 'Carnaval Radio',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Carnaval Radio | 24/7 Limburgse Vastelaovend Muziek",
    description: "Carnaval Radio uit Brunssum houdt de Limburgse Vastelaovend traditie in ere met 24/7 carnavalsmuziek.",
  },
  robots: process.env.NEXT_PUBLIC_INDEX_IN_SEARCH_ENGINES
    ? "index, follow"
    : "noindex, nofollow",
};

const GoogleAnalyticsFallback = () => null;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: footer } = await client.query({
    query: GET_UI_NAVIGATION,
    variables: { menuName: "footer" },
  });

  const { data: menu } = await client.query({
    query: GET_UI_NAVIGATION,
    variables: { menuName: "main" },
    context: {
      fetchOptions: {
        next: { revalidate: 3600, tags: ["navigation"]},
      },
    },
  });

  const themeData = await fetchThemeData();
  const GA_MEASUREMENT_ID = process.env.GOOGLE_ANALYTICS_ID;
  return (
    <html lang="nl">
      <head>
        <script
          type="text/javascript"
          src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
          defer
        />
      </head>
      <body className={dosis.className}>
        <LimburgConsoleMessage />
        <Suspense fallback={<GoogleAnalyticsFallback />}>
          {GA_MEASUREMENT_ID && (
          <>
            <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
            <GoogleAnalyticsPageView GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
          </>
          )
        }
          <CookieBanner />
          <StructuredData />
        </Suspense>
        <Providers>
          <MobileHeader themeData={themeData} menu={menu.renderNavigation} />
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0">
            <div className="col-span-1">
              <SideBar menu={menu.renderNavigation} themeData={themeData} />
            </div>
            <div className="col-span-1 sm:col-span-1 md:col-span-3 lg:col-span-4 xl:col-span-5 pb-20">
              {children}
              <Footer data={footer.renderNavigation} themeData={themeData} />
              <Player />
            </div>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
