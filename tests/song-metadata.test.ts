import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  enrichCover,
  estimatePlayTimes,
  fetchSongs,
  fetchRadioSongs,
  fetchNowPlaying,
  generateCustomSongId,
  getSongDuration,
  normalizeString,
  splitTitle,
} from "@/GlobalState/ApiCalls/fetchSongs";
import { getRadioSource } from "@/data/radioConfig";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "reliastream");
  vi.stubEnv("NEXT_PUBLIC_RADIO_SONGS_URL", "");
  vi.stubEnv("NEXT_PUBLIC_RADIO_NOW_PLAYING_URL", "");
  vi.useFakeTimers();
  vi.setSystemTime("2026-11-08T09:11:00Z");
});

describe("song metadata", () => {
  it.each([
    "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/5d/2b/c0/5d2bc0d7-53cc-cf7b-b400-e7c8742fa5d6/artwork.jpg/100x100bb.jpg",
    "https://is5-ssl.mzstatic.com/image/thumb/Music221/v4/5d/2b/c0/5d2bc0d7-53cc-cf7b-b400-e7c8742fa5d6/artwork.jpg/600x600bb.webp?quality=80",
    String.raw`https:\/\/is1-ssl.mzstatic.com\/image\/thumb\/Music221\/v4\/5d\/2b\/c0\/5d2bc0d7-53cc-cf7b-b400-e7c8742fa5d6\/artwork.jpg\/100x100bb.jpg`,
    "https://is1-ssl.mzstatic.com/image/thumb/5D2BC0D7-53CC-CF7B-B400-E7C8742FA5D6/artwork.jpg",
  ])("replaces known unknown artwork regardless of URL variants: %s", (url) => {
    const song = { artist: "Artist", title: "Song" };
    expect(enrichCover(url, song)).toBe(enrichCover("", { ...song, title: "Live uitzending" }));
  });

  it("does not replace unrelated Apple artwork", () => {
    const url = "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/5d/2b/c0/5d2bc0d7-53cc-cf7b-b400-e7c8742fa5d7/artwork.jpg/100x100bb.jpg";
    expect(enrichCover(url, { artist: "Artist", title: "Song" })).toBe(url);
  });

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
  it("uses the dedicated Centova current track, structured names and actual start time", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "coophosting");
    vi.mocked(axios.get).mockResolvedValue({
      data: { type: "result", data: [{
        offline: false,
        song: "Do not split this fallback",
        track: {
          artist: "Artist - Duo", title: "Current - Part Two",
          started: 1794384996, imageurl: "https://example.test/current.jpg",
        },
      }] },
    });
    expect(await fetchNowPlaying()).toEqual({
      artist: "Artist - Duo", title: "Current - Part Two",
      ID: "artist-duo-current-part-two", date: 1794384996000,
      url: "https://example.test/current.jpg",
    });
    expect(axios.get).toHaveBeenCalledExactlyOnceWith(
      "https://server1.coophosting.nl:2199/rpc/novanani/streaminfo.get",
      { timeout: 10000, params: { _: Math.floor(Date.now() / 30000) } },
    );
    vi.setSystemTime(Date.now() + 30000);
    await fetchNowPlaying();
    expect(axios.get).toHaveBeenLastCalledWith(
      getRadioSource().nowPlayingUrl,
      { timeout: 10000, params: { _: Math.floor(Date.now() / 30000) } },
    );
  });

  it("allows missing current-track art and start time without estimating a timestamp", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "coophosting");
    vi.mocked(axios.get).mockResolvedValue({
      data: { type: "result", data: [{ track: { artist: "", title: "Song" } }] },
    });
    const song = await fetchNowPlaying();
    expect(song).toMatchObject({ title: "Song", artist: "Carnaval-Radio.nl", date: null });
    expect(song.url).toContain("cloudinary.com");
  });

  it.each([
    { type: "error", data: [] },
    { type: "result" },
    { type: "result", data: [] },
    { type: "result", data: [{ offline: true }] },
    { type: "result", data: [{ track: { artist: "Artist", title: "" } }] },
    { type: "result", data: [{ track: { title: "Song" } }] },
  ])("rejects unavailable Centova current-track responses: %j", async (data) => {
    vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "coophosting");
    vi.mocked(axios.get).mockResolvedValue({ data });
    await expect(fetchNowPlaying()).rejects.toThrow("Centova Cast returned no current track");
  });

  it("keeps ReliaStream now-playing behavior and supports a separate endpoint override", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADIO_NOW_PLAYING_URL", "https://example.test/current");
    vi.mocked(axios.get).mockResolvedValue({
      data: { nowplaying: "Artist - Current song", coverart: "", trackhistory: [] },
    });
    expect(await fetchNowPlaying()).toMatchObject({ artist: "Artist", title: "Current song" });
    expect(axios.get).toHaveBeenCalledWith("https://example.test/current", { timeout: 10000 });
  });

  it("defaults to the paired temporary stream and feed without a CMS override", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "");
    vi.stubEnv("NEXT_PUBLIC_RADIO_STREAM_URL", "");
    expect(getRadioSource()).toEqual({
      provider: "coophosting",
      streamUrl: "https://server1.coophosting.nl/proxy/novanani/stream",
      songsUrl: "https://server1.coophosting.nl:2199/recentfeed/novanani/json/",
      nowPlayingUrl: "https://server1.coophosting.nl:2199/rpc/novanani/streaminfo.get",
      useCmsStream: false,
    });
    vi.mocked(axios.get).mockResolvedValue({
      data: { items: [
        { title: "Bjorn Mieke - Nog Efkes", date: 1794380825, enclosure: { url: "https://example.test/cover.jpg" } },
        { title: "Artist - Song - Part Two", date: 1794380591 },
      ] },
    });
    const songs = await fetchRadioSongs();
    expect(axios.get).toHaveBeenCalledWith(getRadioSource().songsUrl, {
      timeout: 10000, params: { _: Math.floor(Date.now() / 30000) },
    });
    expect(songs[0]).toEqual({
      artist: "Bjorn Mieke", title: "Nog Efkes", ID: "bjorn-mieke-nog-efkes",
      date: 1794380825000, url: "https://example.test/cover.jpg",
    });
    expect(songs[1]).toMatchObject({ artist: "Artist", title: "Song - Part Two" });
    expect(songs[1].url).toContain("cloudinary.com");
  });

  it("supports provider switching and explicit endpoint overrides", () => {
    vi.stubEnv("NEXT_PUBLIC_RADIO_STREAM_URL", "");
    expect(getRadioSource().useCmsStream).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_RADIO_STREAM_URL", "https://example.test/stream");
    vi.stubEnv("NEXT_PUBLIC_RADIO_SONGS_URL", "https://example.test/songs");
    expect(getRadioSource()).toMatchObject({
      streamUrl: "https://example.test/stream",
      songsUrl: "https://example.test/songs",
      useCmsStream: false,
    });
    vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "invalid");
    expect(() => getRadioSource()).toThrow("Unsupported radio provider");
  });

  it.each([
    {},
    { items: [] },
    { items: [{ title: "Song", date: "invalid" }] },
    { items: [{ title: "", date: 1794380825 }] },
  ])("surfaces invalid Centova metadata to the player: %j", async (data) => {
    vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "coophosting");
    vi.mocked(axios.get).mockResolvedValue({ data });
    await expect(fetchRadioSongs()).rejects.toThrow("Centova Cast returned");
  });

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
