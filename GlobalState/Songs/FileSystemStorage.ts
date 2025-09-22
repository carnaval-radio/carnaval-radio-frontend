import fs from "fs";
import path from "path";
import { RecentSong, RecentSongWithID } from "../ApiCalls/fetchSongs";
import { IStorage } from "../Storage";

export class FileSystemStorage implements IStorage {
    private readonly songsDir: string;
  
    constructor() {
      this.songsDir = path.join(process.cwd(), "data", "songs");
    }
  
    async saveSongs(songs: RecentSongWithID[]): Promise<void> {
      await this.ensureSongFiles(songs);
      await this.ensureSongList(songs);
    }
  
    async loadSongs(limit: number = 10): Promise<RecentSongWithID[]> {
      const DATA_PATH = path.join(this.songsDir, "latest-songs.json");
      if (fs.existsSync(DATA_PATH)) {
        const fileContent = fs.readFileSync(DATA_PATH, "utf-8");
        const data = JSON.parse(fileContent);
        return data.modifiedTracks || [];
      }
      return [];
    }
  
    private async ensureSongFiles(songs: RecentSongWithID[]): Promise<void> {
      if (!fs.existsSync(this.songsDir)) {
        fs.mkdirSync(this.songsDir, { recursive: true });
      }
  
      songs.forEach((song) => {
        const fileName = `${song.ID}.json`;
        const filePath = path.join(this.songsDir, fileName);
  
        if (!fs.existsSync(filePath)) {
          const defaultContent = {
            ...song,
            comments: [],
            lyrics: "",
            youtube: "",
          };
          fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
        }
      });
    }

    async loadCurrentSong(): Promise<RecentSongWithID | null> {
        const songs = await this.loadSongs(1);
        return songs.length > 0 ? songs[0] : null
    }

    private async ensureSongList(songs: RecentSongWithID[]): Promise<void> {
      const DATA_PATH = path.join(this.songsDir, "latest-songs.json");
      let existingSongs = await this.loadSongs(10);

      const existingSongIDs = new Set(existingSongs.map((song: RecentSongWithID) => song.ID));
      const newSongs = songs.filter((song) => !existingSongIDs.has(song.ID));
      const updatedTracks = [...existingSongs, ...newSongs];
  
      fs.writeFileSync(DATA_PATH, JSON.stringify({ modifiedTracks: updatedTracks }, null, 2));
    }
  }