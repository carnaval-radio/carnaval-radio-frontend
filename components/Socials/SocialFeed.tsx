import { SocialPost, fetchFacebookPosts, fetchInstagramPosts } from "@/GlobalState/ApiCalls/fetchSocials";
import SocialPosts from "./SocialPosts";

export const revalidate = 3600 * 24; // 24 hours

interface Props {
    facebookPageId?: string;
    instagramId?: string;
    facebookAccessToken?: string;
    instagramAccessToken?: string;
    showFacebook?: boolean;
    showInstagram?: boolean;
    maxPosts?: number;
    charactersToShow?: number;
  }

const SocialMediaFeed = async ({
    facebookPageId,
    instagramId,
    facebookAccessToken,
    instagramAccessToken,
    maxPosts,
    charactersToShow,
  }: Props) => {
    const fetchPosts = async (
      facebookPageId?: string,
      instagramId?: string,
      facebookAccessToken?: string,
      instagramAccessToken?: string
    ): Promise<SocialPost[]> => {
      const facebookPosts =
        facebookPageId && facebookAccessToken
          ? await fetchFacebookPosts(facebookPageId, facebookAccessToken, maxPosts)
          : [];
      const instagramPosts =
        instagramId && instagramAccessToken
          ? await fetchInstagramPosts(instagramId, instagramAccessToken, maxPosts)
          : [];
      const allPosts = [...facebookPosts, ...instagramPosts];
      allPosts.sort((a, b) => b.date.getTime() - a.date.getTime());
      return allPosts;
    };
  
    const posts = await fetchPosts(
      facebookPageId,
      instagramId,
      facebookAccessToken,
      instagramAccessToken
    );

    return <SocialPosts posts={posts} charactersToShow={charactersToShow} />;
  };

  export default SocialMediaFeed;