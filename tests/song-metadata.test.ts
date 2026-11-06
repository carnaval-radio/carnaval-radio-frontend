import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  enrichCover,
  estimatePlayTimes,
  fetchSongs,
  generateCustomSongId,
  getSongDuration,
  normalizeString,
  splitTitle,
} from "@/GlobalState/ApiCalls/fetchSongs";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime("2026-11-08T09:11:00Z");
});

describe("song metadata", () => {
  it("splits the radio API title-before-artist format", () => {
    expect(splitTitle("Song - Artist")).toEqual({ title: "Song", artist: "Artist" });
  });

  it.each(["No separator", "One - Two - Three"])("preserves ambiguous titles: %s", (title) => {
    expect(splitTitle(title)).toEqual({ title, artist: "Unknown" });
  });

  it("generates stable IDs across case, accents, whitespace and punctuation", () => {
    expect(generateCustomSongId("Träcksäck", "  Sjön, sjön! ")).toBe("tracksack-sjon-sjon-");
    expect(normalizeString("ÁRTIST -- Song, Part")).toBe("artist-song-part");
  });

  it("uses three minutes for songs and twenty seconds for jingles", () => {
    expect(getSongDuration({ title: "Song", artist: "Artist" })).toBe(180000);
    expect(getSongDuration({ title: "Radio Jingle", artist: "Artist" })).toBe(20000);
    expect(getSongDuration({ title: "Song", artist: "Jingle artist" })).toBe(20000);
  });

  it("estimates descending timestamps with the custom offset", () => {
    const now = Date.now();
    expect(estimatePlayTimes(["Song - Artist", "Jingle - Radio", "Song - Artist"], 30000))
      .toEqual([now - 30000, now - 50000, now - 230000]);
    expect(estimatePlayTimes(["Song - Artist"])).toEqual([now - 140000]);
    expect(estimatePlayTimes([])).toEqual([]);
  });

  it("keeps normal covers and substitutes the station logo for live broadcasts", () => {
    const cover = "https://example.test/cover.jpg";
    expect(enrichCover(cover, { title: "Song", artist: "Artist" })).toBe(cover);
    for (const song of [
      { title: "Live uitzending", artist: "Artist" },
      { title: "Carnaval-radio jingle", artist: "Artist" },
      { title: "Song", artist: "unknown" },
      { title: "Song", artist: "Carnaval-Radio.nl" },
    ]) {
      expect(enrichCover("https://example.test/nocover.png", song)).toContain("cloudinary.com");
    }
  });
});

describe("radio history fetching", () => {
  it("normalizes now-playing order, attaches covers, and filters the live placeholder", async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        nowplaying: "Artist - Current song",
        coverart: "https://example.test/current.jpg",
        trackhistory: ["Older song - Another artist", "Live uitzending - Station", "Placeholder - Station", "Last song - Artist"],
        covers: ["https://example.test/older.jpg"],
      },
    });
    const songs = await fetchSongs();
    expect(songs.map(({ title }) => title)).toEqual(["Current song", "Older song", "Live uitzending", "Last song"]);
    expect(songs[0]).toMatchObject({
      title: "Current song",
      artist: "Artist",
      ID: "artist-current-song",
      url: "https://example.test/current.jpg",
    });
    expect(songs[1].url).toBe("https://example.test/older.jpg");
    expect(songs[3].url).toBe("");
    expect(songs[0].date).toBe(Date.now() - 30);
  });

  it("handles missing history covers and special station metadata", async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        nowplaying: "No separator",
        coverart: "",
        trackhistory: ["unknown - moritz gimsa"],
      },
    });
    const songs = await fetchSongs();
    expect(songs[0].title).toBe("No separator");
    expect(songs[0].artist).toBe("Carnaval-Radio.nl");
    expect(songs[1]).toMatchObject({
      title: "Carnaval-Radio.nl",
      artist: "Carnaval-Radio.nl",
    });
  });

  it("preserves ambiguous now-playing strings", async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { nowplaying: "One - Two - Three", coverart: "", trackhistory: [] },
    });
    expect((await fetchSongs())[0].title).toBe("One - Two - Three");
  });

  it("logs radio failures and preserves the existing empty-history fallback", async () => {
    const error = new Error("Radio unavailable");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(axios.get).mockRejectedValue(error);
    expect(await fetchSongs()).toEqual([]);
    expect(log).toHaveBeenCalledWith("Failed to fetch songs:", error);
  });
});
