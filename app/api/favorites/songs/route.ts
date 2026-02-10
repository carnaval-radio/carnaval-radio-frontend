import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabase, isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";

// Disable static optimization for this route
export const dynamic = "force-dynamic";

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

		const supabase = getSupabase();
		if (!supabase) {
			return NextResponse.json([], { status: 200 });
		}

		const { searchParams } = new URL(request.url);
		const deviceId = searchParams.get("device_id") || "";
		if (!deviceId) return NextResponse.json([], { status: 200 });

		// Check if user is authenticated
		const session = await auth();
		const userIds: string[] = [];

		if (session?.user?.email) {
			// User is logged in - get all their linked devices
			const { data: deviceProfiles } = await supabase
				.from("device_profiles")
				.select("device_id")
				.eq("user_email", session.user.email);

			if (deviceProfiles && deviceProfiles.length > 0) {
				userIds.push(
					...deviceProfiles.map((dp: { device_id: string }) => dp.device_id)
				);
			}
		}

		// Always include the current device
		userIds.push(deviceId);

		// 1) Fetch all liked song interactions for all user devices/accounts
		const { data: interactionsData } = await supabase
			.from("interactions")
			.select("entity_id, created_at")
			.eq("entity_type", "song")
			.eq("type", "like")
			.in("user_id", userIds);
		const interactions: InteractionRow[] = (interactionsData || []) as unknown as InteractionRow[];
		if (!interactions.length) return NextResponse.json([]);

		// distinct entity_ids and created_at map (keep earliest timestamp)
		const createdAtByEntity: Record<string, string> = {};
		const entityIds: string[] = [];
		for (const row of interactions) {
			if (!createdAtByEntity[row.entity_id]) {
				createdAtByEntity[row.entity_id] = row.created_at;
				entityIds.push(row.entity_id);
			} else {
				// Keep the earliest timestamp
				const existing = new Date(createdAtByEntity[row.entity_id]).getTime();
				const current = new Date(row.created_at).getTime();
				if (current < existing) {
					createdAtByEntity[row.entity_id] = row.created_at;
				}
			}
		}

		// 2) Fetch songs by entity ids
		const { data: songsData, error: songsError } = await supabase
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