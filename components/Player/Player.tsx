"use client";
import React, { useState, useEffect, useRef } from "react";
import PlayerControls from "./PlayerControls";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { client } from "@/GlobalState/ApiCalls/api.config";
import { GET_STREAM_DATA } from "@/GlobalState/ApiCalls/graphql/stream_queries";
import { setsSongTitle } from "@/GlobalState/features/PlayerSlice";
import { GlobalState } from "@/GlobalState/GlobalState";
import { Track } from "@/types/trackTypes";

const Player = () => {
  const dispatch = useDispatch();
  const { isPlaying, muted } = useSelector(
    (state: GlobalState) => state.Player
  );
  const [trackUrl, setTrackUrl] = useState("");
  const unknownSong = "Carnaval-Radio.nl";
  const unknownArtist = "Carnaval-Radio.nl";

  const [currentTrack, setCurrentTrack] = useState<Track>({
    title: unknownSong,
    artist: unknownArtist,
    imageurl: "",
  });
  const audioElem = useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = useState(true);

  const fetchStream = async () => {
    try {
      const { data } = await client.query({
        query: GET_STREAM_DATA,
      });

      const streamLink = data?.streams?.data?.[0]?.attributes?.Link;

      setTrackUrl(streamLink || process.env.NEXT_PUBLIC_STREAM_FALLBACK);
    } catch (error) {
      console.error("Failed to fetch stream:", error);
    }
  };

  const updateTrackInfo = () => {
    if (currentTrack.artist === "Unknown") {
      setCurrentTrack({ ...currentTrack, artist: unknownArtist });
    }
    if (currentTrack.title === "Unknown") {
      setCurrentTrack({ ...currentTrack, title: unknownSong });
    }
  };

  const fetchTrackData = async () => {
    try {
      const response = await axios.get(
        "https://ams1.reliastream.com/rpc/scarna00/streaminfo.get"
      );
      setCurrentTrack(response.data.data[0].track);
      dispatch(setsSongTitle(response.data.data[0].track.title));
      setLoading(false);
    } catch (error) {
      setCurrentTrack({
        title: 'Veer hubbe un issue',
        artist: unknownArtist,
        imageurl: "https://res.cloudinary.com/dwzn0q9wj/image/upload/c_thumb,w_200,g_face/v1672311200/logo_square_512_1_78657ec246.png"
      });
      dispatch(setsSongTitle("Veer hubbe un issue"));
      console.error("Failed to fetch track data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStream();
    fetchTrackData();
    const interval = setInterval(fetchTrackData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioElem.current?.play().catch((error) => {
        console.error("Failed to play audio:", error);
      });
    } else {
      audioElem.current?.pause();
    }
  });

  if (audioElem.current) {
    audioElem.current.onplay = () => {
      fetchTrackData();
      currentTrack && updateTrackInfo();
    };
  }

  currentTrack && updateTrackInfo();

  return (
    <div className="z-[1000] bg-gradient-to-r from-activeTab to-secondayShade_1 w-full h-fit fixed bottom-0 px-4 sm:px-4 md:px-20 lg-px-24 xl:px-24 py-2 sm:py-2 md:py-3 lg:py-3 xl:py-3">
      {trackUrl && (
        <>
          <audio src={trackUrl} ref={audioElem} muted={muted} />
        </>
      )}
      <PlayerControls
        trackUrl={trackUrl}
        audioElem={audioElem}
        currentTrack={currentTrack}
        loading={loading}
      />
    </div>
  );
};

export default Player;
