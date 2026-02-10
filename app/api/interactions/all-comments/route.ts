import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";

export const revalidate = 60; // Revalidate cache every 60 seconds

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ comments: [] });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ comments: [] });
    }

    // Get recent comments (limited to 100)
    const { data: commentsData, error: commentsError } = await supabase
      .from("interactions")
      .select("id, content, created_at, entity_id")
      .eq("entity_type", "song")
      .eq("type", "comment")
      .not("content", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (commentsError || !commentsData || commentsData.length === 0) {
      console.error("Error loading comments:", commentsError);
      return NextResponse.json({ comments: [] });
    }

    // Get unique song IDs
    const entityIds = commentsData.map((c: any) => c.entity_id).filter(Boolean);
    const uniqueIds = new Set<string>();
    entityIds.forEach((id: string) => uniqueIds.add(id));
    const songIds = Array.from(uniqueIds);

    if (songIds.length === 0) {
      return NextResponse.json({ comments: [] });
    }

    // Get song data
    const { data: songsData, error: songsError } = await supabase
      .from("songs")
      .select(`
        id,
        custom_song_id,
        title,
        cover_url,
        artists (
          name
        )
      `)
      .in("id", songIds);

    if (songsError) {
      console.error("Error loading songs:", songsError);
      return NextResponse.json({ comments: [] });
    }

    // Create a map of songs by ID
    const songsMap = new Map();
    (songsData || []).forEach((song: any) => {
      songsMap.set(song.id, {
        custom_song_id: song.custom_song_id,
        title: song.title,
        cover_url: song.cover_url,
        artist: song.artists?.name || "",
      });
    });

    // Combine comments with song data
    const comments = commentsData
      .map((comment: { entity_id: any; id: any; content: any; created_at: any; }) => {
        const song = songsMap.get(comment.entity_id);
        if (!song) return null;

        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          song,
        };
      })
      .filter((c: any) => c !== null);

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("All comments error:", error);
    return NextResponse.json({ comments: [] });
  }
}
