import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  type OperationVariables,
} from "@apollo/client";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_URL;
export const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_ENDPOINT }),
  cache: new InMemoryCache(),
  devtools: { enabled: process.env.NODE_ENV !== 'production' }
});

export async function queryData<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: ApolloClient.QueryOptions<TData, TVariables>,
): Promise<TData> {
  const { data } = await client.query<TData, TVariables>(options);
  if (data === undefined) {
    throw new Error("GraphQL query response did not contain data.");
  }
  return data;
}
