import { Indie } from "@/app/fonts/font";
import SocialPosts from "@/components/Socials/SocialPosts";
import { fetchInstagramPosts } from "@/GlobalState/ApiCalls/fetchSocials";
import { FaInstagram } from "react-icons/fa";

export async function generateMetadata() {
  return {
    title: `Instagram Feed | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
      alternates: {
    canonical: '/social/instagram',
  },
  };
}

const InstagramOnlyPage = async () => {
  const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramId = process.env.NEXT_PUBLIC_INSTAGRAM_ID;

  // Fetch Instagram posts
  const instagramPosts = instagramId && instagramAccessToken
    ? await fetchInstagramPosts(instagramId, instagramAccessToken)
    : [];

  return (
    <div className="p-10">
      <div className="flex items-center gap-2 mb-4">
        <FaInstagram className="text-2xl text-secondary" />
        <h2 className={`text-center text-2xl font-semibold ${Indie.className}`}>
          Instagram feed
        </h2>
      </div>
      <SocialPosts posts={instagramPosts} />
    </div>
  );
};

export default InstagramOnlyPage;
