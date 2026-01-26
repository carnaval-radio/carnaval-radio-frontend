import { client } from "@/GlobalState/ApiCalls/api.config";
import { GET_ALL_SLUGS_FOR_CONTENT_PAGES, GET_SINGLE_PAGE } from "@/GlobalState/ApiCalls/graphql/page_queries";
import { SingleContentPage } from "@/types/pageTypes";
import ReactHtmlParser from "html-react-parser";
import { Indie } from "@/app/fonts/font";
import NotFoundPage from "@/components/NotFoundPage";

export async function generateStaticParams() {
  const { data } = await client.query({
    query: GET_ALL_SLUGS_FOR_CONTENT_PAGES,     
    context: {
      fetchOptions: {
        next: { revalidate: 60, tags: ["pages"] },
      },
    },
  });

  return data.pages.data.map((page: any) => page.attributes.slug);
}

export async function generateMetadata({ params }: any) {
  const slug = params.slug;
  const capitalize = (str: any) => str.charAt(0).toUpperCase() + str.slice(1);
  return {
    title: `${capitalize(slug)} | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

const page = async ({ params }: { params: { slug: string } }) => {
  const slug = params.slug;
  const { error, data } = await client.query({
    query: GET_SINGLE_PAGE,
    variables: { slugUrl: slug },
    context: {
      fetchOptions: {
        next: { revalidate: 60, tags: ["pages"] },
      },
    },
  });

  let page: SingleContentPage;
  page = data.pages.data?.[0]?.attributes;

  if (!page)
    return <NotFoundPage />;

  return (
    <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
      {!error && page && (
        <>
          <div className="p-8 rounded-3xl bg-white max-w-3xl">
            <h2
              className={`text-3xl text-primary mb-5 font-bold ${Indie.className}`}
            >
              {page.Title}
            </h2>
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
