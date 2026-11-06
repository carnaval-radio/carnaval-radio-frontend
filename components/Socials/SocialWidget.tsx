import type { SocialFeedPost } from "@/GlobalState/ApiCalls/fetchSocials";
import Link from "next/link";
import { FaArrowRight, FaFacebook, FaInstagram } from "react-icons/fa";
import ImageWithFallback from "../constants/ImageWithFallback";
import SocialCaption from "./SocialCaption";

const fallbackURL =
  "https://res.cloudinary.com/dwzn0q9wj/image/upload/c_fill,w_500,q_auto,f_auto/v1706569127/030_Momenttom_com_2024_TOM_18995_b4adb75114.jpg";

const SocialWidget = ({
  posts,
  continuation = false,
  allPosts = false,
}: {
  posts: SocialFeedPost[];
  continuation?: boolean;
  allPosts?: boolean;
}) => {
  if (posts.length === 0) return null;
  const headingId = continuation ? "social-widget-more-title" : "social-widget-title";

  return (
    <section aria-labelledby={headingId} className="px-4 py-4 sm:py-8 md:px-8">
      <div className="overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-white to-secondary/10">
        <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:gap-5 sm:px-8 sm:pt-6">
          <div className="min-w-0">
            <div className="mb-2 hidden items-center gap-2 text-sm font-semibold text-primary sm:flex">
              <FaFacebook aria-hidden="true" />
              <FaInstagram aria-hidden="true" className="text-secondary" />
              <span>Volg de sfeer</span>
            </div>
            <h2 id={headingId} className="text-xl font-bold text-gray-900 sm:text-3xl">
              {continuation ? "Meer op onze socials" : "Op onze socials"}
            </h2>
            <p className="mt-2 hidden text-gray-600 sm:block">
              De laatste momenten van Facebook en Instagram.
            </p>
          </div>
          {!allPosts && (
            <Link
              href="/social"
              aria-label="Alles bekijken"
              className="flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:px-5 sm:py-3 sm:text-base"
            >
              <span className="sm:hidden">Alles</span><span className="hidden sm:inline">Alles bekijken</span> <FaArrowRight aria-hidden="true" />
            </Link>
          )}
        </div>

        <div
          role="region"
          aria-label="Recente social posts"
          tabIndex={0}
          className={`mt-3 grid gap-4 px-4 pb-4 pt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:mt-6 sm:px-8 sm:pb-6 lg:grid-cols-3 ${
            allPosts
              ? "grid-cols-1 sm:grid-cols-2"
              : "auto-cols-[85%] grid-flow-col overflow-x-auto snap-x snap-mandatory sm:auto-cols-[45%] lg:grid-flow-row lg:auto-cols-auto lg:overflow-visible"
          }`}
        >
          {posts.map(({ post, sources }) => {
            const displayText = post.text.length > 160
              ? `${post.text.slice(0, 160).trimEnd()}...`
              : post.text;

            return (
              <article
                key={`${post.type}-${post.id}`}
                className="relative min-w-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md"
              >
                <div className="relative aspect-[4/5]">
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Bekijk bericht op ${post.type}: ${displayText} (opent in een nieuw tabblad)`}
                  className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
                >
                  <div className="h-full overflow-hidden bg-primary/10">
                    <ImageWithFallback
                      src={post.image || fallbackURL}
                      fallbackSrc={fallbackURL}
                      alt={`Foto bij bericht op ${post.type}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </a>
                    {sources.map((source) => {
                      const SourceIcon = source.type === "Facebook" ? FaFacebook : FaInstagram;
                      return (
                        <a
                          key={source.type}
                          href={source.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open dit bericht op ${source.type} (opent in een nieuw tabblad)`}
                          className={`absolute flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${source.type === "Facebook" ? "right-3 top-3 bg-orange-500" : "bottom-3 left-3 bg-red-500"}`}
                        >
                          <SourceIcon aria-hidden="true" className="h-3.5 w-3.5" /> {source.type}
                        </a>
                      );
                    })}
                </div>
                <div className="p-4">
                    <time
                      dateTime={post.date.toISOString()}
                      className="text-xs font-medium text-gray-500"
                    >
                      {post.date.toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "Europe/Amsterdam",
                      })}
                    </time>
                    <SocialCaption text={post.text} />
                  </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SocialWidget;
