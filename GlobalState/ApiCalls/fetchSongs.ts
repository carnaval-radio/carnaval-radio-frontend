import axios from "axios";

export interface Song {
  artist: string;
  title: string;
}

export interface RecentSong extends Song {
  date: number | null; // Unix timestamp in milliseconds or null if not available
  url: string;
}

export interface RecentSongWithID extends RecentSong {
  ID: string;
}

const SONGS_URL = "https://s20.reliastream.com:2020/json/stream/8010";

export async function fetchSongs(): Promise<RecentSong[]> {
  try {
    const response = await axios.get(SONGS_URL);
    let previousSongNameContainsLive = false;

    const modifiedTracks: RecentSong[] = response.data.trackhistory.map((item: string, index: number) => {
      if(previousSongNameContainsLive) {
        previousSongNameContainsLive = false;
        return null;
      }

      previousSongNameContainsLive = item.toLowerCase().includes("live") && item.toLowerCase().includes("uitzending");

      const song = splitTitle(item);
      return {
        ...enrichTitle(song),
        date: null, // the new endpoint does not provide a date, leave as null
        url: enrichCover(response.data.covers?.[index] || "", song),
      };
    });

    return modifiedTracks.filter((song) => song !== null);
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return [];
  }
}

export function splitTitle(title: string) {
  const parts = title.split(" - ");
  return parts.length === 2 ? { artist: parts[0], title: parts[1] } : { artist: "Unknown", title };
}

const DefaultCarnavalRadio = "Carnaval-Radio.nl";
const SpecialCases = ["unknown", "moritz gimsa"];
const CRLogo = "https://res.cloudinary.com/dwzn0q9wj/image/upload/c_scale,h_100,w_100/f_webp/logo_square_512_1_78657ec246.jpg";


function enrichTitle(song: Song) {
  const artist = specialCasesContains(song.artist) ? DefaultCarnavalRadio : song.artist;
  const title = specialCasesContains(song.title) ? DefaultCarnavalRadio : song.title;

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
  if(specialCasesContains(song.artist)) {
    return CRLogo;
  }

  if (song.artist === DefaultCarnavalRadio && coverUrl.includes("nocover.png")) {
    return CRLogo;
  }

  return coverUrl;
}
