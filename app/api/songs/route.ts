import { fetchSongs, RecentSong, RecentSongWithID } from "@/GlobalState/ApiCalls/fetchSongs";
import { DataStorage } from "@/GlobalState/Songs/SupabaseStorage";
import { isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  
  // Validate and set limit (default: 10, max: 100)
  let limit = 10; // default
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, 100); // Cap at 100
    }
  }

  // Try to load from Supabase first (fastest)
  if (isSupabaseConfigured()) {
    try {
      const storage = new DataStorage();
      const cachedSongs = await storage.loadSongs(limit);
      
      if (cachedSongs && cachedSongs.length > 0) {
        console.log(`✅ Served ${cachedSongs.length} songs from Supabase cache (limit: ${limit})`);
        
        return NextResponse.json(cachedSongs, {
          headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
          }
        });
      }
    } catch (error) {
      console.warn("⚠️ Supabase unavailable, falling back to direct fetch:", error);
    }
  }

  // Fallback: Direct fetch from radio API (slower, no caching)
  try {
    console.log(`📡 No cached data available, fetching directly from radio API (limit: ${limit})`);
    const freshSongs = await fetchSongs();
    const songsWithIDs = addSongIDs(freshSongs);
    
    // Apply limit to direct fetch results
    const limitedSongs = songsWithIDs.slice(0, limit);
    
    console.log(`✅ Served ${limitedSongs.length} songs from direct API fetch`);
    return NextResponse.json(limitedSongs);
  } catch (error) {
    console.error("❌ All data sources failed:", error);
    return NextResponse.json([], { status: 503 });
  }
}

function addSongIDs(songs: RecentSong[]): RecentSongWithID[] {
  return songs.map((song) => ({
    ...song,
    ID: getSongID(song),
  }));
}

function getSongID(song: RecentSong): string {
  return normalizeString(`${song.artist}-${song.title}`);
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD") // Decompose characters like é to e + accent
    .replace(/[^a-z0-9\s,-]/g, "") // Remove non-alphanumeric characters except spaces, commas, and dashes
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/,+/g, "-"); // Replace commas with dashes
}
