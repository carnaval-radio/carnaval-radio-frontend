"use client";
import {
  FacebookShareButton,
  WhatsappShareButton,
  TwitterShareButton,
  EmailShareButton,
} from "react-share";
import { HiMail } from "react-icons/hi";
import { FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import ReactHtmlParser from "html-react-parser";
import { formateDate } from "@/components/LimburgNews/LimburgPost";
import { oldArticles } from "@/public/ProjectData/allNewsArticles";
import { useRouter } from "next/router";

// TODO rename to generateMetadata and add export, remove "use client" and make it work
async function shouldGenerateMetadata({ params }: any) {
  const articleTitle = params.article;
  const capitalize = (str: any) => str.charAt(0).toUpperCase() + str.slice(1);
  return {
    title: `${capitalize(articleTitle)} | Carnaval Radio | 24/7 Vasteloavend Muzieek`,
  };
}

const page = ({ params }: { params: { article: string } }) => {
  const foundPost: any = oldArticles.filter(
    (p) =>
      p.title.replace(/[^a-zA-Z0-9\s]/g, "").replaceAll(" ", "-") ===
      params.article
  );
  const post = foundPost[0];

  const router = useRouter();
  
  if(!post) 
  {
    router.push("/niewsberichten")
  }

  const siteBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.carnaval-radio.nl";

  return (
    <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
      {post && (
        <div className="flex flex-col gap-4 max-w-3xl p-4 rounded-3xl bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-primary">
              {post.title}
            </h2>
            <div className="w-1/4 text-right">
              {formateDate(post.pubDate)}
            </div>
          </div>
          <div className="cms-content">
            {ReactHtmlParser(post.description)}
          </div>
          {/* <Image
        src={foundPost[0].CoverImage.url}
        className="h-48 sm:h-64 md:h-96 lg:h-96 xl:h-96 w-full rounded-lg"
        width={1000}
        height={1000}
        alt={foundPost[0].title}
      /> */}
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Share:</h3>
            <div className="flex space-x-4 items-center">
              {/* facebook site */}
              <FacebookShareButton
                url={`${siteBaseUrl}/nieuwsberichten/article/${params.article}`}
              >
                <FaFacebook className="text-3xl text-blue-500" />
              </FacebookShareButton>

              {/* whatsapp */}
              <WhatsappShareButton
                url={`${siteBaseUrl}/nieuwsberichten/article/${params.article}`}
              >
                <FaWhatsapp className="text-3xl text-green" />
              </WhatsappShareButton>
              {/* Twitter */}
              <TwitterShareButton
                url={`${siteBaseUrl}/nieuwsberichten/article/${params.article}`}
                title={"WSSCs"}
              >
                <FaTwitter className="text-3xl text-blue-400" />
              </TwitterShareButton>
              {/* email */}
              <EmailShareButton
                url={`${siteBaseUrl}/nieuwsberichten/article/${params.article}`}
                subject={`Carnaval Radio Post ${params.article}`}
                body={
                  "Hier een leuk artikel van Carnaval Radio, lees het eens en luister mee!"
                }
              >
                <HiMail className="text-4xl text-red-500" />
              </EmailShareButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
