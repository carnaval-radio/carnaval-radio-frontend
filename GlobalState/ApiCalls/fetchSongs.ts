import axios from "axios";

export interface Song {
  artist: string;
  title: string;
}

export interface RecentSong extends Song {
  ID: string; // custom_song_id
  date: number | null; // Unix timestamp in milliseconds or null if not available
  url: string;
}

/*
EXAMPLE FORMAT FROM RELIASTREAM API:
{
  status: true,
  nowplaying: 'Schintaler - Wat n nach',
  coverart: 'https://is1-ssl.mzstatic.com/image/thumb/Music/6e/1e/70/mzi.rxknwhat.jpg/100x100bb.jpg',
  servername: 'Unspecified name',
  trackhistory: [
    "Sjoenkeldaddy - Sjoenkeldaddy's",
    "Gans D'r Aaf - Pruuf Mar & De Roerdassen",
    'Nonk bob Oet Jamaica - Dat Bin Ich Vergaete',
    "Joaaaa ! - Prinsen Veur 't Leave",
    'Carnaval-Radio Jingle - Fabrizio'
  ],
  covers: [
    'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/27/d9/f5/27d9f574-e1f5-cc6f-ad8a-59027ff918ea/artwork.jpg/100x100bb.jpg',
    'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/13/a8/aa/13a8aab3-8e97-f4b7-526f-704167cae375/859703653873_cover.jpg/100x100bb.jpg',
    'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/08/66/6c/08666c7b-4eb1-6356-225d-68bcf2f797f9/B720001069.jpg/100x100bb.jpg',
    'https://s20.reliastream.com:2020/system/theme/Material/images/defaultCover/black-vinyl-record-playing-on-turntable-1389429.jpg',
    'https://s20.reliastream.com:2020/covers//68d177a99ab10.png'
  ],
  connections: 2,
  bitrate: 128,
  format: { '0': 'audio/aac' }
}
*/
const SONGS_URL = "https://s20.reliastream.com:2020/json/stream/8010";

type ReliaStreamResponse = {
  data: {
    nowplaying: string;
    coverart: string;
    trackhistory: string[];
    covers?: string[];
  };
};

export const EXTERNAL_MAXIMUM_SONG_HISTORY_AMOUNT = 6;

export async function fetchSongs(): Promise<RecentSong[]> {
  try {
    const {
      data: { nowplaying, coverart, trackhistory, covers },
    }: ReliaStreamResponse =
      await axios.get(SONGS_URL);
    let previousSongNameContainsLive = false;

    // Swap title and artist for nowplaying so it matches the trackhistory format
    let firstSong = nowplaying;
    if (nowplaying.includes(" - ")) {
      const parts = firstSong.split(" - ");
      if (parts.length === 2) {
        firstSong = `${parts[1]} - ${parts[0]}`;
      }
    }

    let mergedSongs = [firstSong, ...trackhistory];
    let mergedCovers = [coverart, ...(covers || [])];

    // Calculate play times for all tracks at once
    const playTimes = estimatePlayTimes(mergedSongs, 30);

    const modifiedTracks: (RecentSong | null)[] = mergedSongs.map(
      (item: string, index: number) => {
        if (previousSongNameContainsLive) {
          previousSongNameContainsLive = false;
          return null;
        }

        previousSongNameContainsLive =
          item.toLowerCase().includes("live") &&
          item.toLowerCase().includes("uitzending");

        const song = splitTitle(item);
        const enriched = enrichTitle(song);
        return {
          ...enriched,
          ID: generateCustomSongId(enriched.artist, enriched.title),
          date: playTimes[index], // Use pre-calculated timestamp
          url: enrichCover(mergedCovers?.[index] || "", enriched),
        };
      }
    );

    return modifiedTracks.filter((song): song is RecentSong => song !== null);
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return [];
  }
}

export function splitTitle(title: string) {
  const parts = title.split(" - ");
  // The radio API returns "title - artist"
  return parts.length === 2
    ? { title: parts[0], artist: parts[1] }
    : { artist: "Unknown", title };
}

export function getSongDuration(song: Song): number {
  const AVERAGE_SONG_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds
  const JINGLE_DURATION = 20 * 1000; // 20 seconds for jingles

  const songTitle = song.title?.toLowerCase() || "";
  const artistName = song.artist?.toLowerCase() || "";

  // Check if this is a jingle
  const isJingle =
    songTitle.includes("jingle") || artistName.includes("jingle");

  return isJingle ? JINGLE_DURATION : AVERAGE_SONG_DURATION;
}

export function estimatePlayTimes(trackHistory: string[], offset?: number): number[] {
  const now = Date.now();
  const RECENT_SONG_OFFSET = offset ?? 140 * 1000; // 140 seconds ago for most recent song
  const playTimes: number[] = [];
  let cumulativeTime = 0;
  for (let i = 0; i < trackHistory.length; i++) {
    const song = splitTitle(trackHistory[i]);
    const duration = getSongDuration(song);
    if (i === 0) {
      // Most recent song: use now - 140 seconds
      playTimes.push(now - RECENT_SONG_OFFSET);
      cumulativeTime = RECENT_SONG_OFFSET;
    } else {
      // Older songs: subtract cumulative duration from now
      cumulativeTime += duration;
      playTimes.push(now - cumulativeTime);
    }
  }
  return playTimes;
}

const DefaultCarnavalRadio = "Carnaval-Radio.nl";
const SpecialCases = ["Carnaval Radio", "carnaval.radio", "Carnaval-Radio.nl", "unknown", "moritz gimsa"];
const CRLogo =
  "https://res.cloudinary.com/dwzn0q9wj/image/upload/c_scale,h_100,w_100/f_webp/logo_square_512_1_78657ec246.jpg";

function enrichTitle(song: Song) {
  const artist = specialCasesContains(song.artist)
    ? DefaultCarnavalRadio
    : song.artist;
  const title = specialCasesContains(song.title)
    ? DefaultCarnavalRadio
    : song.title;

  return {
    artist,
    title,
  };
}

function specialCasesContains(text?: string) {
  if (!text) {
    return true;
  }
  return SpecialCases.includes(text.toLocaleLowerCase());
}

function enrichCover(coverUrl: string, song: Song) {
  if (specialCasesContains(song.artist)) {
    return CRLogo;
  }

  if (
    song.artist === DefaultCarnavalRadio &&
    coverUrl.includes("nocover.png")
  ) {
    return CRLogo;
  }

  return coverUrl;
}

// Shared ID generator to ensure custom_song_id is always present client-side
export function generateCustomSongId(artist: string, title: string): string {
  return normalizeString(`${artist}-${title}`);
}

export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s,-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/,+/g, "-")
    .replace(/-+/g, "-");
}
