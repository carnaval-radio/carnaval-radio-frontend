import { client } from "@/GlobalState/ApiCalls/api.config";
import { GET_ALL_ARTICLES } from "@/GlobalState/ApiCalls/graphql/article_queries";
import { GET_ALL_SLUGS_FOR_CONTENT_PAGES } from "@/GlobalState/ApiCalls/graphql/page_queries";
import { Post } from "@/types/articleTypes";
import { oldArticles } from "@/data/allNewsArticles";

const URL = process.env.NEXT_PUBLIC_SITE_URL;

function generateSiteMap(
  sitemapItems: {
    url: string;
    lastModified: string;
    changeFreq?: string;
    priority?: string;
  }[]
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    
   <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
        <loc>${URL}/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>always</changefreq>
        <priority>1.0</priority>
    </url>
     ${sitemapItems
       .map((x) => {
         return `
           <url>
               <loc>${x.url}</loc>
               <lastmod>${x.lastModified}</lastmod>
               <changefreq>${x.changeFreq ?? "daily"}</changefreq>
               <priority>${x.priority ?? "0.7"}</priority>
           </url>

         `;
       })
       .join("")}
   </urlset>
 `;
}

export async function GET() {
  const posts = await getSitemapUrls();
  const body = generateSiteMap(posts);

  return new Response(body, {
    status: 200,
    headers: {
      "Cache-control": "public, s-maxage=86400, stale-while-revalidate",
      "content-type": "application/xml",
    },
  });
}

async function getSitemapUrls() {
  let sortedPosts = await getPosts();

  const routes = [
    "/nieuws",
    "/sponsoren",
    "/social",
    "/gedraaide-nummers",
    "/evenementen",
    "/team",
    "/verzoekjes",
    "/tickets",
    "/privacy-beleid",
  ].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFreq: "daily",
    priority: "0.8",
  }));

  const posts = sortedPosts.map((x) => {
    const date =
      x?.attributes?.Date || x?.attributes?.publishedAt || "2011-11-11";
    return {
      url: `${URL}/nieuwsberichten/${x?.attributes?.Slug}`,
      lastModified: new Date(date)?.toISOString(),
      changeFreq: "hourly",
      priority: "0.9",
    };
  });

  let sortedPages = await getPages();

  const pages = sortedPages.map((x) => {
    const date = x?.attributes?.publishedAt || "2011-11-11";

    return {
      url: `${URL}/${x?.attributes?.Slug}`,
      lastModified: new Date(date)?.toISOString(),
      changeFreq: "weekly",
      priority: "0.8",
    };
  });

  const oldArticlesUrls = oldArticles.map((x) => {
    const date = x.pubDate || "2011-11-11";
    return {
      url: `${URL}/nieuwsberichten/o/${x.title
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replaceAll(" ", "-")}`,
      lastModified: new Date(date)?.toISOString(),
      changeFreq: "never",
    };
  });

  return [...routes, ...pages, ...posts, ...oldArticlesUrls];
}

async function getPosts() {
  const { data } = await client.query({
    query: GET_ALL_ARTICLES,
    context: {
      fetchOptions: {
        next: { tags: ["articles"] },
      },
    },
  });
  let sortedPosts: Post[];
  sortedPosts = data?.articles?.data;
  return sortedPosts;
}

async function getPages() {
  const { data } = await client.query({
    query: GET_ALL_SLUGS_FOR_CONTENT_PAGES,
    context: {
      fetchOptions: {
        next: { tags: ["pages"] },
      },
    },
  });
  let sortedPages: { attributes: { Slug: string; publishedAt: string } }[];
  sortedPages = data?.pages?.data;
  return sortedPages;
}
