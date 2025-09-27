import Hero from "@/components/Hero/Hero";
import Sponsors from "@/components/Sponsors/Sponsors";
import PostCard from "@/components/Post/PostCard";
import SocialMediaFeed from "@/components/Socials/SocialFeed";
import Section from "@/components/Section";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import { fetchPosts } from "@/GlobalState/ApiCalls/fetchPosts";

export async function generateMetadata() {
  return {
    title: "Carnaval Radio | 24/7 Limburgse Vastelaovend Muziek",
    description: "De vastelaoves Radio. Carnaval Radio uit Brunssum houdt de Limburgse Vastelaovend traditie in ere met 24/7 carnavalsmuziek. Luister naar de beste Limburgse en Duitse carnavalsleedsjes, polonaise en LVK hits. Live stream en verzoekjes mogelijk.",
    keywords: "Carnaval Radio, Brunssum, Limburg, Vastelaovend, carnavalsmuziek, Limburgse muziek, polonaise, LVK, Parkstad, Zuid-Limburg, carnaval traditie, 24/7 radio, Broenssem, Heerlen, Landgraag, Kerkrade, Echt, Sittard, Roermond, Venlo, Maastricht, Duitse carnavalsmuziek, Vastelaovend hits, carnavalsleedsjes, live stream, verzoekjes",
 };
}

const page = async () => {
  const facebookPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramId = process.env.NEXT_PUBLIC_INSTAGRAM_ID;

  const posts = await fetchPosts();
 
  return (
    <section className="flex-grow">
      <Hero />
      <Sponsors />
      {posts && <PostCard posts={posts} />}
      {facebookPageId && (
        <Section
          title="Facebook"
          iconElement={<FaFacebook className="h-8 w-8 text-primary" />}
        >
          <SocialMediaFeed
            facebookPageId={facebookPageId}
            facebookAccessToken={facebookAccessToken}
            maxPosts={3}
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
      {instagramId && (
        <Section
          title="Instagram"
          iconElement={<FaInstagram className="h-8 w-8 text-secondary" />}
        >
          <SocialMediaFeed
            instagramId={instagramId}
            instagramAccessToken={instagramAccessToken}
            maxPosts={3}
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
            Over Carnaval Radio Brunssum
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Carnaval Radio uit Brunssum</strong> houdt de Limburgse Vastelaovend traditie in ere met 24/7 carnavalsmuziek. 
              Sinds 2005 draaien we de beste Limburgse en Duitse carnavalsleedsjes, van klassieke polonaise tot moderne LVK hits.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Onze missie is om de Vastelaovend levend te houden onder jong en oud in Parkstad en Zuid-Limburg. 
              We organiseren jaarlijks feestavonden in Brunssum en bieden een gratis 24/7 stream met live DJ's en verzoekjes.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Van het 'sjoenkele' tot de polonaise en het LVK: alles wat bij de Limburgse carnavalstraditie hoort, 
              vind je bij Carnaval Radio. Luister mee en beleef de gezelligheid van de Vastelaovend het hele jaar door!
            </p>
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                <strong>Keywords:</strong> Carnaval Radio Brunssum, Limburgse Vastelaovend, carnavalsmuziek Limburg, 
                polonaise muziek, LVK hits, Parkstad carnaval, Zuid-Limburg traditie, 24/7 carnaval radio
              </p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default page;
