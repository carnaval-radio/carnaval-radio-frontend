import ArticleContent from "@/components/Post/ArticleContent";
import { oldArticles } from "@/data/allNewsArticles";
import ShareButtons, {
  ShareButtonsFallback,
} from "@/components/Socials/ShareButtons";
import { formatDate } from "@/helpers/formatDate";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return oldArticles.map((post) => ({
    title: post.title.replace(/[^a-zA-Z0-9\s]/g, "").replaceAll(" ", "-"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ title: string }>;
}) {
  const { title } = await params;
  const foundPost = oldArticles.find(
    (p) =>
      p.title.replace(/[^a-zA-Z0-9\s]/g, "").replaceAll(" ", "-") ===
      title
  );
  if (!foundPost) return { robots: { index: false } };

  return {
    title: `${foundPost.title} | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
    alternates: {
      canonical: `/nieuwsberichten/o/${title}`,
    },
  };
}

const page = async ({ params }: { params: Promise<{ title: string }> }) => {
  const { title } = await params;
  const foundPost = oldArticles.find(
    (p) =>
      p.title.replace(/[^a-zA-Z0-9\s]/g, "").replaceAll(" ", "-") ===
      title
  );

  if (!foundPost) notFound();

  return (
    <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
      <div className="flex min-w-0 w-full flex-col gap-4 max-w-3xl p-4 rounded-3xl bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="min-w-0 break-words text-3xl font-semibold text-primary">
            {foundPost.title}
          </h2>
          <div className="w-1/4 text-right">
            {formatDate(foundPost.pubDate)}
          </div>
        </div>
        <ArticleContent html={foundPost.description} />
        <Suspense fallback={<ShareButtonsFallback />}>
          <ShareButtons slug={`nieuwsberichten/o/${title}`} />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
