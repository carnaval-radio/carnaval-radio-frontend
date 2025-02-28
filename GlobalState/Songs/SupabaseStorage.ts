// storageService.ts
import { RecentSong } from '../ApiCalls/fetchSongs';
import { IStorage } from '../Storage';
import { supabase } from './supabase_client';
import { Song, Artist, Interaction } from './types';

export class DataStorage implements IStorage {

// Function to ensure that all artists exist, return their ids in bulk
  async ensureArtists(artistNames: string[]): Promise<string[]> {
    try {
      // Step 1: Check for existing artists in bulk
      const { data: existingArtists, error: selectError } = await supabase
        .from('artists')
        .select('id, name')
        .in('name', artistNames);

      if (selectError) {
        throw new Error(selectError.message);
      }

      // Create a map of artist names to ids
      const artistMap = new Map<string, string>();
      existingArtists.forEach((artist: Artist) => {
        artistMap.set(artist.name, artist.id);
      });

      // Step 2: Identify missing artists (those who don't exist yet)
      const newArtistNames = artistNames.filter(artistName => !artistMap.has(artistName));

      // Step 3: Bulk insert missing artists
      if (newArtistNames.length > 0) {
        const { data: newArtists, error: insertError } = await supabase
          .from('artists')
          .insert(newArtistNames.map(name => ({ name })))
          .select('id, name');

        if (insertError) {
          throw new Error(insertError.message);
        }

        // Add the newly created artists to the map
        newArtists.forEach((artist: Artist) => {
          artistMap.set(artist.name, artist.id);
        });
      }

      // Return the ids of all artists (existing + newly created)
      return artistNames.map(name => artistMap.get(name)!);
    } catch (error) {
      console.error('Error ensuring artists exist:', error);
      throw new Error('Failed to ensure artists exist');
    }
  }

// Function to save or update songs in bulk
 async saveSongs(songs: RecentSong[]): Promise<void> {
  try {
    // Step 1: Collect artist names from songs and ensure they exist
    const artistNames = Array.from(new Set(songs.map(song => song.artist)));
    const artistIds = await this.ensureArtists(artistNames);

    console.log(artistIds);

    // Step 2: Prepare songs with artist ids
    const songsWithArtistIds = songs.map((song, index) => ({
      custom_song_id: song.ID,
      title: song.title,
      artist_id: artistIds[index],  // Link song to corresponding artist
      cover_url: song.url,
      last_played: [],  // Initialize last played as an empty array
      updated_at: new Date().toISOString(),
    }));

    // Step 3: Bulk insert or update songs
    const { error: upsertError } = await supabase
      .from('songs')
      .upsert(songsWithArtistIds, { onConflict: 'custom_song_id' });

    if (upsertError) {
      throw new Error(upsertError.message);
    }

  } catch (error) {
    console.error('Error saving songs:', error);
    throw new Error('Failed to save songs');
  }
}

// Function to load the latest X songs (ordered by last played)
 async loadSongs(limit: number): Promise<RecentSong[]> {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('last_played', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data.map((song: Song) => ({
      ID: song.custom_song_id,
      artist: song.artist_id,
      title: song.title,
      date: 1,  // Placeholder date
      url: song.cover_url,
    } as RecentSong));

  } catch (error) {
    console.error('Error loading latest songs:', error);
    throw new Error('Failed to load songs');
  }
}

// Function to load the current playing song (most recently played)
 async loadCurrentSong(): Promise<RecentSong | null> {
  return this.loadSongs(1).then(songs => songs[0] || null);
}

// Function to add interactions in bulk (comments, likes, etc.)
 async addInteractions(interactions: Interaction[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('interactions')
      .insert(interactions);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error adding interactions:', error);
    throw new Error('Failed to add interactions');
  }
}

// Function to fetch interactions by song or artist
 async getInteractions(entityId: string, entityType: 'song' | 'artist'): Promise<Interaction[]> {
  try {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType);

    if (error) {
      throw new Error(error.message);
    }

    return data as Interaction[];
  } catch (error) {
    console.error('Error fetching interactions:', error);
    throw new Error('Failed to fetch interactions');
  }
}
}