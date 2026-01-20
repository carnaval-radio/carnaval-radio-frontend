"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { gql } from "@apollo/client";
import { client } from "@/GlobalState/ApiCalls/api.config";

const SITE_TAGS = [
  "pages",
  "sponsors",
  "team",
  "events",
  "twitch",
  "slides",
  "navigation",
  "social",
] as const;

const SITE_PATHS = [
  "/sponsoren",
  "/sitemap.xml",
  "/articles",
  "/team",
  "/events",
  "/",
] as const;

const NEWS_PATH_PREFIX = "/nieuwsberichten";

export default async function action(refreshTags: string[] = []) {
  if (refreshTags.length === 0) {
    await Promise.all([
      revalidateMainSite(),
      revalidateRecentNews(3),
    ]);
    return;
  }

  const { tagsOrPaths, recentNewsCount } = parseRefreshArgs(refreshTags);

  if (recentNewsCount !== null) {
    await revalidateRecentNews(recentNewsCount);
  }

  await Promise.all(
    tagsOrPaths.map((item) =>
      item.startsWith("/")
        ? revalidatePath(item)
        : revalidateTag(item),
    ),
  );
}

async function revalidateMainSite() {
  await Promise.all([
    ...SITE_TAGS.map((tag) => revalidateTag(tag)),
    ...SITE_PATHS.map((path) => revalidatePath(path)),
  ]);
}

async function revalidateRecentNews(count: number) {
  const { data } = await client.query({
    query: GET_LAST_NEWS_SLUGS,
    variables: { limit: count },
  });

  const slugs: string[] =
    data?.articles?.data
      ?.map((a: { attributes?: { Slug?: string } }) => a.attributes?.Slug)
      .filter(Boolean) ?? [];

  await Promise.all(
    slugs.map((slug) =>
      revalidatePath(`${NEWS_PATH_PREFIX}/${slug}`),
    ),
  );
}

function parseRefreshArgs(refreshTags: string[]) {
  const recentNewsArg = refreshTags.find((t) => t.startsWith("recent-news="));

  const recentNewsCount =
    recentNewsArg !== undefined
      ? Number.parseInt(recentNewsArg.split("=")[1], 10) || 3
      : null;

  const tagsOrPaths = recentNewsArg
    ? refreshTags.filter((t) => t !== recentNewsArg)
    : refreshTags;

  return { tagsOrPaths, recentNewsCount };
}

const GET_LAST_NEWS_SLUGS = gql`
  query GetLastNewsSlugs($limit: Int!) {
    articles(sort: "Date:desc", pagination: { limit: $limit }) {
      data {
        attributes {
          Slug
        }
      }
    }
  }
`;