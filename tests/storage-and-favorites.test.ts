// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLocalStorage, setLocalStorage } from "@/helpers/storageHelper";
import { getOrCreateDeviceId } from "@/helpers/deviceId";
import {
  getFavoritesLocal,
  getFavoriteTimestamps,
  setFavoritesLocal,
  syncFavoriteToSupabase,
  toggleFavoriteLocal,
} from "@/helpers/favorites";

const KEY = "favorite_song_custom_ids";
const now = 1794129060000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

describe("local storage", () => {
  it("uses the supplied default for missing or undefined values", () => {
    expect(getLocalStorage("missing", false)).toBe(false);
    localStorage.setItem("missing", "undefined");
    expect(getLocalStorage("missing", null)).toBeNull();
  });

  it("round-trips JSON values", () => {
    setLocalStorage("test", { enabled: true, time: now });
    expect(getLocalStorage("test", null)).toEqual({ enabled: true, time: now });
  });
});

describe("device identity", () => {
  it("creates and reuses the same device ID", () => {
    const id = getOrCreateDeviceId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(localStorage.getItem("device_id")).toBe(id);
    expect(getOrCreateDeviceId()).toBe(id);
  });

  it.each(["undefined", "null"])("replaces an invalid %s ID", (value) => {
    localStorage.setItem("device_id", value);
    expect(getOrCreateDeviceId()).not.toBe(value);
  });

  it("creates a fallback UUID without randomUUID", () => {
    vi.stubGlobal("crypto", {});
    expect(getOrCreateDeviceId())
      .toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("returns a usable ID when browser storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    expect(getOrCreateDeviceId()).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("local favorites", () => {
  it.each([null, "undefined", "null", "invalid-json", "123"])(
    "reads an empty collection for %s",
    (raw) => {
      if (raw !== null) localStorage.setItem(KEY, raw);
      expect(getFavoritesLocal()).toEqual({});
      expect(getFavoriteTimestamps()).toEqual({});
    },
  );

  it("supports the legacy array format", () => {
    localStorage.setItem(KEY, JSON.stringify(["song-one", "song-two"]));
    expect(getFavoritesLocal()).toEqual({ "song-one": true, "song-two": true });
    expect(getFavoriteTimestamps()).toEqual({ "song-one": now, "song-two": now });
  });

  it("adds and removes favorites with timestamps", () => {
    expect(toggleFavoriteLocal("song-one")).toEqual({ "song-one": true });
    expect(getFavoriteTimestamps()).toEqual({ "song-one": now });
    expect(toggleFavoriteLocal("song-one")).toEqual({});
    expect(getFavoriteTimestamps()).toEqual({});
  });

  it("preserves existing timestamps when replacing the collection", () => {
    localStorage.setItem(KEY, JSON.stringify({ existing: now - 1000, removed: now - 2000 }));
    setFavoritesLocal({ existing: true, added: true });
    expect(getFavoriteTimestamps()).toEqual({ existing: now - 1000, added: now });
  });

  it("keeps reads and writes resilient when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    expect(getFavoritesLocal()).toEqual({});
    expect(getFavoriteTimestamps()).toEqual({});
    expect(() => setFavoritesLocal({ song: true })).not.toThrow();
  });

  it.each([true, false])("sends the requested like=%s using the stable device ID", async (like) => {
    localStorage.setItem("device_id", "test-device");
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));
    await syncFavoriteToSupabase("song-one", like);
    expect(fetch).toHaveBeenCalledWith("/api/interactions/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        custom_song_id: "song-one",
        device_id: "test-device",
        like,
      }),
    });
  });

  it("preserves local favorites when syncing is offline", async () => {
    toggleFavoriteLocal("song-one");
    vi.mocked(fetch).mockRejectedValue(new Error("Offline"));
    await expect(syncFavoriteToSupabase("song-one", true)).resolves.toBeUndefined();
    expect(getFavoritesLocal()).toEqual({ "song-one": true });
  });
});
