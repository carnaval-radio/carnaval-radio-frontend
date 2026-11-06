import Hero from "@/components/Hero/Hero";
import Sponsors from "@/components/Sponsors/Sponsors";
import PostCard from "@/components/Post/PostCard";
import SocialWidget from "@/components/Socials/SocialWidget";
import LatestComments from "@/components/LatestComments";
import { fetchPosts } from "@/GlobalState/ApiCalls/fetchPosts";
import { fetchSocialPosts } from "@/GlobalState/ApiCalls/fetchSocials";

export async function generateMetadata() {
  return {
    alternates: {
      canonical: "/",
    },
    title: "Carnaval Radio | 24/7 Limburgse Vastelaovend Muziek",
    description:
      "De vastelaoves Radio. Carnaval Radio uit Brunssum houdt de Limburgse Vastelaovend traditie in ere met 24/7 carnavalsmuziek. Luister naar de beste Limburgse en Duitse carnavalsleedsjes, polonaise en LVK hits. Live stream en verzoekjes mogelijk.",
    keywords:
      "Carnaval Radio, Brunssum, Limburg, Vastelaovend, carnavalsmuziek, Limburgse muziek, polonaise, LVK, Parkstad, Zuid-Limburg, carnaval traditie, 24/7 radio, Broenssem, Heerlen, Landgraag, Kerkrade, Echt, Sittard, Roermond, Venlo, Maastricht, Duitse carnavalsmuziek, Vastelaovend hits, carnavalsleedsjes, live stream, verzoekjes",
  };
}

const page = async () => {
  const enableSocialPosts = process.env.ENABLE_SOCIAL_POSTS === "true";

  const posts = await fetchPosts();

  const socialPosts = enableSocialPosts ? await fetchSocialPosts() : [];

  return (
    <section className="flex-grow">
      <Hero />
      <Sponsors />
      {posts && <PostCard posts={posts.slice(0, 3)} />}
      <SocialWidget posts={socialPosts.slice(0, 3)} />
      <div className="px-4 sm:px-8 md:px-20 lg:px-24 xl:px-24 py-8">
        <LatestComments />
      </div>
      <SocialWidget posts={socialPosts.slice(3, 6)} continuation />
      {posts && <PostCard posts={posts.slice(3, 6)} hideTitle={true} />}

      {/* SEO Content Section */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Over Carnaval Radio
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Carnaval Radio</strong> brengt sinds 2005 de Limburgse
              Vastelaovend bij je thuis. Het hele jaar door hoor je bij ons de
              beste Limburgse en Duitse carnavalsmuziek.
            </p>

            <p className="text-lg leading-relaxed mb-4">
              We willen de Vastelaovend levend houden in Brunssum, Parkstad en
              heel Limburg. Daarom draaien we 24/7 muziek, nemen we verzoekjes
              aan en streamen we gratis.
            </p>

            <p className="text-lg leading-relaxed mb-4">
              Tijdens de carnavalsperiode maken we live-uitzendingen vanuit
              meerdere cafés in Brunssum. Hoogtepunt is onze jaarlijkse
              feestavond, waar bekende Limburgse artiesten optreden, vaak zelfs
              de LVK-winnaar van dat jaar. Zo brengen we de Vastelaovend van het
              podium direct naar onze luisteraars.
            </p>

            <p className="text-lg leading-relaxed mb-4">
              Carnaval Radio is er voor iedereen die de sfeer van de
              Vastelaovend alvast wil ervaren, thuis, onderweg of samen met
              vrienden. Luister en vier mee met wat ons in Parkstad en Limburg
              verbindt.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
};

export default page;
