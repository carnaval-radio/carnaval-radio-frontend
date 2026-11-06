import type { Post } from "@/types/articleTypes";
import Link from "next/link";
import parse from "html-react-parser";
import { FaArrowRight, FaRegNewspaper } from "react-icons/fa";
import { formatDate } from "@/helpers/formatDate";
import { optimizeCardImage } from "@/src/types/cloudinaryOptimization";
import ImageWithFallback from "../constants/ImageWithFallback";
import Video from "../Video";
import { Indie } from "@/app/fonts/font";
import Image from "next/image";
import news from "@/public/news.png";

const postDate = (post: Post) =>
  post.title ? post.pubDate : post.attributes.Date || post.attributes.publishedAt;

export default function PostCard({ posts = [], hideTitle = false }: {
  posts?: Post[];
  hideTitle?: boolean;
}) {
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(postDate(b)).getTime() - new Date(postDate(a)).getTime()
  ).slice(0, 6);
  const headingId = hideTitle ? "more-news-title" : "news-title";

  return (
    <section aria-labelledby={headingId} className="px-4 py-4 sm:py-8 md:px-8">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-6 sm:gap-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Image src={news} width={100} height={100} className="h-8 w-8 shrink-0" alt="" />
            <h2 id={headingId} className={`text-3xl font-semibold ${Indie.className}`}>
              {hideTitle ? "Meer nieuws" : "Nieuws"}
            </h2>
          </div>
          <Link href="/nieuwsberichten" aria-label="Alle nieuws" className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:px-5 sm:py-3 sm:text-base">
            <span className="sm:hidden">Alles</span><span className="hidden sm:inline">Alle nieuws</span> <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div role="region" aria-label="Nieuwsberichten" tabIndex={0} className="grid auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid-flow-row sm:grid-cols-2 sm:auto-cols-auto sm:overflow-visible lg:grid-cols-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          {sortedPosts.map((post, index) => {
            const title = post.title || post.attributes.Title;
            const href = post.title
              ? `/nieuwsberichten/o/${post.title.replace(/[^a-zA-Z0-9\s]/g, "").replaceAll(" ", "-")}`
              : `/nieuwsberichten/${post.attributes.Slug}`;
            const content: string = post.title ? post.description || "" : post.attributes.Content || "";
            const excerpt = content
              .replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
              .replace(/<[^>]*>/g, " ")
              .replace(/\s+/g, " ").trim();
            const cover = post.attributes?.CoverImage?.data?.attributes?.url;
            const video = post.attributes?.CoverVideo?.data?.attributes?.url;

            return (
              <article key={post.id || href} className={`flex min-w-0 snap-start flex-col overflow-hidden rounded-2xl shadow-sm hover:shadow-md ${
                index % 3 === 0 ? "bg-tertiaryShade_2" : index % 3 === 1 ? "bg-secondaryShade_2" : "bg-primaryShade_3"
              }`}>
                {video ? (
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <Video src={video} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <Link href={href} aria-label={title} className="block aspect-[4/3] overflow-hidden bg-primary/5">
                    {cover ? (
                      <ImageWithFallback src={optimizeCardImage(cover, 500)} fallbackSrc="/news.png" alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary/30"><FaRegNewspaper className="h-16 w-16" aria-hidden="true" /></div>
                    )}
                  </Link>
                )}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <time dateTime={new Date(postDate(post)).toISOString()} className="text-sm font-medium text-gray-500">{formatDate(postDate(post))}</time>
                  <h3 className="mt-2 break-words text-xl font-bold leading-snug text-gray-900">
                    <Link href={href} className="hover:text-primary">{title}</Link>
                  </h3>
                  <p className="mt-3 line-clamp-3 break-words text-base leading-relaxed text-gray-700">{parse(excerpt.slice(0, 200) + (excerpt.length > 200 ? "..." : ""))}</p>
                  <div className="mt-auto pt-4">
                    <Link href={href} className={`flex items-center justify-center gap-2 rounded-md border-2 bg-white p-2 text-base font-semibold hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      index % 3 === 0 ? "border-tertiary text-tertiary focus-visible:outline-tertiary"
                        : index % 3 === 1 ? "border-secondary text-secondary focus-visible:outline-secondary"
                        : "border-primary text-primary focus-visible:outline-primary"
                    }`}>
                      Lees verder <FaArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
