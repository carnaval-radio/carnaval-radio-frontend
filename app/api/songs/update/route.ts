import { fetchSongs, RecentSongWithID } from "@/GlobalState/ApiCalls/fetchSongs";
import { DataStorage } from "@/GlobalState/Songs/SupabaseStorage";
import { isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";
import { NextResponse } from "next/server";

// This endpoint is called by GitHub Actions to update the song cache
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    // Fetch fresh songs from radio API
    console.log("🎵 Fetching fresh songs from radio API...");
    const freshSongs = await fetchSongs();
    
    if (!freshSongs || freshSongs.length === 0) {
      return NextResponse.json({ error: "No songs fetched" }, { status: 400 });
    }

    // Add IDs to songs
    const songsWithIDs: RecentSongWithID[] = freshSongs.map((song) => ({
      ...song,
      ID: getSongID(song),
    }));

    // Save to Supabase
    const storage = new DataStorage();
    await storage.saveSongs(songsWithIDs);

    console.log(`✅ Successfully updated ${songsWithIDs.length} songs in Supabase`);
    
    return NextResponse.json({ 
      success: true, 
      songsUpdated: songsWithIDs.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Failed to update songs:", error);
    return NextResponse.json({ 
      error: "Failed to update songs", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

function getSongID(song: { artist: string; title: string }): string {
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