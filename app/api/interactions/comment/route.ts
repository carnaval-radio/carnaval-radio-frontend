import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";
import { Filter } from "bad-words";

const filter = new Filter();

function firstIp(xff: string | null): string {
  if (!xff) return "";
  const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts[0] : "";
}

async function sha256Hex(input: string): Promise<string> {
  try {
    const data = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const bytes = new Uint8Array(hash);
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, "0");
    }
    return hex;
  } catch {
    return "";
  }
}

function hasUrl(text: string): boolean {
  const urlPattern = /(https?:\/\/|www\.|\.com|\.net|\.org|\.io)/i;
  return urlPattern.test(text);
}

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ comments: [] });
    }

    const { searchParams } = new URL(request.url);
    const customSongId = searchParams.get("custom_song_id");

    if (!customSongId) {
      return NextResponse.json({ comments: [] });
    }

    // Get song ID
    const { data: song } = await supabase!
      .from("songs")
      .select("id")
      .eq("custom_song_id", customSongId)
      .limit(1)
      .single();

    if (!song?.id) {
      return NextResponse.json({ comments: [] });
    }

    // Get comments
    const { data, error } = await supabase!
      .from("interactions")
      .select("id, content, user_id, created_at")
      .eq("entity_id", song.id)
      .eq("entity_type", "song")
      .eq("type", "comment")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading comments:", error);
      return NextResponse.json({ comments: [] });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
    
    const body = await request.json();
    const customSongId: string | undefined = body?.custom_song_id;
    const deviceId: string | undefined = body?.device_id;
    const content: string | undefined = body?.content;

    if (!customSongId || !deviceId || !content) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    // Validate content
    const trimmedContent = content.trim();
    
    if (trimmedContent.length < 5) {
      return NextResponse.json({ ok: false, error: "Comment moet minimaal 5 tekens bevatten" }, { status: 400 });
    }
    
    if (trimmedContent.length > 300) {
      return NextResponse.json({ ok: false, error: "Comment mag maximaal 300 tekens bevatten" }, { status: 400 });
    }

    // Check for URLs
    if (hasUrl(trimmedContent)) {
      return NextResponse.json({ ok: false, error: "Links zijn niet toegestaan in comments" }, { status: 400 });
    }

    // Check for profanity
    if (filter.isProfane(trimmedContent)) {
      return NextResponse.json({ ok: false, error: "Comment bevat ongepaste taal" }, { status: 400 });
    }

    // Get IP and user agent
    const xff = request.headers.get("x-forwarded-for");
    const ip = firstIp(xff);
    const userAgent = request.headers.get("user-agent") || "";
    const salt = process.env.IP_HASH_SALT || "";
    const ip_hash = await sha256Hex(ip + salt);

    // Get song ID
    const { data: song, error: songErr } = await supabase!
      .from("songs")
      .select("id")
      .eq("custom_song_id", customSongId)
      .limit(1)
      .single();
    
    if (songErr || !song?.id) {
      return NextResponse.json({ ok: false, error: "Song niet gevonden" }, { status: 404 });
    }

    // Check rate limiting: has this device commented on this song in the last 30 minutes?
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: recentComments } = await supabase!
      .from("interactions")
      .select("id")
      .eq("entity_id", song.id)
      .eq("entity_type", "song")
      .eq("type", "comment")
      .eq("user_id", deviceId)
      .gte("created_at", thirtyMinutesAgo)
      .limit(1);

    if (recentComments && recentComments.length > 0) {
      return NextResponse.json({ 
        ok: false, 
        error: "Je kunt maar 1 comment per half uur plaatsen per nummer" 
      }, { status: 429 });
    }

    // Insert comment
    const { error: insertErr } = await supabase!
      .from("interactions")
      .insert({
        entity_id: song.id,
        entity_type: "song",
        type: "comment",
        user_id: deviceId,
        content: trimmedContent,
        ip_hash,
        user_agent: userAgent,
      });

    if (insertErr) {
      console.error("Error inserting comment:", insertErr);
      return NextResponse.json({ ok: false, error: "Fout bij opslaan" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json({ ok: false, error: "Server fout" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: false }, { status: 503 });
    
    const body = await request.json();
    const commentId: string | undefined = body?.comment_id;
    const deviceId: string | undefined = body?.device_id;

    if (!commentId || !deviceId) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    // Delete only if it's the user's own comment
    const { error: deleteErr } = await supabase!
      .from("interactions")
      .delete()
      .eq("id", commentId)
      .eq("type", "comment")
      .eq("user_id", deviceId);

    if (deleteErr) {
      console.error("Error deleting comment:", deleteErr);
      return NextResponse.json({ ok: false, error: "Fout bij verwijderen" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ ok: false, error: "Server fout" }, { status: 500 });
  }
}
