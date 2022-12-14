import { ApolloClient, InMemoryCache } from "@apollo/client";
import { GET_ALL_ARTICLES } from "../graphql/quries";
import { Post } from "../typings";

import Hero from "../components/Hero/Hero";
import Sponsors from "../components/Sponsors/Sponsors";
import PostCard from "../components/PostCard";

interface Props {
  posts: [Post];
}

export default function Home({ posts }: Props) {
  return (
    <div className="flex-grow">
      <Hero />
      <Sponsors />
      <PostCard posts={posts} />
    </div>
  );
}

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_URL;

export async function getServerSideProps() {
  const client = new ApolloClient({
    uri: GRAPHQL_ENDPOINT,
    cache: new InMemoryCache(),
  });
  const { data } = await client.query({
    query: GET_ALL_ARTICLES,
  });

  return {
    props: {
      posts: data.articles.data,
    },
  };
}
