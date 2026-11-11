"use client";
import React, { useState, useEffect, useRef } from "react";
import PlayerControls from "./PlayerControls";
import { useDispatch, useSelector } from "react-redux";
import { client } from "@/GlobalState/ApiCalls/api.config";
import { GET_STREAM_DATA } from "@/GlobalState/ApiCalls/graphql/stream_queries";
import { setsSongTitle, setPlay } from "@/GlobalState/features/PlayerSlice";
import { GlobalState } from "@/GlobalState/GlobalState";
import { Track } from "@/types/trackTypes";
import { useRemotePlayback } from "./useRemotePlayback";
import { setCastClickHandler } from "../MobileChromecast";
import { fetchNowPlaying, generateCustomSongId } from "@/GlobalState/ApiCalls/fetchSongs";
import { getRadioSource } from "@/data/radioConfig";

const Player = () => {
  const dispatch = useDispatch();
  const { isPlaying, muted } = useSelector(
    (state: GlobalState) => state.Player
  );
  const [trackUrl, setTrackUrl] = useState(() => getRadioSource().streamUrl);
  const unknownSong = "Carnaval-Radio.nl";
  const unknownArtist = "Carnaval-Radio.nl";

  const [currentTrack, setCurrentTrack] = useState<Track>({
    title: unknownSong,
    artist: unknownArtist,
    imageurl: "",
  });
  const audioElem = useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const updateHeight = () => {
      document.documentElement.style.setProperty("--player-height", `${bar.getBoundingClientRect().height}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--player-height");
    };
  }, []);

  // Initialize Remote Playback (Chromecast or AirPlay depending on platform)
  const {
    playbackType,
    isRemoteAvailable,
    isRemoteCasting,
    isConnecting,
    remotePlayerState,
    startRemotePlayback,
    stopRemotePlayback,
    togglePlayPause,
  } = useRemotePlayback({
    trackUrl,
    currentTrack,
    isPlaying,
    audioRef: audioElem,
    onRemoteStateChange: (remoteCasting) => {
      // Pause local audio when remote casting starts
      if (remoteCasting && audioElem.current) {
        audioElem.current.pause();
      }
      // When remote casting stops, pause local playback and update UI state
      else if (!remoteCasting) {
        if (audioElem.current) {
          audioElem.current.pause();
        }
        // Only toggle if currently showing as playing
        if (isPlaying) {
          dispatch(setPlay());
        }
      }
    },
  });

  // Set remote playback click handler for mobile header
  useEffect(() => {
    setCastClickHandler(() => {
      if (isRemoteCasting) {
        stopRemotePlayback();
      } else {
        startRemotePlayback();
      }
    });
  }, [isRemoteCasting, startRemotePlayback, stopRemotePlayback]);

  const fetchStream = async () => {
    const source = getRadioSource();
    if (!source.useCmsStream) return;
    try {
      const { data } = await client.query({
        query: GET_STREAM_DATA,
      });

      const streamLink = data?.streams?.data?.[0]?.attributes?.Link;

      setTrackUrl(streamLink || source.streamUrl);
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
      const song = await fetchNowPlaying();
      const { artist, title, url: coverArt } = song;

      setCurrentTrack({
        title,
        artist,
        imageurl: coverArt,
      });

      dispatch(setsSongTitle(title));
      setLoading(false);
    } catch (error) {
      const problemSongname = "Tijdelijk minder bereikbaar. Er is een probleem bij onze streamingprovider. We werken aan een oplossing.";
      setCurrentTrack({
        title: problemSongname,
        artist: unknownArtist,
        imageurl:
          "https://res.cloudinary.com/dwzn0q9wj/image/upload/c_thumb,w_200,g_face/v1672311200/logo_square_512_1_78657ec246.png",
      });
      dispatch(setsSongTitle(problemSongname));
      console.error("Failed to fetch track data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStream();
    fetchTrackData();
    // Direct client-side calls to external API - doesn't consume Vercel credits
    const interval = setInterval(fetchTrackData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // When remote casting, control the remote device instead of local audio
    if (isRemoteCasting) {
      // Don't control local audio when remote casting
      return;
    }
    
    // Normal local playback control
    if (isPlaying) {
      if (audioElem.current) {
        audioElem.current.play().catch((error) => {
          console.error("Failed to play audio:", error);
        });
      }
    } else {
      audioElem.current?.pause();
    }
  }, [isPlaying, isRemoteCasting, trackUrl]);

  if (audioElem.current) {
    audioElem.current.onplay = () => {
      fetchTrackData();
      currentTrack && updateTrackInfo();
    };
  }

  currentTrack && updateTrackInfo();

  // Generate customSongId for comments
  const customSongId = currentTrack.artist && currentTrack.title && 
    currentTrack.artist !== unknownArtist && currentTrack.title !== unknownSong
    ? generateCustomSongId(currentTrack.artist, currentTrack.title)
    : undefined;

  return (
    <div ref={barRef} className="z-[1000] bg-gradient-to-r from-activeTab to-secondaryShade_1 h-fit fixed inset-x-0 md:left-1/4 lg:left-[20%] xl:left-[16.666667%] bottom-0 border-t border-white/60 px-3 sm:px-6 lg:px-10 pt-2 sm:pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {trackUrl && (
        <>
          <audio src={trackUrl} ref={audioElem} muted={muted} preload="none" />
        </>
      )}
      <PlayerControls
        trackUrl={trackUrl}
        audioElem={audioElem}
        currentTrack={currentTrack}
        loading={loading}
        playbackType={playbackType}
        isRemoteAvailable={isRemoteAvailable}
        isRemoteCasting={isRemoteCasting}
        isConnecting={isConnecting}
        customSongId={customSongId}
        onRemoteClick={() => {
          if (isRemoteCasting) {
            stopRemotePlayback();
          } else {
            startRemotePlayback();
          }
        }}
        onPlayPauseClick={() => {
          if (isRemoteCasting) {
            // When remote casting, directly control remote device
            togglePlayPause();
          } else {
            // When not remote casting, toggle local playback
            dispatch(setPlay());
          }
        }}
      />
    </div>
  );
};

export default Player;
