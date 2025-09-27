import "client-only";
import { getOrCreateDeviceId } from "./deviceId";

const LOCAL_KEY = "favorite_song_custom_ids"; // stores array of songs.custom_song_id or map with timestamps

export type FavoriteMap = Record<string, true>;
export type FavoriteTimestamps = Record<string, number>; // epoch ms per custom_song_id

function readRaw(): string | null {
	try { return localStorage.getItem(LOCAL_KEY); } catch { return null; }
}

function writeRaw(value: string): void {
	try { localStorage.setItem(LOCAL_KEY, value); } catch {}
}

export function getFavoritesLocal(): FavoriteMap {
	try {
		const raw = readRaw();
		if (!raw || raw === "undefined" || raw === "null") return {};
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return Object.fromEntries(parsed.map((id: string) => [id, true]));
		}
		if (parsed && typeof parsed === "object") {
			return Object.fromEntries(Object.keys(parsed).map((id) => [id, true]));
		}
		return {};
	} catch { return {}; }
}

export function getFavoriteTimestamps(): FavoriteTimestamps {
	try {
		const raw = readRaw();
		if (!raw || raw === "undefined" || raw === "null") return {};
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			const now = Date.now();
			return Object.fromEntries(parsed.map((id: string) => [id, now]));
		}
		if (parsed && typeof parsed === "object") {
			return parsed as FavoriteTimestamps;
		}
		return {};
	} catch { return {}; }
}

export function setFavoritesLocal(map: FavoriteMap): void {
	const timestamps = getFavoriteTimestamps();
	const merged: FavoriteTimestamps = {};
	for (const id of Object.keys(map)) {
		merged[id] = timestamps[id] || Date.now();
	}
	writeRaw(JSON.stringify(merged));
}

export function toggleFavoriteLocal(customSongId: string): FavoriteMap {
	const current = getFavoritesLocal();
	const currentTs = getFavoriteTimestamps();
	if (current[customSongId]) {
		delete current[customSongId];
		delete currentTs[customSongId];
		writeRaw(JSON.stringify(currentTs));
	} else {
		current[customSongId] = true;
		currentTs[customSongId] = Date.now();
		writeRaw(JSON.stringify(currentTs));
	}
	return getFavoritesLocal();
}

export async function syncFavoriteToSupabase(customSongId: string, makeFavorite: boolean): Promise<void> {
	try {
		const deviceId = getOrCreateDeviceId();
		await fetch("/api/interactions/like", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ custom_song_id: customSongId, device_id: deviceId, like: makeFavorite }),
		});
	} catch {
		// swallow errors to keep UI resilient
	}
} 