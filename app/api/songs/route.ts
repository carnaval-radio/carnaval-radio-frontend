import { fetchSongs, RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

export async function GET() {
  const mostRecentSongs = await fetchSongs();

  saveSongsToFileSystem(mostRecentSongs)
    .then(() => {
      console.log("Song list ensured");
    })
    .catch((error) => {
      console.error("Error ensuring song list:", error);
    });

  return NextResponse.json(mostRecentSongs);
}

async function saveSongsToFileSystem(songs: RecentSong[]) {
    await ensureSongFiles(songs);
    await ensureSongList(songs);
}

async function ensureSongList(songs: RecentSong[]) {
    const DATA_PATH = path.join(process.cwd(), "data", "songs", "latest-songs.json");
    let existingSongs = [];
    if (fs.existsSync(DATA_PATH)) {
        const fileContent = fs.readFileSync(DATA_PATH, "utf-8");
        existingSongs = JSON.parse(fileContent).modifiedTracks || [];
    }

    const existingSongIDs = new Set(existingSongs.map((song: RecentSong) => getSongID(song)));
    const newSongs = songs.filter((song) => !existingSongIDs.has(getSongID(song)));
    const updatedTracks = [...existingSongs, ...newSongs.map((song) => ({ ...song, ID: getSongID(song) }))];
    
    fs.writeFileSync(
        DATA_PATH,
        JSON.stringify({ modifiedTracks: updatedTracks }, null, 2)
    );
}

async function ensureSongFiles(songs: RecentSong[]) {
  const songsDir = path.join(process.cwd(), "data", "songs");

  if (!fs.existsSync(songsDir)) {
    fs.mkdirSync(songsDir, { recursive: true });
  }

  songs.forEach((song) => {
    const songID = getSongID(song);
    const fileName = `${songID}.json`;
    const filePath = path.join(songsDir, fileName);

    if (!fs.existsSync(filePath)) {
      const defaultContent = {
        ID: songID,
        ...song,
        comments: [],
        lyrics: "",
        youtube: "",
      };
      fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
    }
  });
}

function getSongID(song: RecentSong) {
  return normalizeString(`${song.artist}-${song.title}`);
}

function normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize("NFD") // Decompose characters like é to e + accent
      .replace(/[^a-z0-9\s,-]/g, "") // Remove non-alphanumeric characters except spaces, commas, and dashes
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/,+/g, "-") // Replace commas with dashes
  }
