// Modern Supabase Storage Service
import { RecentSong, RecentSongWithID } from "../ApiCalls/fetchSongs";
import { IInteractionsStorage, IStorage } from "../Storage";
import { supabase, isSupabaseConfigured } from "./supabase_client";
import { Song, Artist, Interaction } from "./types";

export class DataStorage implements IStorage, IInteractionsStorage {
  private checkSupabaseConfig(): void {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
    }
  }

  // Function to ensure that all artists exist, return their ids in bulk
  async ensureArtists(artistNames: string[]): Promise<string[]> {
    this.checkSupabaseConfig();
    
    try {
      // Step 1: Check for existing artists in bulk
      const { data: existingArtists, error: selectError } = await supabase!
        .from("artists")
        .select("id, name")
        .in("name", artistNames);

      if (selectError) {
        throw new Error(selectError.message);
      }

      // Create a map of artist names to ids
      const artistMap = new Map<string, string>();
      existingArtists.forEach((artist: Artist) => {
        artistMap.set(artist.name, artist.id);
      });

      // Step 2: Identify missing artists (those who don't exist yet)
      const newArtistNames = artistNames.filter(
        (artistName) => !artistMap.has(artistName)
      );

      // Step 3: Bulk insert missing artists
      if (newArtistNames.length > 0) {
        const { data: newArtists, error: insertError } = await supabase!
          .from("artists")
          .insert(newArtistNames.map((name) => ({ name })))
          .select("id, name");

        if (insertError) {
          throw new Error(insertError.message);
        }

        // Add the newly created artists to the map
        newArtists.forEach((artist: Artist) => {
          artistMap.set(artist.name, artist.id);
        });
      }

      // Return the ids of all artists (existing + newly created)
      return artistNames.map((name) => artistMap.get(name)!);
    } catch (error) {
      console.error("Error ensuring artists exist:", error);
      throw new Error("Failed to ensure artists exist");
    }
  }

  // Function to save or update songs in bulk, returns number of songs updated
  async saveSongs(songs: RecentSongWithID[]): Promise<number> {
    this.checkSupabaseConfig();
    
    try {
      let updatedCount = 0;
      // Step 1: Get existing songs to check what's already in database
      const existingSongIds = songs.map(song => song.ID);
      const { data: existingSongs, error: selectError } = await supabase!
        .from("songs")
        .select("id, custom_song_id")
        .in("custom_song_id", existingSongIds);

      if (selectError) {
        throw new Error(selectError.message);
      }

      // No need to track last_played array anymore

      // Step 2: Collect artist names from songs and ensure they exist
      const artistNames = Array.from(new Set(songs.map((song) => song.artist)));
      const { data: artists, error: artistError } = await supabase!
        .from("artists")
        .select("id, name")
        .in("name", artistNames);

      if (artistError) {
        throw new Error(artistError.message);
      }

      // Create artist name to ID mapping
      const artistMap = new Map<string, string>();
      artists.forEach((artist: Artist) => {
        artistMap.set(artist.name, artist.id);
      });

      // Ensure any missing artists are created
      const existingArtistNames = new Set(artists.map((a: Artist) => a.name));
      const missingArtists = artistNames.filter(name => !existingArtistNames.has(name));
      
      if (missingArtists.length > 0) {
        const { data: newArtists, error: insertError } = await supabase!
          .from("artists")
          .insert(missingArtists.map(name => ({ name })))
          .select("id, name");

        if (insertError) {
          throw new Error(insertError.message);
        }

        // Add new artists to our map
        newArtists.forEach((artist: Artist) => {
          artistMap.set(artist.name, artist.id);
        });
      }

      // Step 3: Prepare songs data (no last_played)
      const songsWithArtistIds = songs.map((song) => {
        const artistId = artistMap.get(song.artist);
        if (!artistId) {
          throw new Error(`Artist ID not found for: ${song.artist}`);
        }
        return {
          custom_song_id: song.ID,
          title: song.title,
          artist_id: artistId,
          cover_url: song.url,
          updated_at: new Date().toISOString(),
        };
      });

      // Step 4: Bulk insert or update songs
      const { error: upsertError } = await supabase!
        .from("songs")
        .upsert(songsWithArtistIds, { onConflict: "custom_song_id" });

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      // Step 4.5: Re-query songs table to ensure all IDs are present
      const { data: refreshedSongs, error: refreshedSongsError } = await supabase!
        .from("songs")
        .select("id, custom_song_id")
        .in("custom_song_id", songs.map(song => song.ID));
      if (refreshedSongsError) {
        throw new Error(refreshedSongsError.message);
      }

      // Step 5: Retrieve latest plays for deduplication
      const { data: latestPlays, error: latestPlaysError } = await (supabase! as any)
        .from("play_times")
        .select("song_id")
        .order("played_at", { ascending: false })
        .limit(songs?.length + 5 || 10);
      if (latestPlaysError) {
        throw new Error(latestPlaysError.message);
      }

      const playedSongIDs = (latestPlays || []).map((row: any) => row.song_id );

      for (const song of songs) {
        const songRow = refreshedSongs.find(s => s.custom_song_id === song.ID);
        if (!songRow || !songRow.id) {
          console.log(`[DEBUG] Skipping play_times insert: song not found in DB for ID`, song.ID, song.title, song.artist);
          continue;
        }
        const playTime = new Date(song.date || Date.now()).toISOString();
        if (!playedSongIDs.includes(songRow.id)) {
          await (supabase! as any)
            .from("play_times")
            .insert([
              {
                song_id: songRow.id,
                played_at: playTime,
              },
            ]);
          updatedCount++;
        }
      }
      return updatedCount;
    } catch (error) {
      console.error("Error saving songs:", error);
      throw new Error("Failed to save songs");
    }
  }

  // Function to load the latest X plays (ordered by played_at desc)
  async loadSongs(limit: number): Promise<RecentSongWithID[]> {
    this.checkSupabaseConfig();
    try {
      // Use 'as any' to bypass type error for play_times
      const { data, error } = await (supabase! as any)
        .from("play_times")
        .select(`
          played_at,
          song:song_id(*, artist:artist_id(name))
        `)
        .order("played_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map((row: any) => ({
        ID: row.song.custom_song_id,
        artist: row.song.artist?.name || "",
        title: row.song.title,
        date: new Date(row.played_at).getTime(),
        url: row.song.cover_url,
      }));
    } catch (error) {
      console.error("Error loading latest plays:", error);
      throw new Error("Failed to load plays");
    }
  }

  // Function to load the current playing song (most recently played)
  async loadCurrentSong(): Promise<RecentSongWithID | null> {
    return this.loadSongs(1).then((songs) => songs[0] || null);
  }

  // Function to add interactions in bulk (comments, likes, etc.)
  async addInteractions(interactions: Interaction[]): Promise<void> {
    this.checkSupabaseConfig();
    
    try {
      const { error } = await supabase!
        .from("interactions")
        .insert(interactions);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error adding interactions:", error);
      throw new Error("Failed to add interactions");
    }
  }

  // Function to fetch interactions by song or artist
  async getInteractions(
    entityId: string,
    entityType: "song" | "artist"
  ): Promise<Interaction[]> {
    this.checkSupabaseConfig();
    
    try {
      const { data, error } = await supabase!
        .from("interactions")
        .select("*")
        .eq("entity_id", entityId)
        .eq("entity_type", entityType);

      if (error) {
        throw new Error(error.message);
      }

      return data as Interaction[];
    } catch (error) {
      console.error("Error fetching interactions:", error);
      throw new Error("Failed to fetch interactions");
    }
  }
}
