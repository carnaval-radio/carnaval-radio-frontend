import { client } from "@/GlobalState/ApiCalls/api.config";
import { GET_ALL_SLUGS_FOR_CONTENT_PAGES, GET_SINGLE_PAGE } from "@/GlobalState/ApiCalls/graphql/page_queries";
import { SingleContentPage } from "@/types/pageTypes";
import ReactHtmlParser from "html-react-parser";
import { Indie } from "@/app/fonts/font";
import NotFoundPage from "@/components/NotFoundPage";
import { describeContent, pageMetadata } from "@/helpers/seo";
import { ContentPage } from "@/types/pageTypes";

const descriptions: Record<string, string> = {
  luisteren: "Luister gratis online naar Carnaval Radio uit Brunssum. De livestream speelt 24/7 Limburgse en Duitse carnavalsmuziek, Vastelaovend-leedjes en LVK-hits.",
  "live-uitzendingen": "Bekijk de live-uitzendingen van Carnaval Radio tijdens de Vastelaovend in Brunssum. Lees waar en wanneer we uitzenden en luister online mee.",
};

async function fetchPage(slug: string): Promise<SingleContentPage | undefined> {
  const { data } = await client.query({
    query: GET_SINGLE_PAGE,
    variables: { slugUrl: slug },
    context: {
      fetchOptions: { next: { revalidate: 60, tags: ["pages"] } },
    },
  });
  return data.pages.data?.[0]?.attributes;
}

export async function generateStaticParams() {
  const { data } = await client.query({
    query: GET_ALL_SLUGS_FOR_CONTENT_PAGES,     
    context: {
      fetchOptions: {
        next: { revalidate: 60, tags: ["pages"] },
      },
    },
  });

  return data.pages.data.map((page: ContentPage) => ({ slug: page.attributes.Slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const page = await fetchPage(slug);
  if (!page) return { title: "Pagina niet gevonden | Carnaval Radio", robots: { index: false } };
  return pageMetadata(
    `${page.Title} | Carnaval Radio`,
    descriptions[slug] || describeContent(page.Content),
    `/${slug}`,
  );
}

const page = async ({ params }: { params: { slug: string } }) => {
  const slug = params.slug;
  const page = await fetchPage(slug);

  if (!page)
    return <NotFoundPage />;

  return (
    <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
      {page && (
        <>
          <div className="p-8 rounded-3xl bg-white max-w-3xl">
            <h1
              className={`text-3xl text-primary mb-5 font-bold ${Indie.className}`}
            >
              {page.Title}
            </h1>
            <div className="cms-content mb-4">{ReactHtmlParser(page.Content)}</div>
          </div>
          {/* Sponsor slider at the bottom */}
          <div className="mt-8">
            <Suspense fallback={null}>
              <Sponsors />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
};

import Sponsors from "@/components/Sponsors/Sponsors";
import { Suspense } from "react";
export default page;
