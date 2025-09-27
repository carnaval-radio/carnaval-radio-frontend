import { fetchSongs, RecentSong } from "./fetchSongs";
import { DataStorage } from "../Songs/SupabaseStorage";
import { isSupabaseConfigured } from "../Songs/supabase_client";

export async function updateSongs() {
  console.log("🎵 Starting song update process...");
  
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  // Fetch fresh songs from radio API
  console.log("📡 Fetching songs from radio API...");
  const freshSongs = await fetchSongs();
  console.log(`🔍 Fetched ${freshSongs.length} songs from radio API`);
  
  if (!freshSongs || freshSongs.length === 0) {
    throw new Error("No songs fetched from radio API");
  }

  console.log(`✅ Fetched ${freshSongs.length} songs from radio API`);

  // Deduplicate songs by ID - keep the most recent one for each unique ID
  const deduplicatedSongs = new Map<string, RecentSong>();
  freshSongs.forEach((song) => {
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

  if (uniqueSongs.length !== freshSongs.length) {
    console.log(`🔄 Deduplicated ${freshSongs.length} songs to ${uniqueSongs.length} unique songs`);
  }

  // Save to Supabase
  console.log("💾 Saving songs to Supabase...");
  const storage = new DataStorage();
  const updatedCount = await storage.saveSongs(uniqueSongs);

  console.log(`✅ Successfully updated ${updatedCount} songs in Supabase`);
  console.log("📊 Song details:");
  uniqueSongs.slice(0, 5).forEach((song, index) => {
    console.log(`  ${index + 1}. ${song.artist} - ${song.title} (${song.date ? new Date(song.date).toLocaleTimeString() : 'No time'})`);
  });

  if (freshSongs.length > 5) {
    console.log(`  ... and ${freshSongs.length - 5} more songs`);
  }

  return {
    success: true,
    songsUpdated: updatedCount,
    timestamp: new Date().toISOString()
  };
}