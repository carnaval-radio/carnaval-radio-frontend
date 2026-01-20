import { client } from "@/GlobalState/ApiCalls/api.config";
import { GET_ALL_ARTICLES } from "@/GlobalState/ApiCalls/graphql/article_queries";
import { GET_ALL_SLUGS_FOR_CONTENT_PAGES } from "@/GlobalState/ApiCalls/graphql/page_queries";
import { Post } from "@/types/articleTypes";
import { oldArticles } from "@/data/allNewsArticles";

const URL = process.env.NEXT_PUBLIC_SITE_URL;

interface SitemapItem {
  url: string;
  lastModified: string;
  changeFreq?: string;
  priority?: string;
  isNews?: boolean;
  title?: string;
}

function escapeXml(unsafe: string = ""): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSiteMap(sitemapItems: SitemapItem[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    <url>
      <loc>${escapeXml(URL + "/")}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>always</changefreq>
      <priority>1.0</priority>
    </url>
    ${sitemapItems
      .map((x) => {
        if (x.isNews) {
          return `
            <url>
              <loc>${escapeXml(x.url)}</loc>
              <lastmod>${x.lastModified}</lastmod>
              <changefreq>${x.changeFreq ?? "hourly"}</changefreq>
              <priority>${x.priority ?? "0.9"}</priority>
              <news:news>
                <news:publication>
                  <news:name>Carnaval Radio</news:name>
                  <news:language>nl</news:language>
                </news:publication>
                <news:publication_date>${x.lastModified}</news:publication_date>
                <news:title>${escapeXml(x.title ?? "")}</news:title>
              </news:news>
            </url>
          `;
        }
        return `
          <url>
            <loc>${escapeXml(x.url)}</loc>
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
  const urls = await getSitemapUrls();
  const body = generateSiteMap(urls);
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
    // Dutch variants and canonical paths
    "/nieuws",
    "/nieuwsberichten",
    "/sponsoren",
    "/social",
    "/socials",
    "/gedraaide-nummers",
    "/favorieten",
    "/evenementen",
    "/team",
    "/verzoekjes",
    "/requests/whatsapp",
    "/tickets",
    "/privacy-beleid",
    "/reacties",
    "/veer-goon-door",
  ].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFreq: "daily",
    priority: "0.8",
  }));

  const posts = sortedPosts.map((x) => {
    const date = x?.attributes?.Date || x?.attributes?.publishedAt || "2011-11-11";
    return {
      url: `${URL}/nieuwsberichten/${x?.attributes?.Slug}`,
      lastModified: new Date(date)?.toISOString(),
      changeFreq: "hourly",
      priority: "0.9",
      isNews: true,
      title: x?.attributes?.Title || x?.attributes?.Slug,
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
    // Unify old article URLs to /nieuwsberichten/o/{slugified-title}
    const slug = x.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replaceAll(" ", "-")
      .toLowerCase();
    return {
      url: `${URL}/nieuwsberichten/o/${slug}`,
      lastModified: new Date(date)?.toISOString(),
      changeFreq: "never",
      isNews: true,
      title: x.title,
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
