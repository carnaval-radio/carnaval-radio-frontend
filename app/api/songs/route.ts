import { fetchSongs, RecentSong, RecentSongWithID } from "@/GlobalState/ApiCalls/fetchSongs";
import { DataStorage } from "@/GlobalState/Songs/SupabaseStorage";
import { isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";
import { NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  // Try to load from Supabase first (fastest)
  if (isSupabaseConfigured()) {
    try {
      const storage = new DataStorage();
      const cachedSongs = await storage.loadSongs(10);
      
      if (cachedSongs && cachedSongs.length > 0) {
        console.log(`✅ Served ${cachedSongs.length} songs from Supabase cache`);
        return NextResponse.json(cachedSongs);
      }
    } catch (error) {
      console.warn("⚠️ Supabase unavailable, falling back to direct fetch:", error);
    }
  }

  // Fallback: Direct fetch from radio API (slower, no caching)
  try {
    console.log("📡 No cached data available, fetching directly from radio API");
    const freshSongs = await fetchSongs();
    const songsWithIDs = addSongIDs(freshSongs);
    
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
    .replace(/,+/g, "-"); // Replace commas with dashes
}
