import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  enrichCover,
  estimatePlayTimes,
  fetchSongs,
  fetchRadioSongs,
  fetchNowPlaying,
  isUnknownCover,
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
    "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bc/c8/4e/bcc84e1f-94f8-b2d2-7681-bfdf4a89bf8d/191018969653.jpg/100x100bb.jpg",
    "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/01/4b/20/014b20d1-949e-445a-d93f-a74e37a743e9/5063212375033_cover.jpg/100x100bb.jpg",
    "http://localhost:3000/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic113%2Fv4%2F01%2F4b%2F20%2F014b20d1-949e-445a-d93f-a74e37a743e9%2F5063212375033_cover.jpg%2F100x100bb.jpg&w=256&q=75",
    "http://localhost:3000/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic115%2Fv4%2Fbc%2Fc8%2F4e%2Fbcc84e1f-94f8-b2d2-7681-bfdf4a89bf8d%2F191018969653.jpg%2F100x100bb.jpg&w=256&q=75",
    "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/5d/2b/c0/5d2bc0d7-53cc-cf7b-b400-e7c8742fa5d6/artwork.jpg/100x100bb.jpg",
    "https://is5-ssl.mzstatic.com/image/thumb/Music221/v4/5d/2b/c0/5d2bc0d7-53cc-cf7b-b400-e7c8742fa5d6/artwork.jpg/600x600bb.webp?quality=80",
    String.raw`https:\/\/is1-ssl.mzstatic.com\/image\/thumb\/Music221\/v4\/5d\/2b\/c0\/5d2bc0d7-53cc-cf7b-b400-e7c8742fa5d6\/artwork.jpg\/100x100bb.jpg`,
    "https://is1-ssl.mzstatic.com/image/thumb/5D2BC0D7-53CC-CF7B-B400-E7C8742FA5D6/artwork.jpg",
    "https://server1.coophosting.nl/static/novanani/covers/nocover.png",
    "https://www.carnaval-radio.nl/_next/image?url=https%3A%2F%2Fserver1.coophosting.nl%2Fstatic%2Fnovanani%2Fcovers%2Fnocover.png&w=128&q=75",
    "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/8e/96/f0/8e96f0c5-404a-896b-d64d-9d5b3eb2de51/artwork.jpg/100x100bb.jpg",
    "https://is5-ssl.mzstatic.com/image/thumb/8E96F0C5-404A-896B-D64D-9D5B3EB2DE51/artwork.jpg/600x600bb.webp",
    "https://www.carnaval-radio.nl/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic221%2Fv4%2F8e%2F96%2Ff0%2F8e96f0c5-404a-896b-d64d-9d5b3eb2de51%2Fartwork.jpg%2F100x100bb.jpg&w=128&q=75",
    "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/86/cb/38/86cb38fe-ad25-6b2f-79b0-c986ae0e4f81/artwork.jpg/100x100bb.jpg",
    "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/3e/56/72/3e567223-256d-b7ae-73bf-5a187117d180/TE00260887.jpg/100x100bb.jpg",
    "http://localhost:3000/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic211%2Fv4%2F86%2Fcb%2F38%2F86cb38fe-ad25-6b2f-79b0-c986ae0e4f81%2Fartwork.jpg%2F100x100bb.jpg&w=256&q=75",
    "http://localhost:3000/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic116%2Fv4%2F3e%2F56%2F72%2F3e567223-256d-b7ae-73bf-5a187117d180%2FTE00260887.jpg%2F100x100bb.jpg&w=256&q=75",
  ])("replaces known unknown artwork regardless of URL variants: %s", (url) => {
    const song = { artist: "Artist", title: "Song" };
    expect(enrichCover(url, song)).toBe(enrichCover("", { ...song, title: "Live uitzending" }));
    expect(isUnknownCover(url)).toBe(true);
  });

  it.each([
    "https://server1.coophosting.nl/static/novanani/covers/rsz_emb_pruuf_mar_urst_ltter_a603da63.jpg",
    "https://is1-ssl.mzstatic.com/image/thumb/Music1/v4/5f/00/f6/5f00f6c4-85e7-0092-04c2-8c7606c8f6bd/Vandaag_001.jpg/100x100bb.jpg",
  ])("preserves confirmed good covers: %s", (url) => {
    expect(isUnknownCover(url)).toBe(false);
    expect(isUnknownCover(`http://localhost:3000/_next/image?url=${encodeURIComponent(url)}&w=256&q=75`)).toBe(false);
    expect(enrichCover(url, { artist: "Artist", title: "Song" })).toBe(url);
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
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { type: "result", data: [{
        offline: false,
        song: "Do not split this fallback",
        track: {
          artist: "Artist - Duo", title: "Current - Part Two",
          started: 1794384996, imageurl: "https://example.test/current.jpg",
        },
      }] },
    }).mockResolvedValue({
      data: { items: [{ title: "Older artist - Older song", date: 1794384800 }] },
    });
    expect(await fetchNowPlaying()).toEqual({
      artist: "Artist - Duo", title: "Current - Part Two",
      ID: "artist-duo-current-part-two", date: 1794384996000,
      url: "https://example.test/current.jpg",
    });
    expect(axios.get).toHaveBeenCalledWith(
      "https://server1.coophosting.nl:2199/rpc/novanani/streaminfo.get",
      { timeout: 10000, params: { _: Math.floor(Date.now() / 30000) } },
    );
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenLastCalledWith(
      getRadioSource().songsUrl,
      { timeout: 10000, params: { _: Math.floor(Date.now() / 30000) } },
    );
  });

  it.each([
    [200, 300, "History song"],
    [300, 200, "Current song"],
    [300, 300, "Current song"],
    [null, 300, "History song"],
  ])("selects freshest Centova track (current=%s, history=%s)", async (started, date, title) => {
    vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "coophosting");
    vi.mocked(axios.get)
      .mockResolvedValueOnce({ data: { type: "result", data: [{
        track: { artist: "Artist", title: "Current song", started },
      }] } })
      .mockResolvedValueOnce({ data: { items: [
        { title: "Artist - Older history", date: 100 },
        { title: "Artist - History song", date },
      ] } });
    const song = await fetchNowPlaying();
    expect(song.title).toBe(title);
    expect(song.date).toBe(Math.max(started ?? 0, date) * 1000);
    expect(song.url).toContain("cloudinary.com");
  });

  it.each(["current", "history"])("uses the other Centova feed when %s fails", async (failed) => {
    vi.stubEnv("NEXT_PUBLIC_RADIO_PROVIDER", "coophosting");
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = new Error("Provider timeout");
    vi.mocked(axios.get).mockImplementation(async (url) => {
      if (url === getRadioSource().nowPlayingUrl) {
        if (failed === "current") throw error;
        return { data: { type: "result", data: [{
          track: { artist: "Artist", title: "Current song", started: 300 },
        }] } };
      }
      if (failed === "history") throw error;
      return { data: { items: [{ title: "Artist - History song", date: 300 }] } };
    });
    expect((await fetchNowPlaying()).title).toBe(failed === "current" ? "History song" : "Current song");
    expect(warning).toHaveBeenCalledWith(expect.any(String), error);
  });

  it("allows missing current-track art and start time without estimating a timestamp", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
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
    vi.spyOn(console, "error").mockImplementation(() => {});
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
    expect(songs[1].url).toBe("");
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
