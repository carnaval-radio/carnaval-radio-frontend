import { SocialPost } from "@/GlobalState/ApiCalls/fetchSocials";
import Link from "next/link";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import ImageWithFallback from "../constants/ImageWithFallback";

const SocialPosts = ({ posts, charactersToShow }: { posts: SocialPost[]; charactersToShow?: number }) => {
  const fallbackURL = "https://res.cloudinary.com/dwzn0q9wj/image/upload/c_fill,w_500,q_auto,f_auto/v1706569127/030_Momenttom_com_2024_TOM_18995_b4adb75114.jpg";
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-6 2xl:gap-10 mt-auto pt-2 sm:pt-2 md:pt-3 lg:pt-4 xl:pt-4 w-full">
      {posts.map((post, i) => {
        let displayText = post.text;
        if (charactersToShow && post.text?.length > charactersToShow) {
          displayText = post.text.slice(0, charactersToShow) + "…";
        }
        return (
          <div
            key={post.id}
            className={`${`bg-${
              i % 4 === 0
                ? "tertiaryShade_2"
                : i % 4 === 1
                ? "secondaryShade_2"
                : i % 4 === 2
                ? "primaryShade_3"
                : "secondaryShade_2"
            }`} rounded-xl p-5 overflow-hidden space-y-5 w-full`}
          >
            <ImageWithFallback
              fallbackSrc={fallbackURL}
              className="h-60 w-[98%] object-cover rounded-xl"
              src={post.image || fallbackURL}
              alt={`Foto van ${
                post.type
              } genomen op ${post.date.toLocaleDateString("nl-NL")}`}
            />
            <div className="px-2 flex  items-center text-xs text-gray-500">
              {post.type === "Facebook" ? (
                <FaFacebook size={20} />
              ) : post.type === "Instagram" ? (
                <FaInstagram size={20} />
              ) : null}
              <div className="ml-2">{post.date.toLocaleDateString("nl-NL")}</div>
            </div>
            <p>{displayText}</p>
            <Link
              target="_blank"
              className={`flex items-center justify-center bg-white border-2 rounded-md p-2 ${
                i % 4 === 0
                  ? "border-tertiary text-tertiary"
                  : i % 4 === 1
                  ? "border-secondary text-secondary"
                  : i % 4 === 2
                  ? "border-primary text-primary"
                  : "border-secondary text-secondary"
              }`}
              href={post.link}
            >
              Verder lezen op {post.type}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default SocialPosts;
