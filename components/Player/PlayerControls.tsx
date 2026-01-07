"use client";

import React, { useEffect, useState } from "react";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";
import { GiSpeaker, GiSpeakerOff } from "react-icons//gi";
import { MdComment } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setPlay, setMuted } from "../../GlobalState/features/PlayerSlice";
import { GlobalState } from "@/GlobalState/GlobalState";
import { Track } from "@/types/trackTypes";
import SongCover from "../SongCover";
import FormateTitle from "../FormatTitle";
import RemotePlaybackButton from "./RemotePlaybackButton";
import { RemotePlaybackType } from "./useRemotePlayback";
import SongCommentsModal from "../Comments/SongCommentsModal";

interface Props {
  currentTrack: Track;
  audioElem: any;
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

  const [showVolume, setShowVolume] = useState(false);
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
    if (trackUrl) {
      audioElem.current.volume = volume / 100;
      audioElem.current.mute = muted;
    }
  }, [volume, muted]);
  return (
    <div className="flex sm:flex-row md:flex-row lg:flex-row xl:flex-row items-start sm:items-center gap-[2px] sm:gap-8 md:gap-8 lg:gap-8 xl:gap-8 justify-between sm:justify-start md:justify-start lg:justify-start xl:justify-start">
      <div className="flex items-center gap-2 sm:gap-8 md:gap-8 lg:gap-8 xl:gap-8">
        {!loading ? (
          <div className="hidden sm:block md:block lg:block xl:block">
            <SongCover
              url={currentTrack.imageurl}
              artist={currentTrack.artist}
            />
          </div>
        ) : (
          <div className="hidden sm:block md:block lg:block xl:block h-14 w-14 rounded-md animate-pulse bg-white"></div>
        )}
        <div
          className="flex sm:hidden md:hidden lg:hidden xl:hidden items-center justify-center p-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white cursor-pointer"
          onClick={handlePlayPause}
        >
          {isCurrentlyPlaying ? (
            <BsFillPauseFill size={35} className="h-7 w-7" />
          ) : (
            <BsFillPlayFill size={35} className="h-7 w-7" />
          )}
        </div>
        <>
          {!loading ? (
            <div className="flex items-start flex-col sm:hidden md::hidden lg:hidden xl:hidden">
              <h2
                className={`text-lg font-semibold uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary`}
              >
                <FormateTitle text={currentTrack.title} />
              </h2>
              <div className="text-xs">
                <FormateTitle text={currentTrack.artist} />
              </div>
            </div>
          ) : (
            <div className="flex items-start flex-col gap-1 sm:hidden md::hidden lg:hidden xl:hidden">
              <span className="p-2 h-3 w-24 bg-white rounded-lg"></span>
              <span className="p-2 h-2 w-20 bg-white rounded-lg"></span>
            </div>
          )}
        </>
        <div
          className={`hidden sm:flex md::flex lg:flex xl:flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white cursor-pointer`}
          onClick={handlePlayPause}
        >
          {isCurrentlyPlaying ? (
            <BsFillPauseFill size={35} />
          ) : (
            <BsFillPlayFill size={35} />
          )}
        </div>
      </div>
      <div className="flex gap-4 items-end">
        {!loading ? (
          <div className="hidden items-start flex-col sm:flex md::flex lg:flex xl:flex">
            <h2 className="text-2xl font-bold  uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {currentTrack.title}
            </h2>
            <p className="text-xs">{currentTrack.artist}</p>
          </div>
        ) : (
          <div className="hidden items-start flex-col gap-1 sm:flex md::flex lg:flex xl:flex">
            <span className="p-2 h-6 w-24 bg-white rounded-md"></span>
            <span className="p-2 h-4 w-20 bg-white rounded-md"></span>
          </div>
        )}
        <div className="hidden sm:flex md::flex lg:flex xl:flex items-center gap-8">
          <div className="flex items-center">
            {muted ? (
              <GiSpeakerOff
                onClick={() => dispatch(setMuted())}
                onMouseMove={() => setShowVolume(!showVolume)}
                className="text-2xl text-playerControls cursor-pointer"
              />
            ) : (
              <GiSpeaker
                onClick={() => dispatch(setMuted())}
                onMouseMove={() => setShowVolume(!showVolume)}
                className="text-2xl text-playerControls cursor-pointer"
              />
            )}
            <input
              className="cursor-pointer"
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
            className="text-playerControls"
          />
          {customSongId && (
            <button
              onClick={() => setCommentsModalOpen(true)}
              className="text-playerControls hover:text-primary transition-colors"
              aria-label="Comments"
            >
              <MdComment size={24} />
            </button>
          )}
        </div>
      </div>

      {/* for mobile view */}
      <div className="flex items-center gap-4 sm:hidden md::hidden lg:hidden xl:hidden">
        {/* progress track and sound for mobile */}
        {muted ? (
          <GiSpeakerOff
            onClick={() => dispatch(setMuted())}
            onMouseMove={() => setShowVolume(!showVolume)}
            className="text-4xl text-playerControls cursor-pointer"
          />
        ) : (
          <GiSpeaker
            onClick={() => dispatch(setMuted())}
            onMouseMove={() => setShowVolume(!showVolume)}
            className="text-4xl text-playerControls cursor-pointer"
          />
        )}
        {customSongId && (
          <button
            onClick={() => setCommentsModalOpen(true)}
            className="text-playerControls hover:text-primary transition-colors"
            aria-label="Comments"
          >
            <MdComment size={28} />
          </button>
        )}
        {!loading ? (
          <SongCover
            url={currentTrack.imageurl}
            artist={currentTrack.artist}
            type="hero"
          />
        ) : (
          <div className="inline-block sm:hidden md:hidden lg:hidden xl:hidden h-14 w-14 rounded-md animate-pulse bg-white"></div>
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
    </div>
  );
};

export default PlayerControls;
