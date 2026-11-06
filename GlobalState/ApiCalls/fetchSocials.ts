export interface SocialPost {
  id: string;
  date: Date;
  text: string;
  image: string;
  link: string;
  type: "Facebook" | "Instagram";
}

interface GraphResponse<T> {
  data?: T[];
  error?: { code?: number; error_subcode?: number; type?: string };
}

interface FacebookPost {
  id: string;
  created_time: string;
  message?: string;
  full_picture?: string;
  permalink_url: string;
}

interface InstagramPost {
  id: string;
  timestamp: string;
  caption?: string;
  media_url?: string;
  thumbnail_url?: string;
  media_type: string;
  permalink: string;
}

const GRAPH_API_URL = "https://graph.facebook.com/v27.0";

export const fetchFacebookPosts = async (
  facebookPageId: string,
  facebookAccessToken: string,
  limit?: number
): Promise<SocialPost[]> => {
  try {
    const facebookResponse = await fetch(
      `${GRAPH_API_URL}/${facebookPageId}/posts?fields=id,message,created_time,full_picture,permalink_url${
        limit ? `&limit=${limit}` : ""
      }`,
      {
        headers: { Authorization: `Bearer ${facebookAccessToken}` },
        next: { revalidate: 3600, tags: ["social"] },
      }
    );
    const facebookData: GraphResponse<FacebookPost> = await facebookResponse.json();
    
    // Check if response has data array
    if (!facebookResponse.ok || facebookData.error || !Array.isArray(facebookData.data)) {
      console.error("Facebook API error:", {
        status: facebookResponse.status,
        code: facebookData.error?.code,
        subcode: facebookData.error?.error_subcode,
      });
      return [];
    }
    
    return facebookData.data.map((post) => ({
      id: post.id,
      date: new Date(post.created_time),
      text: post.message ?? "",
      image: post.full_picture ?? "",
      link: post.permalink_url,
      type: "Facebook",
    }));
  } catch (error) {
    console.error("Facebook feed request failed:", error instanceof Error ? error.name : "Unknown error");
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
      `${GRAPH_API_URL}/${instagramId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp${
        limit ? `&limit=${limit}` : ""
      }`,
      {
        headers: { Authorization: `Bearer ${instagramAccessToken}` },
        next: { revalidate: 3600, tags: ["social"] },
      }
    );
    const instagramData: GraphResponse<InstagramPost> = await instagramResponse.json();
    
    // Check if response has data array
    if (!instagramResponse.ok || instagramData.error || !Array.isArray(instagramData.data)) {
      console.error("Instagram API error:", {
        status: instagramResponse.status,
        code: instagramData.error?.code,
        subcode: instagramData.error?.error_subcode,
      });
      return [];
    }
    
    return instagramData.data.map((post) => ({
      id: post.id,
      date: new Date(post.timestamp),
      text: post.caption ?? "",
      image: (post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url) ?? "",
      link: post.permalink,
      type: "Instagram",
    }));
  } catch (error) {
    console.error("Instagram feed request failed:", error instanceof Error ? error.name : "Unknown error");
    return [];
  }
};
