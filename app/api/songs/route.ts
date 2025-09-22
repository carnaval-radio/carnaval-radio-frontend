import { fetchSongs, RecentSong, RecentSongWithID } from "@/GlobalState/ApiCalls/fetchSongs";
import { DataStorage } from "@/GlobalState/Songs/SupabaseStorage";
import { FileSystemStorage } from "@/GlobalState/Songs/FileSystemStorage";
import { IStorage } from "@/GlobalState/Storage";
import { isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";
import { NextResponse } from "next/server";

// Use Supabase if configured, otherwise fall back to FileSystem storage
const storage: IStorage = isSupabaseConfigured() 
  ? new DataStorage() 
  : new FileSystemStorage();

export const revalidate = 10; // Revalidate every 10 seconds

export async function GET() {
  const mostRecentSongs = await fetchSongs();
  
  const songsWithIDs = addSongIDs(mostRecentSongs);

  try {
    await storage.saveSongs(songsWithIDs);
    console.log(`✅ Successfully saved ${songsWithIDs.length} songs using ${isSupabaseConfigured() ? 'Supabase' : 'FileSystem'} storage`);
  } catch (error) {
    console.error("Error saving songs:", error);
    console.warn("⚠️ Song storage failed, but API will still return fetched songs");
  }

  const songs = await storage.loadSongs(10);
  console.log(`ℹ️ Loaded ${songs.length} songs from ${isSupabaseConfigured() ? 'Supabase' : 'FileSystem'} storage`);

  return NextResponse.json(songs);
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
