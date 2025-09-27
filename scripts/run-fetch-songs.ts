import { fetchSongs } from "../GlobalState/ApiCalls/fetchSongs";

async function run() {
  try {
    const songs = await fetchSongs();
    console.log("Fetched songs:", songs);
    // Optionally, print a summary
    console.log(`Total songs fetched: ${songs.length}`);
    if (songs.length > 0) {
      console.log("First song:", songs[0]);
    }
  } catch (err) {
    console.error("Error fetching songs:", err);
  }
}

run();
