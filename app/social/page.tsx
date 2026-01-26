import Socials from "@/components/Socials";
import SocialPosts from "@/components/Socials/SocialPosts";
import {
  fetchFacebookPosts,
  fetchInstagramPosts,
} from "@/GlobalState/ApiCalls/fetchSocials";

export async function generateMetadata() {
  return {
    title: `Social Feed | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
    alternates: {
      canonical: "/social",
    },
  };
}

const SocialPage = async () => {
  const facebookPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramId = process.env.NEXT_PUBLIC_INSTAGRAM_ID;

  // Fetch posts from both platforms
  const facebookPosts =
    facebookPageId && facebookAccessToken
      ? await fetchFacebookPosts(facebookPageId, facebookAccessToken)
      : [];
  const instagramPosts =
    instagramId && instagramAccessToken
      ? await fetchInstagramPosts(instagramId, instagramAccessToken)
      : [];

  // Combine and sort posts by date
  const allPosts = [...facebookPosts, ...instagramPosts];
  allPosts.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (allPosts.length === 0) {
    return <div className="p-10 text-center max-w-screen-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Socials</h2>
      {/* Show social icons from the menu */}
      <Socials />
    </div>;
  }

  return (
    <div>
      <SocialPosts posts={allPosts} />
    </div>
  );
};

export default SocialPage;
