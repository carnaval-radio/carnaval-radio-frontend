import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_URL;
export const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_ENDPOINT }),
  cache: new InMemoryCache(),
  devtools: { enabled: process.env.NODE_ENV !== 'production' }
});
