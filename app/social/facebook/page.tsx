import { Indie } from "@/app/fonts/font";
import SocialPosts from "@/components/Socials/SocialPosts";
import { fetchFacebookPosts } from "@/GlobalState/ApiCalls/fetchSocials";
import { FaFacebook } from "react-icons/fa";

export async function generateMetadata() {
  return {
    title: `Facebook Feed | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
      alternates: {
    canonical: '/social/facebook',
  },
  };
}

const FacebookOnlyPage = async () => {
  const facebookPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  // Fetch Facebook posts
  const facebookPosts = facebookPageId && facebookAccessToken
    ? await fetchFacebookPosts(facebookPageId, facebookAccessToken)
    : [];

  return (
    <div className="p-10">
      <div className="flex items-center gap-2 mb-4">
        <FaFacebook className="text-2xl text-secondary" />
        <h2 className={`text-center text-2xl font-semibold ${Indie.className}`}>
          Facebook posts
        </h2>
      </div>
      <SocialPosts posts={facebookPosts} />
    </div>
  );
};

export default FacebookOnlyPage;
