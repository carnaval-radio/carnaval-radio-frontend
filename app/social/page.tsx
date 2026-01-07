import SocialPosts from "@/components/Socials/SocialPosts";
import { fetchFacebookPosts, fetchInstagramPosts } from "@/GlobalState/ApiCalls/fetchSocials";

export async function generateMetadata() {
  return {
    title: `Social Feed | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
  };
}

const SocialPage = async () => {
  const facebookPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramId = process.env.NEXT_PUBLIC_INSTAGRAM_ID;

  // Fetch posts from both platforms
  const facebookPosts = facebookPageId && facebookAccessToken
    ? await fetchFacebookPosts(facebookPageId, facebookAccessToken)
    : [];
  const instagramPosts = instagramId && instagramAccessToken
    ? await fetchInstagramPosts(instagramId, instagramAccessToken)
    : [];
  
  // Combine and sort posts by date
  const allPosts = [...facebookPosts, ...instagramPosts];
  allPosts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div>
      <SocialPosts posts={allPosts} />
    </div>
  );
};

export default SocialPage;
