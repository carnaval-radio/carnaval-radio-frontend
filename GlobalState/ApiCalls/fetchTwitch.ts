export async function fetchTwitch(): Promise<boolean> {
  try {
    if (process.env.FORCE_SHOW_TWITCH === "true") {
      console.info('FORCE_SHOW_TWITCH');
      return true;
    }

    if (process.env.FORCE_DISABLE_TWITCH === "true") {
      console.warn('FORCE_DISABLE_TWITCH');
      return false;
    }
    
    if (!process.env.TWITCH_URL) {
      console.warn('TWITCH_URL not set');
      return false;
    }

    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + 'api/feature-toggle', { next: { revalidate: 3600, tags: ["twitch"] } }); // Cache for 1 hour
    const responseData = await response.json();
    const isTwitchVisible = responseData?.data?.attributes?.ShowTwitch;
    return isTwitchVisible ?? false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

