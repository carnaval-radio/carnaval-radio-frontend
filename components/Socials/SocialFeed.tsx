import { SocialPost } from "@/GlobalState/ApiCalls/fetchSocials";
import SocialPosts from "./SocialPosts";

export const revalidate = 3600 * 24; // 24 hours

interface Props {
    posts: SocialPost[];
    charactersToShow?: number;
  }

const SocialMediaFeed = ({ posts, charactersToShow }: Props) => {
    return <SocialPosts posts={posts} charactersToShow={charactersToShow} />;
  };

  export default SocialMediaFeed;