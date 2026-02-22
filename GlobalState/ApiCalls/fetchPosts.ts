import { Post } from "@/types/articleTypes";
import { GET_ALL_ARTICLES } from "./graphql/article_queries";
import { client } from "./api.config";

export const fetchPosts = async () => {
const { data } = await client.query({
    query: GET_ALL_ARTICLES,
    context: {
        fetchOptions: {
            next: { revalidate: 3600, tags: ["articles"] }, // Cache for 1 hour
        },
    },
});

if(!data.articles?.data) 
    return [];

const posts: Post[] = data.articles.data;

posts.forEach(element => {
    if(element?.attributes?.CoverImage?.data?.attributes?.url)
    {
            const modifiedElement = JSON.parse(JSON.stringify(element));
            modifiedElement.attributes.CoverImage.data.attributes.url = 
                    modifiedElement.attributes.CoverImage.data.attributes.url.replace("https://res.cloudinary.com/dwzn0q9wj/image/upload/", "https://res.cloudinary.com/dwzn0q9wj/image/upload/q_auto/f_auto/");
            element = modifiedElement;
    };
});

  return posts;
};
