import ReactHtmlParser from "html-react-parser";
import { oldArticles } from "@/data/allNewsArticles";
import ShareButtons, {
  ShareButtonsFallback,
} from "@/components/Socials/ShareButtons";
import { formatDate } from "@/helpers/formatDate";
import { Suspense } from "react";

export async function generateStaticParams() {
  return oldArticles.map((post) => ({
    title: post.title.replace(/[^a-zA-Z0-9\s]/g, "").replaceAll(" ", "-"),
  }));
}

export async function generateMetadata({ params }: any) {
  const foundPost: any = oldArticles.filter(
    (p) =>
      p.title.replace(/[^a-zA-Z0-9\s]/g, "").replaceAll(" ", "-") ===
      params.title
  );
  return {
    title: `${foundPost[0].title} | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
    alternates: {
      canonical: `/nieuwsberichten/o/${params.title}`,
    },
  };
}

const page = ({ params }: { params: { title: string } }) => {
  const foundPost: any = oldArticles.filter(
    (p) =>
      p.title.replace(/[^a-zA-Z0-9\s]/g, "").replaceAll(" ", "-") ===
      params.title
  );

  if (!foundPost || foundPost.length === 0) {
    return null;
  }

  return (
    <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
      {foundPost[0] && (
        <div className="flex flex-col gap-4 max-w-3xl p-4 rounded-3xl bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-primary">
              {foundPost[0].title}
            </h2>
            <div className="w-1/4 text-right">
              {formatDate(foundPost[0].pubDate)}
            </div>
          </div>
          <div className="cms-content">
            {ReactHtmlParser(foundPost[0].description)}
          </div>
          <Suspense fallback={<ShareButtonsFallback />}>
            <ShareButtons slug={`nieuwsberichten/o/${params.title}`} />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default page;
