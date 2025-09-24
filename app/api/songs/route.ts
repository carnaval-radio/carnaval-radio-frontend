import { fetchSongs, RecentSong, RecentSongWithID } from "@/GlobalState/ApiCalls/fetchSongs";
import { updateSongs } from "@/GlobalState/ApiCalls/updateSongs";
import { DataStorage } from "@/GlobalState/Songs/SupabaseStorage";
import { isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

function isFresh(songs: RecentSongWithID[], thresholdMs: number): boolean {
  if (!songs.length) return false;
  const mostRecent = Math.max(...songs.map(song => song.date || 0));
  return Date.now() - mostRecent < thresholdMs;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  let limit = 10;
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, 100);
    }
  }

  const FRESHNESS_MS = 5 * 60 * 1000;

  // Try to load from Supabase first (fastest)
  if (isSupabaseConfigured()) {
    // Trigger background update (do not await)
    updateSongs().catch((e) => console.warn("updateSongs background error", e));

    try {
      const storage = new DataStorage();
      const cachedSongs = await storage.loadSongs(limit);
      
      if (isFresh(cachedSongs, FRESHNESS_MS)) {
        console.log(`✅ Served ${cachedSongs.length} fresh songs from Supabase cache (limit: ${limit})`);
        return NextResponse.json(cachedSongs);
      } else {
        console.warn('⚠️ Supabase cache is stale, falling back to direct fetch.');
      }
    } catch (error) {
      console.warn("⚠️ Supabase unavailable, falling back to direct fetch:", error);
    }
  }

  // Fallback: Direct fetch from radio API (slower, no caching)
  try {
    console.log(`📡 No cached data available, fetching directly from radio API (limit: ${limit})`);
    const freshSongs = await fetchSongs();
    const songsWithIDs = addSongIDs(freshSongs).slice(0, limit);
    
    console.log(`✅ Served ${songsWithIDs.length} songs from direct API fetch`);
    return NextResponse.json(songsWithIDs);
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
    .replace(/,+/g, "-") // Replace commas with dashes
    .replace(/-+/g, "-"); // Collapse multiple dashes into one
}
