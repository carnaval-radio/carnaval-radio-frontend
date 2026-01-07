export interface SocialPost {
  id: string;
  date: Date;
  text: string;
  image: string;
  link: string;
  type: "Facebook" | "Instagram";
}

export const fetchFacebookPosts = async (
  facebookPageId: string,
  facebookAccessToken: string,
  limit?: number
): Promise<SocialPost[]> => {
  try {
    const facebookResponse = await fetch(
      `https://graph.facebook.com/v18.0/${facebookPageId}/posts?access_token=${facebookAccessToken}&fields=id,message,created_time,full_picture,permalink_url${
        limit ? `&limit=${limit}` : ""
      }`,
      { next: { tags: ["social"] } }
    );
    const facebookData = await facebookResponse.json();
    
    // Check if response has data array
    if (!facebookData.data || !Array.isArray(facebookData.data)) {
      console.error('Facebook API error:', facebookData.error || facebookData);
      return [];
    }
    
    return facebookData.data.map((post: any) => ({
      id: post.id,
      date: new Date(post.created_time),
      text: post.message,
      image: post.full_picture,
      link: post.permalink_url,
      type: "Facebook",
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchInstagramPosts = async (
  instagramId: string,
  instagramAccessToken: string,
  limit?: number
): Promise<SocialPost[]> => {
  try {
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramId}/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${instagramAccessToken}${
        limit ? `&limit=${limit}` : ""
      }`,
      { next: { tags: ["social"] } }
    );
    const instagramData = await instagramResponse.json();
    
    // Check if response has data array
    if (!instagramData.data || !Array.isArray(instagramData.data)) {
      console.error('Instagram API error:', instagramData.error || instagramData);
      return [];
    }
    
    return instagramData.data.map((post: any) => ({
      id: post.id,
      date: new Date(post.timestamp),
      text: post.caption,
      image: post.media_url,
      link: post.permalink,
      type: "Instagram",
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};
