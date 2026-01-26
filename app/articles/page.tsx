import PostDetails from "@/components/Post/PostDetails";
import SectionTitle from "@/components/constants/SectionTitle";
import news from "../../public/news.png";
import { oldArticles } from "@/data/allNewsArticles"
import { fetchPosts } from "@/GlobalState/ApiCalls/fetchPosts";

export async function generateMetadata() {
  return {
    title: `Nieuws | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
    description: `Blijf op de hoogte van de laatste nieuwsberichten en updates van Carnaval Radio. Ontdek de nieuwste ontwikkelingen, evenementen en verrassingen op het gebied van vasteloavend muziek en carnavalsfeest.`,
    alternates: {
      canonical: `/nieuwsberichten`,
    },
  };
}

const page = async () => {
  const posts = await fetchPosts();

  function customSort(a: any, b: any) {
    const dateA: any = a.attributes.Date
      ? new Date(a.attributes.Date)
      : new Date(a.attributes.publishedAt);
    const dateB: any = b.attributes.Date
      ? new Date(b.attributes.Date)
      : new Date(b.attributes.publishedAt);

    // Compare the parsed dates
    return dateB - dateA;
  }

  const sortedPosts = [...posts].sort(customSort);
  const allPosts = [...sortedPosts, ...oldArticles];

  return (
    <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8">
      <div className="flex justify-between items-center">
        <SectionTitle title="Nieuws" image={news} />
      </div>

      {allPosts && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-6 2xl:gap-10 pt-2 sm:pt-2 md:pt-6 lg:pt-10 xl:pt-10">
          {allPosts.map((post: any, i: any) => (
            <PostDetails
              key={"postDetail" + i}
              post={post}
              colorIndex={i % 3}
            />
          ))}
        </div>
      )}
      {/* Sponsor slider at the bottom */}
      <div className="mt-8">
        <Suspense fallback={null}>
          <Sponsors />
        </Suspense>
      </div>
    </div>
  );
};

import Sponsors from "@/components/Sponsors/Sponsors";
import { Suspense } from "react";
export default page;
