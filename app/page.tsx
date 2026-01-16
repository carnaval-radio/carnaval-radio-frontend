import Hero from "@/components/Hero/Hero";
import Sponsors from "@/components/Sponsors/Sponsors";
import PostCard from "@/components/Post/PostCard";
import SocialPosts from "@/components/Socials/SocialPosts";
import Section from "@/components/Section";
import LatestComments from "@/components/LatestComments";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import { fetchPosts } from "@/GlobalState/ApiCalls/fetchPosts";
import { fetchFacebookPosts, fetchInstagramPosts } from "@/GlobalState/ApiCalls/fetchSocials";

export async function generateMetadata() {
  return {
    title: "Carnaval Radio | 24/7 Limburgse Vastelaovend Muziek",
    description:
      "De vastelaoves Radio. Carnaval Radio uit Brunssum houdt de Limburgse Vastelaovend traditie in ere met 24/7 carnavalsmuziek. Luister naar de beste Limburgse en Duitse carnavalsleedsjes, polonaise en LVK hits. Live stream en verzoekjes mogelijk.",
    keywords:
      "Carnaval Radio, Brunssum, Limburg, Vastelaovend, carnavalsmuziek, Limburgse muziek, polonaise, LVK, Parkstad, Zuid-Limburg, carnaval traditie, 24/7 radio, Broenssem, Heerlen, Landgraag, Kerkrade, Echt, Sittard, Roermond, Venlo, Maastricht, Duitse carnavalsmuziek, Vastelaovend hits, carnavalsleedsjes, live stream, verzoekjes",
  };
}

const page = async () => {
  const facebookPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramId = process.env.NEXT_PUBLIC_INSTAGRAM_ID;

  const posts = await fetchPosts();

  // Fetch social media posts once (not twice!)
  const facebookPosts = facebookPageId && facebookAccessToken
    ? await fetchFacebookPosts(facebookPageId, facebookAccessToken, 3)
    : [];
  const instagramPosts = instagramId && instagramAccessToken
    ? await fetchInstagramPosts(instagramId, instagramAccessToken, 3)
    : [];

  return (
    <section className="flex-grow">
      <Hero />
      <Sponsors />
      {posts && <PostCard posts={posts.slice(0, 3)} />}
      <div className="px-4 sm:px-8 md:px-20 lg:px-24 xl:px-24 py-8">
        <LatestComments />
      </div>
      {posts && <PostCard posts={posts.slice(3, 6)} hideTitle={true} />}
      {facebookPosts.length > 0 && (
        <Section
          title="Facebook"
          iconElement={<FaFacebook className="h-8 w-8 text-primary" />}
        >
          <SocialPosts
            posts={facebookPosts}
            charactersToShow={400}
          />
          <div className="flex items-center justify-center pt-8">
            <Link
              href="social/facebook"
              className="bg-gradient-to-r from-primary to-secondary rounded-lg py-2 px-4 text-white font-semibold"
            >
              Meer van facebook
            </Link>
          </div>
        </Section>
      )}
      {instagramPosts.length > 0 && (
        <Section
          title="Instagram"
          iconElement={<FaInstagram className="h-8 w-8 text-secondary" />}
        >
          <SocialPosts
            posts={instagramPosts}
            charactersToShow={400}
          />
          <div className="flex items-center justify-center pt-8">
            <Link
              href="social/instagram"
              className="bg-gradient-to-r from-primary to-secondary rounded-lg py-2 px-4 text-white font-semibold"
            >
              Meer van instagram
            </Link>
          </div>
        </Section>
      )}

      {/* SEO Content Section */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Over Carnaval Radio
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Carnaval Radio</strong> brengt sinds 2005 de
              Limburgse Vastelaovend bij je thuis. Het hele jaar door hoor je
              bij ons de beste Limburgse en Duitse carnavalsmuziek.
            </p>

            <p className="text-lg leading-relaxed mb-4">
              We willen de Vastelaovend levend houden in Brunssum, Parkstad en
              heel Limburg. Daarom draaien we 24/7 muziek, nemen we
              verzoekjes aan en streamen we gratis.
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
              Vastelaovend alvast wil ervaren, thuis, onderweg of samen met vrienden.
              Luister en vier mee met wat ons in Parkstad en Limburg verbindt.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
};

export default page;
