import Socials from "@/components/Socials";
import SocialWidget from "@/components/Socials/SocialWidget";
import { fetchSocialPosts } from "@/GlobalState/ApiCalls/fetchSocials";

export async function generateMetadata() {
  return {
    title: `Social Feed | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
    alternates: {
      canonical: "/social",
    },
  };
}

const SocialPage = async () => {
  const allPosts = await fetchSocialPosts();

  if (allPosts.length === 0) {
    return <div className="p-10 text-center max-w-screen-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Socials</h2>
      <p>Er zijn momenteel geen social posts beschikbaar.</p>
      {/* Show social icons from the menu */}
      <Socials />
    </div>;
  }

  return (
    <div>
      <SocialWidget posts={allPosts} allPosts />
    </div>
  );
};

export default SocialPage;
