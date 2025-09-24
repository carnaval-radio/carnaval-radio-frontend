// types.ts
export interface Artist {
    id: string;
    name: string;
  }
  
  export interface Song {
    id: string;  // UUID
    custom_song_id: string;  // artistname_songtitle (unique)
    title: string;
    artist_id: string;  // UUID reference to artist
    description: string | null;
    cover_url: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface Interaction {
    id: string;
    entity_id: string;  // song_id or artist_id
    entity_type: 'song' | 'artist';  // Either song or artist
    type: 'like' | 'vote' | 'comment' | 'lyrics';  // Type of interaction
    user_id: string;  // User ID
    content: string | null;  // Content, such as a comment or lyrics
    created_at: string;
  }
  