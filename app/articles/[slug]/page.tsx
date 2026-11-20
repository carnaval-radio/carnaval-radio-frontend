import { queryData } from "@/GlobalState/ApiCalls/api.config";
import { GET_SINGLE_POST } from "@/GlobalState/ApiCalls/graphql/article_queries";
import ArticleContent from "@/components/Post/ArticleContent";
import NotFoundPage from "@/components/NotFoundPage";
import Video from "@/components/Video";

type SinglePostQueryData = {
  articles?: { data?: Array<{ attributes?: Post }> };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await queryData<SinglePostQueryData>({
    query: GET_SINGLE_POST,
    variables: { slugUrl: slug },
  });
  const post = data.articles?.data?.[0]?.attributes;
  const title = post?.Title || slug;
  const description = post?.Content ? post.Content.replace(/<[^>]+>/g, '').slice(0, 160) : "Nieuwsbericht op Carnaval Radio";
  return {
    title: `${title} | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
    description,
    alternates: {
      canonical: `/nieuwsberichten/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: post?.CoverImage?.data?.attributes?.url ? [post.CoverImage.data.attributes.url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post?.CoverImage?.data?.attributes?.url ? [post.CoverImage.data.attributes.url] : [],
    },
  };
}

import ShareButtons, { ShareButtonsFallback } from "@/components/Socials/ShareButtons";
import { Suspense } from "react";

interface Post {
  Title: string;
  Content: string;
  CoverImage: {
    data: {
      attributes: {
        url: string;
      };
    };
  };
  CoverVideo: {
    data: {
      attributes: {
        url: string;
      };
    };
  };
  publishedAt: string;
}

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const data = await queryData<SinglePostQueryData>({
    query: GET_SINGLE_POST,
    variables: { slugUrl: slug },
    context: {
      fetchOptions: {
        next: { revalidate: 60, tags: ["articles"] },
      },
    },
  });

  if(!data.articles?.data?.[0]) {
    return null;
  }

  const post = data.articles?.data?.[0]?.attributes;

  if(!post) 
    return <NotFoundPage />;

  const formatDate = (inputDate: any) => {
    const date = new Date(inputDate);
    const day = date.getUTCDate();
    const month = date.toLocaleString("nl-NL", { month: "long" });
    const year = date.getUTCFullYear();

    const formattedDate = `${day} ${month}, ${year}`;

    return <span className="text-sm">{formattedDate}</span>;
  };

  return (
    <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
      {/* Structured Data for NewsArticle */}
      {post && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": post.Title,
                "image": post.CoverImage?.data?.attributes?.url ? [post.CoverImage.data.attributes.url] : [],
                "datePublished": post.publishedAt,
                "description": post.Content ? post.Content.replace(/<[^>]+>/g, '').slice(0, 160) : "Nieuwsbericht op Carnaval Radio",
                "author": {
                  "@type": "Organization",
                  "name": "Carnaval Radio"
                },
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `https://www.carnaval-radio.nl/nieuwsberichten/${slug}`
                }
              })
            }}
          />
          <div className="flex min-w-0 w-full flex-col gap-4 max-w-3xl p-4 rounded-3xl bg-white">
            {post.CoverVideo?.data?.attributes?.url && (
              <Video
                src={post.CoverVideo.data.attributes.url}
                className="rounded-xl"
              />
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="min-w-0 break-words text-3xl font-semibold text-primary">
                {post.Title}
              </h2>
              {formatDate(post.publishedAt)}
            </div>
            <ArticleContent
              html={post.Content}
              coverImage={post.CoverImage?.data?.attributes?.url
                ? { src: post.CoverImage.data.attributes.url, alt: post.Title }
                : undefined}
            />
            <Suspense fallback={<ShareButtonsFallback />}>
              <ShareButtons slug={`nieuwsberichten/${slug}`} />
            </Suspense>
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
export default page;
