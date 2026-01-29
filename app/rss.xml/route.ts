import { client } from "@/GlobalState/ApiCalls/api.config";
import { GET_ALL_ARTICLES } from "@/GlobalState/ApiCalls/graphql/article_queries";
import { Post } from "@/types/articleTypes";
import { Feed } from "feed";

export async function GET() {
  const { data } = await client.query({
    query: GET_ALL_ARTICLES,
    context: {
      fetchOptions: {
        next: { tags: ["articles"] },
      },
    },
  });
  let posts: Post[];
  posts = data.articles.data;

  const rss = await generateRssFeed(posts);

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

function generateRssFeed(allPosts: Post[]) {
  const site_url = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.carnaval-radio.nl';

  const feedOptions = {
    title: 'Carnaval Radio - Artikelen',
    description: 'Alle artikelen van Carnaval Radio',
    id: site_url ?? '',
    link: site_url,
    image: `${site_url}/logo.png`,
    favicon: `${site_url}/favicon.png`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Carnaval-Radio.nl`,
    generator: 'Canaval Radio Website',
    feedLinks: {
      rss2: `${site_url}/feed/rss.xml`,
      // other feed formats
      json: `${site_url}/feed/rss.json`,
      atom: `${site_url}/feed/atom.xml`,
    },
  };

  const feed = new Feed(feedOptions);

  allPosts.forEach((post) => {
    feed.addItem({
      title: post.attributes.Title,
      id: post.id + '-' + post.attributes.Slug,
      link: `${site_url}/nieuwsberichten/${post.attributes.Slug}`,
      description: '<img src="' + post.attributes.CoverImage?.data?.attributes?.url + '" />' + post.attributes.Content,
      date: new Date(post.attributes.publishedAt),
    });
  });

  const rss = feed.rss2();
  return rss;
}
