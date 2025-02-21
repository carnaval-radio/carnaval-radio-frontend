import axios from "axios";

export interface Song {
  ID?: string;
  artist: string;
  title: string;
}

export interface RecentSong extends Song {
  date: number;
  url: string;
}

interface RadioTrackItem {
  title: string;
  link: string;
  description: string;
  date: number;
  enclosure: {
    url: string;
    type: string;
  };
};

const SONGS_URL = "https://ams1.reliastream.com/recentfeed/scarna00/json";

export async function fetchSongs(): Promise<RecentSong[]> {
  try {
    const response = await axios.get(SONGS_URL);
    const modifiedTracks: RecentSong[] = response.data.items.map((item: RadioTrackItem) => {
      const song = splitTitle(item.title);
      return {
        ...enrichTitle(song),
        date: item.date,
        url: enrichCover(item.enclosure.url, song),
      };
    });

    return modifiedTracks;
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
