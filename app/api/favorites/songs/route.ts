import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";

interface SongRow {
	id: string;
	custom_song_id: string;
	title: string;
	cover_url: string | null;
	artist: { name: string } | null;
}

interface InteractionRow {
	entity_id: string;
	created_at: string;
}

export async function GET(request: NextRequest) {
	try {
		if (!isSupabaseConfigured()) {
			return NextResponse.json([], { status: 200 });
		}
		const { searchParams } = new URL(request.url);
		const deviceId = searchParams.get("device_id") || "";
		if (!deviceId) return NextResponse.json([], { status: 200 });

		// 1) Fetch all liked song interactions for device
		const { data: interactionsData } = await supabase!
			.from("interactions")
			.select("entity_id, created_at")
			.eq("entity_type", "song")
			.eq("type", "like")
			.eq("user_id", deviceId);
		const interactions: InteractionRow[] = (interactionsData || []) as unknown as InteractionRow[];
		if (!interactions.length) return NextResponse.json([]);

		// distinct entity_ids and created_at map
		const createdAtByEntity: Record<string, string> = {};
		const entityIds: string[] = [];
		for (const row of interactions) {
			if (!createdAtByEntity[row.entity_id]) {
				createdAtByEntity[row.entity_id] = row.created_at;
				entityIds.push(row.entity_id);
			}
		}

		// 2) Fetch songs by entity ids
		const { data: songsData, error: songsError } = await supabase!
			.from("songs")
			.select("id, custom_song_id, title, cover_url, artist:artist_id(name)")
			.in("id", entityIds);
		if (songsError) return NextResponse.json([]);
		const songs: SongRow[] = (songsData || []) as unknown as SongRow[];

		// 3) Merge created_at and return
		const payload = songs.map((s) => ({
			...s,
			created_at: createdAtByEntity[s.id] || null,
		}));
		return NextResponse.json(payload);
	} catch {
		return NextResponse.json([], { status: 200 });
	}
} 