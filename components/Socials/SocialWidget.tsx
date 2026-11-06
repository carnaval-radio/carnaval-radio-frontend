import type { SocialPost } from "@/GlobalState/ApiCalls/fetchSocials";
import Link from "next/link";
import { FaArrowRight, FaExternalLinkAlt, FaFacebook, FaInstagram } from "react-icons/fa";
import ImageWithFallback from "../constants/ImageWithFallback";

const fallbackURL =
  "https://res.cloudinary.com/dwzn0q9wj/image/upload/c_fill,w_500,q_auto,f_auto/v1706569127/030_Momenttom_com_2024_TOM_18995_b4adb75114.jpg";

const matchingCaptions = (first: string, second: string) => {
  if (!first || !second) return false;
  if (first === second) return true;

  const words = (text: string) => text
    .replace(/[@#][\p{L}\p{N}_]+/gu, "")
    .match(/[\p{L}\p{N}]+/gu) ?? [];
  const firstWords = words(first);
  const secondWords = words(second);
  const firstSet = new Set(firstWords);
  const secondSet = new Set(secondWords);

  // Require a substantial shared caption and opening, not just common event boilerplate.
  if (Math.min(firstSet.size, secondSet.size) < 20 ||
    firstWords.slice(0, 8).join(" ") !== secondWords.slice(0, 8).join(" ")) {
    return false;
  }
  const sharedWords = Array.from(firstSet).filter((word) => secondSet.has(word)).length;
  return (2 * sharedWords) / (firstSet.size + secondSet.size) >= 0.9;
};

const SocialWidget = ({ posts }: { posts: SocialPost[] }) => {
  if (posts.length === 0) return null;

  const newestFirst = [...posts].sort((a, b) => b.date.getTime() - a.date.getTime());
  const facebook = newestFirst.filter((post) => post.type === "Facebook");
  const instagram = newestFirst.filter((post) => post.type === "Instagram");
  const feeds = newestFirst[0].type === "Facebook"
    ? [facebook, instagram]
    : [instagram, facebook];
  const mixedPosts: SocialPost[] = [];

  for (let i = 0; i < Math.max(facebook.length, instagram.length); i++) {
    for (const feed of feeds) {
      if (feed[i]) mixedPosts.push(feed[i]);
    }
  }

  const uniquePosts: { post: SocialPost; sources: SocialPost[]; caption: string }[] = [];
  for (const post of mixedPosts) {
    const caption = post.text.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
    const duplicate = uniquePosts.find((item) =>
      !item.sources.some((source) => source.type === post.type) &&
      Math.abs(item.post.date.getTime() - post.date.getTime()) <= 48 * 60 * 60 * 1000 &&
      (matchingCaptions(item.caption, caption) ||
        (post.image.length > 0 && item.post.image === post.image))
    );
    if (duplicate) {
      duplicate.sources.push(post);
    } else {
      uniquePosts.push({ post, sources: [post], caption });
    }
  }

  return (
    <section aria-labelledby="social-widget-title" className="px-4 py-8 md:px-8">
      <div className="overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-white to-secondary/10">
        <div className="flex flex-wrap items-center justify-between gap-5 px-5 pt-6 sm:px-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <FaFacebook aria-hidden="true" />
              <FaInstagram aria-hidden="true" className="text-secondary" />
              <span>Volg de sfeer</span>
            </div>
            <h2 id="social-widget-title" className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Op onze socials
            </h2>
            <p className="mt-2 text-gray-600">
              De laatste momenten van Facebook en Instagram.
            </p>
          </div>
          <Link
            href="/social"
            className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-primary shadow-sm hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Alles bekijken <FaArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div
          role="region"
          aria-label="Recente social posts"
          tabIndex={0}
          className="mt-6 grid auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto px-5 pb-6 pt-1 snap-x snap-mandatory focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:auto-cols-[45%] sm:px-8 lg:grid-cols-3 lg:grid-flow-row lg:auto-cols-auto lg:overflow-visible"
        >
          {uniquePosts.map(({ post, sources }) => {
            const displayText = post.text.length > 160
              ? `${post.text.slice(0, 160).trimEnd()}...`
              : post.text;

            return (
              <article
                key={`${post.type}-${post.id}`}
                className="min-w-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md"
              >
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Bekijk bericht op ${post.type}: ${displayText || "Foto van Carnaval Radio"} (opent in een nieuw tabblad)`}
                  className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-primary/10">
                    <ImageWithFallback
                      src={post.image || fallbackURL}
                      fallbackSrc={fallbackURL}
                      alt={`Foto bij bericht op ${post.type}`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-3 right-3 top-3 flex flex-wrap gap-2">
                      {sources.map((source) => {
                        const Icon = source.type === "Facebook" ? FaFacebook : FaInstagram;
                        return (
                          <span
                            key={source.type}
                            className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-sm ${source.type === "Facebook" ? "bg-orange-500" : "bg-red-500"}`}
                          >
                            <Icon aria-hidden="true" className="h-4 w-4" />
                            {source.type}
                          </span>
                        );
                      })}
                    </span>
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
                      {displayText || `Een kijkje bij Carnaval Radio op ${post.type}.`}
                    </p>
                  </div>
                </a>
                {sources.length > 1 && (
                  <div className="flex flex-wrap gap-4 border-t border-gray-100 px-4 py-3">
                    {sources.map((source) => {
                      const SourceIcon = source.type === "Facebook" ? FaFacebook : FaInstagram;
                      return (
                        <a
                          key={source.type}
                          href={source.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open dit bericht op ${source.type} (opent in een nieuw tabblad)`}
                          className="flex items-center gap-2 py-1 text-sm font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <SourceIcon aria-hidden="true" /> {source.type}
                        </a>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SocialWidget;
