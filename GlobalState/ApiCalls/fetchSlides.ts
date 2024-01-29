import { GraphQLSlide, Slide } from "@/types/slideTypes";
import { client } from "./api.config";
import { GET_ALL_SLIDES } from "./graphql/slide_queries";
import { slides as FallbackSlides } from "../../public/ProjectData/slides";

export const fetchSlides = async () => {
  try {
    const { data: slideData } = await client.query({
      query: GET_ALL_SLIDES,
      context: {
        fetchOptions: {
          next: { tags: ["slides"] },
        },
      },
    });

    const slides: Slide[] = slideData.slides.data.map((x: GraphQLSlide) => {
      return {
        Image: x.attributes.Image?.data
          ? {
              Width: x.attributes.Image.data.attributes.width,
              Height: x.attributes.Image.data.attributes.height,
              Url: x.attributes.Image.data.attributes.url,
            }
          : null,
        Title: x.attributes.Title,
        Link: x.attributes.Link,
      };
    });
    return slides;
  } catch (error) {
    console.log(error);
    const fallBackSlides = FallbackSlides.map((x) => {
      return {
        Image: {
          Width: 1000,
          Height: 1000,
          Url: x.url,
        },
      } as Slide;
    });
    return fallBackSlides;
  }
};
