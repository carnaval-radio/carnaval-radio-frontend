"use client";

import React, { useEffect, useState } from "react";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";
import { MdComment, MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setPlay, setMuted } from "../../GlobalState/features/PlayerSlice";
import { GlobalState } from "@/GlobalState/GlobalState";
import { Track } from "@/types/trackTypes";
import ImageWithFallback from "../constants/ImageWithFallback";
import PlayerFavoriteButton from "./PlayerFavoriteButton";
import RemotePlaybackButton from "./RemotePlaybackButton";
import { RemotePlaybackType } from "./useRemotePlayback";
import SongCommentsModal from "../Comments/SongCommentsModal";
import MobilePlayer from "./MobilePlayer";

interface Props {
  currentTrack: Track;
  audioElem: React.RefObject<HTMLAudioElement>;
  loading: boolean;
  trackUrl: string;
  playbackType: RemotePlaybackType;
  isRemoteAvailable: boolean;
  isRemoteCasting: boolean;
  isConnecting: boolean;
  onRemoteClick: () => void;
  onPlayPauseClick?: () => void;
  customSongId?: string;
}

const PlayerControls = ({
  currentTrack,
  audioElem,
  loading,
  trackUrl,
  playbackType,
  isRemoteAvailable,
  isRemoteCasting,
  isConnecting,
  onRemoteClick,
  onPlayPauseClick,
  customSongId,
}: Props) => {
  const dispatch = useDispatch();
  const { isPlaying, muted, remotePlayerState } = useSelector(
    (state: GlobalState) => state.Player
  );

  const [volume, setVolume] = useState(30);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);

  // Determine if we should show playing state based on remote or local
  const isCurrentlyPlaying = isRemoteCasting 
    ? remotePlayerState === "PLAYING" 
    : isPlaying;

  // Handle play/pause click
  const handlePlayPause = () => {
    if (onPlayPauseClick) {
      onPlayPauseClick();
    } else {
      dispatch(setPlay());
    }
  };

  useEffect(() => {
    if (trackUrl && audioElem.current) {
      audioElem.current.volume = volume / 100;
      audioElem.current.muted = muted;
    }
  }, [volume, muted, trackUrl, audioElem]);
  return (
    <>
      <MobilePlayer
        track={currentTrack}
        loading={loading}
        playing={isCurrentlyPlaying}
        muted={muted}
        customSongId={customSongId}
        onPlayPause={handlePlayPause}
        onMute={() => dispatch(setMuted())}
        onComments={() => setCommentsModalOpen(true)}
        playbackType={playbackType}
        isRemoteAvailable={isRemoteAvailable}
        isRemoteCasting={isRemoteCasting}
        isConnecting={isConnecting}
        onRemoteClick={onRemoteClick}
      />
    <div aria-label="Desktopspeler" className="mx-auto hidden w-full max-w-7xl items-center gap-3 sm:flex lg:gap-5">
        <button
          type="button"
          aria-label={isCurrentlyPlaying ? "Pauzeren" : "Afspelen"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={handlePlayPause}
        >
          {isCurrentlyPlaying ? (
            <BsFillPauseFill size={30} />
          ) : (
            <BsFillPlayFill size={30} />
          )}
        </button>
        <div className="min-w-0 flex-1 py-1" aria-live="polite">
        {!loading ? (
          <>
            <p className="break-words text-lg font-semibold leading-snug text-gray-900 lg:text-xl">
              {currentTrack.title}
            </p>
            <p className="mt-0.5 break-words text-sm leading-snug text-gray-600">{currentTrack.artist}</p>
          </>
        ) : (
          <div role="status" aria-label="Nummer laden" className="space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-white" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white" />
          </div>
        )}
        </div>
        <div className="flex shrink-0 items-center gap-1 lg:gap-2">
          {customSongId && !loading && (
            <>
              <PlayerFavoriteButton customSongId={customSongId} title={currentTrack.title} />
              <button type="button" onClick={() => setCommentsModalOpen(true)} className="flex h-11 items-center gap-2 rounded-full px-3 text-gray-600 transition-colors hover:bg-white/60 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Reacties: ${currentTrack.title}`}>
                <MdComment size={22} /><span className="hidden text-sm font-medium xl:inline">Reageren</span>
              </button>
            </>
          )}
          <div className="flex items-center gap-1 border-l border-gray-400/20 pl-2 lg:pl-4">
            <button type="button" onClick={() => dispatch(setMuted())} aria-label={muted ? "Geluid aan" : "Geluid uit"} aria-pressed={muted} className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              {muted ? <MdVolumeOff size={24} /> : <MdVolumeUp size={24} />}
            </button>
            <input
              aria-label="Volume"
              className="h-11 w-16 cursor-pointer accent-primary lg:w-24 xl:w-28"
              type="range"
              min={0}
              max={100}
              step={0.02}
              value={volume}
              onChange={(event) => {
                setVolume(event.target.valueAsNumber);
              }}
            />
          </div>
          <RemotePlaybackButton
            playbackType={playbackType}
            isRemoteAvailable={isRemoteAvailable}
            isRemoteCasting={isRemoteCasting}
            isConnecting={isConnecting}
            onRemoteClick={onRemoteClick}
            className="h-11 w-11 rounded-full text-gray-600 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          />
        </div>
        {loading ? <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-white lg:h-14 lg:w-14" /> : (
          <ImageWithFallback src={currentTrack.imageurl || "/logo.png"} fallbackSrc="/logo.png" alt={`Albumhoes: ${currentTrack.artist}`} className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-sm lg:h-14 lg:w-14" />
        )}
    </div>
      {/* Comments Modal */}
      {customSongId && commentsModalOpen && (
        <SongCommentsModal
          customSongId={customSongId}
          songTitle={currentTrack.title}
          songArtist={currentTrack.artist}
          isOpen={commentsModalOpen}
          onClose={() => setCommentsModalOpen(false)}
        />
      )}
    </>
  );
};

export default PlayerControls;
