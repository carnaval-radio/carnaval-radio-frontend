import { GET_THEME_DATA } from "./graphql/theme_queries";
import { client } from "./api.config";

export const fetchThemeData = async () => {
  try {
    const { data } = await client.query({
      query: GET_THEME_DATA,
    });
    return data.theme.data;
  } catch (error) {
    console.log(error);
  }
};
