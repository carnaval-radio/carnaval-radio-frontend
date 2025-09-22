import { fetchSongs, RecentSongWithID, RecentSong } from "./fetchSongs";
import { DataStorage } from "../Songs/SupabaseStorage";
import { isSupabaseConfigured } from "../Songs/supabase_client";

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

export async function updateSongs() {
  console.log("🎵 Starting song update process...");
  
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  // Fetch fresh songs from radio API
  console.log("📡 Fetching songs from radio API...");
  const freshSongs = await fetchSongs();
  
  if (!freshSongs || freshSongs.length === 0) {
    throw new Error("No songs fetched from radio API");
  }

  console.log(`✅ Fetched ${freshSongs.length} songs from radio API`);

  // Add IDs to songs
  const songsWithIDs: RecentSongWithID[] = freshSongs.map((song: RecentSong) => ({
    ...song,
    ID: getSongID(song),
  }));

  // Deduplicate songs by ID - keep the most recent one for each unique ID
  const deduplicatedSongs = new Map<string, RecentSongWithID>();
  songsWithIDs.forEach((song) => {
    const existingSong = deduplicatedSongs.get(song.ID);
    if (!existingSong) {
      // First time seeing this song ID
      deduplicatedSongs.set(song.ID, song);
    } else {
      // We've seen this song ID before, keep the one with the more recent date
      const existingDate = new Date(existingSong.date || 0);
      const newDate = new Date(song.date || 0);
      if (newDate > existingDate) {
        deduplicatedSongs.set(song.ID, song);
      }
    }
  });

  const uniqueSongs = Array.from(deduplicatedSongs.values());
  
  if (uniqueSongs.length !== songsWithIDs.length) {
    console.log(`🔄 Deduplicated ${songsWithIDs.length} songs to ${uniqueSongs.length} unique songs`);
  }

  // Save to Supabase
  console.log("💾 Saving songs to Supabase...");
  const storage = new DataStorage();
  await storage.saveSongs(uniqueSongs);

  console.log(`✅ Successfully updated ${uniqueSongs.length} songs in Supabase`);
  console.log("📊 Song details:");
  uniqueSongs.slice(0, 3).forEach((song, index) => {
    console.log(`  ${index + 1}. ${song.artist} - ${song.title} (${song.date ? new Date(song.date).toLocaleTimeString() : 'No time'})`);
  });
  
  if (songsWithIDs.length > 3) {
    console.log(`  ... and ${songsWithIDs.length - 3} more songs`);
  }

  return {
    success: true,
    songsUpdated: songsWithIDs.length,
    timestamp: new Date().toISOString()
  };
}