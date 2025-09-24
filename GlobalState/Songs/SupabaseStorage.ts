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

  // Function to save or update songs in bulk
  async saveSongs(songs: RecentSongWithID[]): Promise<void> {
    this.checkSupabaseConfig();
    
    try {
      // Step 1: Get existing songs to check what's already in database
      const existingSongIds = songs.map(song => song.ID);
      const { data: existingSongs, error: selectError } = await supabase!
        .from("songs")
        .select("custom_song_id, last_played")
        .in("custom_song_id", existingSongIds);

      if (selectError) {
        throw new Error(selectError.message);
      }

      // Create a map of existing songs and their most recent play time
      const existingSongsMap = new Map<string, string>();
      existingSongs.forEach((song: any) => {
        // Get the most recent play time (first element in array)
        const mostRecentPlay = song.last_played && song.last_played.length > 0 
          ? song.last_played[0] 
          : null;
        if (mostRecentPlay) {
          existingSongsMap.set(song.custom_song_id, mostRecentPlay);
        }
      });

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

      // Step 3: Prepare songs data - only update last_played for new songs or more recent plays
      const songsWithArtistIds = songs.map((song) => {
        const artistId = artistMap.get(song.artist);
        if (!artistId) {
          throw new Error(`Artist ID not found for: ${song.artist}`);
        }

        const existingLastPlayed = existingSongsMap.get(song.ID);
        const newPlayTime = new Date(song.date || Date.now()).toISOString();
        
        // For array-based last_played, we need to handle it differently
        let lastPlayedArray: string[];
        
        if (!existingLastPlayed) {
          // New song - create new array with just this play time
          lastPlayedArray = [newPlayTime];
        } else {
          // Existing song - only add new time if it's significantly different (more than 10 minutes)
          const existingTime = new Date(existingLastPlayed);
          const newTime = new Date(newPlayTime);
          const timeDiffMinutes = Math.abs(newTime.getTime() - existingTime.getTime()) / (1000 * 60);
          
          if (timeDiffMinutes > 10) {
            // Add new play time to beginning of array (most recent first)
            lastPlayedArray = [newPlayTime, existingLastPlayed];
          } else {
            // Keep existing time, don't add duplicate
            lastPlayedArray = [existingLastPlayed];
          }
        }

        return {
          custom_song_id: song.ID,
          title: song.title,
          artist_id: artistId,
          cover_url: song.url,
          last_played: lastPlayedArray,
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
    } catch (error) {
      console.error("Error saving songs:", error);
      throw new Error("Failed to save songs");
    }
  }

  // Function to load the latest X songs (ordered by last played)
  async loadSongs(limit: number): Promise<RecentSongWithID[]> {
    this.checkSupabaseConfig();
    
    try {
      // Since last_played is an array, we need to order by updated_at instead
      // or create a computed column for most recent play time
      const { data, error } = await supabase!
        .from("songs")
        .select(`
          *,
          artists!inner(name)
        `)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data
        .map((song: any) => ({
          ID: song.custom_song_id,
          artist: song.artists.name,
          title: song.title,
          date: song.last_played?.length > 0 
            ? new Date(song.last_played[0]).getTime() // First element is most recent
            : new Date(song.updated_at).getTime(), // Fallback to updated_at
          url: song.cover_url,
        } as RecentSongWithID))
        .sort((a, b) => (b.date || 0) - (a.date || 0)); // Sort by date in memory for accuracy
    } catch (error) {
      console.error("Error loading latest songs:", error);
      throw new Error("Failed to load songs");
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
