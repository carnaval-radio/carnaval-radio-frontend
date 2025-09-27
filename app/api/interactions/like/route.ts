import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";

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

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: true });
    const body = await request.json();
    const customSongId: string | undefined = body?.custom_song_id;
    const deviceId: string | undefined = body?.device_id;
    const like: boolean = !!body?.like;
    if (!customSongId || !deviceId) return NextResponse.json({ ok: false }, { status: 400 });

    const xff = request.headers.get("x-forwarded-for");
    const ip = firstIp(xff);
    const userAgent = request.headers.get("user-agent") || "";
    const salt = process.env.IP_HASH_SALT || "";
    const ip_hash = await sha256Hex(ip + salt);

    const { data: song, error: songErr } = await supabase!
      .from("songs")
      .select("id")
      .eq("custom_song_id", customSongId)
      .limit(1)
      .single();
    if (songErr || !song?.id) return NextResponse.json({ ok: true });

    if (like) {
      await supabase!
        .from("interactions")
        .insert({
          entity_id: song.id,
          entity_type: "song",
          type: "like",
          user_id: deviceId,
          content: null,
          ip_hash,
          user_agent: userAgent,
        });
      return NextResponse.json({ ok: true });
    } else {
      await supabase!
        .from("interactions")
        .delete()
        .eq("entity_id", song.id)
        .eq("entity_type", "song")
        .eq("type", "like")
        .eq("user_id", deviceId);
      return NextResponse.json({ ok: true });
    }
  } catch {
    return NextResponse.json({ ok: true });
  }
} 