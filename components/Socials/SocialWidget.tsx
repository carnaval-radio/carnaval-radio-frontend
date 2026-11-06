import type { SocialFeedPost } from "@/GlobalState/ApiCalls/fetchSocials";
import Link from "next/link";
import { FaArrowRight, FaExternalLinkAlt, FaFacebook, FaInstagram } from "react-icons/fa";
import ImageWithFallback from "../constants/ImageWithFallback";

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
    <section aria-labelledby={headingId} className="px-4 py-8 md:px-8">
      <div className="overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-white to-secondary/10">
        <div className="flex flex-wrap items-center justify-between gap-5 px-5 pt-6 sm:px-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <FaFacebook aria-hidden="true" />
              <FaInstagram aria-hidden="true" className="text-secondary" />
              <span>Volg de sfeer</span>
            </div>
            <h2 id={headingId} className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {continuation ? "Meer op onze socials" : "Op onze socials"}
            </h2>
            <p className="mt-2 text-gray-600">
              De laatste momenten van Facebook en Instagram.
            </p>
          </div>
          {!allPosts && (
            <Link
              href="/social"
              className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-primary shadow-sm hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Alles bekijken <FaArrowRight aria-hidden="true" />
            </Link>
          )}
        </div>

        <div
          role="region"
          aria-label="Recente social posts"
          tabIndex={0}
          className={`mt-6 grid gap-4 px-5 pb-6 pt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:px-8 lg:grid-cols-3 ${
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
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Bekijk bericht op ${post.type}: ${displayText} (opent in een nieuw tabblad)`}
                  className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-primary/10">
                    <ImageWithFallback
                      src={post.image || fallbackURL}
                      fallbackSrc={fallbackURL}
                      alt={`Foto bij bericht op ${post.type}`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/60 p-2 text-white group-hover:bg-primary">
                      <FaExternalLinkAlt aria-hidden="true" className="h-3 w-3" />
                    </span>
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
                    <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-gray-800">
                      {displayText}
                    </p>
                  </div>
                </a>
                <div className="absolute left-3 right-3 top-3 flex flex-wrap gap-2">
                  {sources.map((source) => {
                    const SourceIcon = source.type === "Facebook" ? FaFacebook : FaInstagram;
                    return (
                      <a
                        key={source.type}
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open dit bericht op ${source.type} (opent in een nieuw tabblad)`}
                        className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${source.type === "Facebook" ? "bg-orange-500" : "bg-red-500"}`}
                      >
                        <SourceIcon aria-hidden="true" className="h-4 w-4" /> {source.type}
                      </a>
                    );
                  })}
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
