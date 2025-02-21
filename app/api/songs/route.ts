import { fetchSongs, RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";
import { FileSystemStorage } from "@/GlobalState/Storage";
import { IStorage } from "@/GlobalState/Storage";
import { NextResponse } from "next/server";

// Use the file system for now
const storage: IStorage = new FileSystemStorage();

export const revalidate = 20000;

export async function GET() {
  const mostRecentSongs = await fetchSongs();
  
  const songsWithIDs = addSongIDs(mostRecentSongs);

  try {
    await storage.saveSongs(songsWithIDs);
    console.log("Song list ensured");
  } catch (error) {
    console.error("Error ensuring song list:", error);
  }

  return NextResponse.json(songsWithIDs);
}

function addSongIDs(songs: RecentSong[]): RecentSong[] {
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
