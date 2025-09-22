import { RecentSong, RecentSongWithID } from "@/GlobalState/ApiCalls/fetchSongs";

import { Song, Interaction } from "./Songs/types";

export interface IStorage {
  // Save songs in bulk
  saveSongs(songs: RecentSongWithID[]): Promise<void>;

  // Load the latest songs
  loadSongs(limit: number): Promise<RecentSongWithID[]>;

  // Load the current song (the one that's most recently played)
  loadCurrentSong(): Promise<RecentSongWithID | null>;
}

export interface IInteractionsStorage {
    // Add interactions in bulk (comments, likes, votes)
    addInteractions(interactions: Interaction[]): Promise<void>;
  
    // Get interactions by song or artist
    getInteractions(entityId: string, entityType: 'song' | 'artist'): Promise<Interaction[]>;
}



