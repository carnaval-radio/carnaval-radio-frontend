import { fetchSongs, RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";
import { updateSongs } from "@/GlobalState/ApiCalls/updateSongs";
import { DataStorage } from "@/GlobalState/Songs/SupabaseStorage";
import { isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  let limit = 10;
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, 100);
    }
  }

  // Always fetch from Radio API
  let radioSongs: RecentSong[] = [];
  try {
    radioSongs = await fetchSongs();
  } catch (error) {
    console.error("❌ Radio API fetch failed:", error);
    return NextResponse.json([], { status: 503 });
  }

  const shouldFetchFromSupabase = limit > 5;

  // Try to fetch from Supabase, but don't crash if it fails
  let supabaseSongs: RecentSong[] = [];
  const hasSupabase = isSupabaseConfigured();

  if (hasSupabase && shouldFetchFromSupabase) {
    updateSongs().catch((e) => console.warn("updateSongs background error", e));
    try {
      const storage = new DataStorage();
      supabaseSongs = await storage.loadSongs(limit);
    } catch (error) {
      console.warn("⚠️ Supabase unavailable, merging only radio API songs:", error);
    }
  }

  // Merge and dedupe by song ID, prefer Supabase if times are close
  const TEN_MINUTES_MS = 10 * 60 * 1000;
  const mergedMap = new Map<string, RecentSong>();

  // Add Supabase songs first
  for (const song of supabaseSongs) {
    if (song.ID) mergedMap.set(song.ID, song);
  }

  // Add Radio songs, dedupe and prefer Supabase if times are close
  for (const song of radioSongs) {
    if (!song.ID) continue;
    const supa = mergedMap.get(song.ID);
    if (supa) {
      // If times are close, keep Supabase
      if (Math.abs((supa.date ?? 0) - (song.date ?? 0)) <= TEN_MINUTES_MS) {
        continue;
      }
      // Otherwise, keep the more recent
      if ((song.date ?? 0) > (supa.date ?? 0)) {
        mergedMap.set(song.ID, song);
      }
    } else {
      mergedMap.set(song.ID, song);
    }
  }

  // Sort by date descending and apply limit
  const mergedSongs = Array.from(mergedMap.values())
    .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
    .slice(0, limit);

  // Add canAddToFavorites to the response
  return NextResponse.json({
    songs: mergedSongs,
    canAddToFavorites: hasSupabase,
  });
}
