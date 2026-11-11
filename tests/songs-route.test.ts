import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";

const services = vi.hoisted(() => ({
  fetchSongs: vi.fn<() => Promise<RecentSong[]>>(),
  loadSongs: vi.fn<(limit: number) => Promise<RecentSong[]>>(),
  updateSongs: vi.fn<() => Promise<void>>(),
  isConfigured: vi.fn<() => boolean>(),
  health: vi.fn<() => Promise<boolean>>(),
}));

vi.mock("@/GlobalState/ApiCalls/fetchSongs", () => ({
  EXTERNAL_MAXIMUM_SONG_HISTORY_AMOUNT: 6,
  fetchSongs: services.fetchSongs,
}));
vi.mock("@/GlobalState/ApiCalls/updateSongs", () => ({ updateSongs: services.updateSongs }));
vi.mock("@/GlobalState/Songs/supabase_client", () => ({
  isSupabaseConfigured: services.isConfigured,
}));
vi.mock("@/helpers/supabaseHealthCheck", () => ({ checkSupabaseHealth: services.health }));
vi.mock("@/GlobalState/Songs/SupabaseStorage", () => ({
  DataStorage: class {
    loadSongs = services.loadSongs;
  },
}));

let GET: typeof import("@/app/api/songs/route").GET;
const now = 1794129060000;

function song(ID: string, date: number | null = now): RecentSong {
  return { ID, date, title: ID, artist: "Test artist", url: "https://example.test/cover.jpg" };
}

function request(query = "") {
  return new NextRequest(`http://localhost/api/songs${query}`);
}

beforeEach(async () => {
  vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "reliastream");
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(now);
  services.fetchSongs.mockResolvedValue([]);
  services.loadSongs.mockResolvedValue([]);
  services.updateSongs.mockResolvedValue(undefined);
  services.isConfigured.mockReturnValue(false);
  services.health.mockResolvedValue(true);
  GET = (await import("@/app/api/songs/route")).GET;
});

describe("songs API", () => {
  it.each([
    ["", 10],
    ["?limit=3", 3],
    ["?limit=999", 100],
    ["?limit=0", 10],
    ["?limit=-1", 10],
    ["?limit=invalid", 10],
  ])("bounds the requested result count for %s", async (query, count) => {
    services.fetchSongs.mockResolvedValue(
      Array.from({ length: 110 }, (_, index) => song(`song-${index}`, now - index)),
    );
    const response = await GET(request(query));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.songs).toHaveLength(count);
    expect(payload.canAddToFavorites).toBe(true);
    expect(payload.songs[0].ID).toBe("song-0");
    expect(services.loadSongs).not.toHaveBeenCalled();
  });

  it("uses only radio history when the requested limit fits it", async () => {
    services.isConfigured.mockReturnValue(true);
    await GET(request("?limit=6"));
    expect(services.loadSongs).not.toHaveBeenCalled();
    expect(services.updateSongs).not.toHaveBeenCalled();
  });

  it("merges and sorts history while preferring database records within ten minutes", async () => {
    services.isConfigured.mockReturnValue(true);
    services.loadSongs.mockResolvedValue([
      song("close", now - 1000),
      song("older-database", now - 700000),
      song("newer-database", now),
      song("database-only", now - 200000),
    ]);
    services.fetchSongs.mockResolvedValue([
      song("close", now),
      song("older-database", now),
      song("newer-database", now - 700000),
      song("radio-only", now - 100000),
      song("", now),
    ]);
    const response = await GET(request("?limit=10"));
    const { songs } = await response.json();
    expect(songs.map((item: RecentSong) => item.ID))
      .toEqual(["older-database", "newer-database", "close", "radio-only", "database-only"]);
    expect(songs.find((item: RecentSong) => item.ID === "close").date).toBe(now - 1000);
    expect(services.loadSongs).toHaveBeenCalledWith(10);
  });

  it("sorts history without timestamps last", async () => {
    services.fetchSongs.mockResolvedValue([song("no-time", null), song("recent")]);
    const response = await GET(request("?limit=6"));
    expect((await response.json()).songs.map((item: RecentSong) => item.ID))
      .toEqual(["recent", "no-time"]);
  });

  it("preserves actual Centova timestamps instead of nearby database estimates", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "coophosting");
    services.isConfigured.mockReturnValue(true);
    services.loadSongs.mockResolvedValue([song("same-track", now)]);
    services.fetchSongs.mockResolvedValue([
      song("same-track", now - 120000),
      song("same-track", now - 180000),
    ]);
    const response = await GET(request());
    expect((await response.json()).songs).toEqual([song("same-track", now - 120000)]);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("retains radio results and disables favorites if the database fails", async () => {
    services.isConfigured.mockReturnValue(true);
    services.loadSongs.mockRejectedValue(new Error("Database unavailable"));
    services.fetchSongs.mockResolvedValue([song("radio-song")]);
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const response = await GET(request());
    expect(await response.json()).toEqual({
      songs: [song("radio-song")],
      canAddToFavorites: false,
    });
    expect(warning).toHaveBeenCalledWith(expect.any(String), expect.any(Error));
    expect(services.health).not.toHaveBeenCalled();
  });

  it("reports a thrown radio failure as 503", async () => {
    const error = new Error("Radio failed");
    services.fetchSongs.mockRejectedValue(error);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual([]);
    expect(log).toHaveBeenCalledWith(expect.any(String), error);
    expect(services.health).not.toHaveBeenCalled();
  });

  it("exposes the favorites health status", async () => {
    services.health.mockResolvedValue(false);
    const response = await GET(request("?limit=6"));
    expect(await response.json()).toEqual({ songs: [], canAddToFavorites: false });
  });

  it("limits background database updates to more than once per ten minutes", async () => {
    services.isConfigured.mockReturnValue(true);
    await GET(request());
    await GET(request());
    expect(services.updateSongs).toHaveBeenCalledOnce();
    vi.setSystemTime(now + 600000);
    await GET(request());
    expect(services.updateSongs).toHaveBeenCalledOnce();
    vi.setSystemTime(now + 600001);
    await GET(request());
    expect(services.updateSongs).toHaveBeenCalledTimes(2);
  });

  it("logs background update failures without losing readable history", async () => {
    services.isConfigured.mockReturnValue(true);
    const error = new Error("Update failed");
    services.updateSongs.mockRejectedValue(error);
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(warning).toHaveBeenCalledWith("updateSongs background error", error);
  });
});
