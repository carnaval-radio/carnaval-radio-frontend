import { RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";

import { Interaction } from "./Songs/types";

export interface IStorage {
  // Save songs in bulk
  saveSongs(songs: RecentSong[]): Promise<number>;

  // Load the latest songs
  loadSongs(limit: number): Promise<RecentSong[]>;

  // Load the current song (the one that's most recently played)
  loadCurrentSong(): Promise<RecentSong | null>;
}

export interface IInteractionsStorage {
    // Add interactions in bulk (comments, likes, votes)
    addInteractions(interactions: Interaction[]): Promise<void>;
  
    // Get interactions by song or artist
    getInteractions(entityId: string, entityType: 'song' | 'artist'): Promise<Interaction[]>;
}



