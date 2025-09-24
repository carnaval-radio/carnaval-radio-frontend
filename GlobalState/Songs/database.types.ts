// Auto-generated database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          id: string
          custom_song_id: string
          title: string
          artist_id: string
          description: string | null
          cover_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          custom_song_id: string
          title: string
          artist_id: string
          description?: string | null
          cover_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          custom_song_id?: string
          title?: string
          artist_id?: string
          description?: string | null
          cover_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_artist_id_fkey"
            columns: ["artist_id"]
            referencedRelation: "artists"
            referencedColumns: ["id"]
          }
        ]
      }
      interactions: {
        Row: {
          id: string
          entity_id: string
          entity_type: "song" | "artist"
          type: "like" | "vote" | "comment" | "lyrics"
          user_id: string
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_id: string
          entity_type: "song" | "artist"
          type: "like" | "vote" | "comment" | "lyrics"
          user_id: string
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_id?: string
          entity_type?: "song" | "artist"
          type?: "like" | "vote" | "comment" | "lyrics"
          user_id?: string
          content?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}