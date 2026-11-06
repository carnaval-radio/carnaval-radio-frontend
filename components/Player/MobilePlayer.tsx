"use client";

import { useState } from "react";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdComment, MdClose, MdVolumeOff, MdVolumeUp } from "react-icons/md";
import type { Track } from "@/types/trackTypes";
import PlayerFavoriteButton from "./PlayerFavoriteButton";
import ImageWithFallback from "../constants/ImageWithFallback";
import RemotePlaybackButton from "./RemotePlaybackButton";
import type { RemotePlaybackType } from "./useRemotePlayback";

interface Props {
  track: Track;
  loading: boolean;
  playing: boolean;
  muted: boolean;
  customSongId?: string;
  onPlayPause: () => void;
  onMute: () => void;
  onComments: () => void;
  playbackType: RemotePlaybackType;
  isRemoteAvailable: boolean;
  isRemoteCasting: boolean;
  isConnecting: boolean;
  onRemoteClick: () => void;
}

export default function MobilePlayer({
  track, loading, playing, muted, customSongId, onPlayPause, onMute,
  onComments, playbackType, isRemoteAvailable, isRemoteCasting, isConnecting, onRemoteClick,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="sm:hidden">
      {detailsOpen && (
        <section
          aria-label="Speleropties"
          onKeyDown={(event) => {
            if (event.key === "Escape") setDetailsOpen(false);
          }}
          className="absolute bottom-full left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-gray-700">Speleropties</span>
            <button type="button" aria-label="Speleropties sluiten" onClick={() => setDetailsOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600"><MdClose size={24} /></button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onMute} aria-pressed={muted} className="flex min-h-11 items-center gap-2 rounded-full bg-gray-100 px-4 text-sm">
              {muted ? <MdVolumeOff size={22} /> : <MdVolumeUp size={22} />}
              {muted ? "Geluid aan" : "Geluid uit"}
            </button>
            {customSongId && !loading && (
              <button type="button" onClick={() => { setDetailsOpen(false); onComments(); }} className="flex min-h-11 items-center gap-2 rounded-full bg-secondary/10 px-4 text-sm text-secondary">
                <MdComment size={20} /> Reageren
              </button>
            )}
            <RemotePlaybackButton playbackType={playbackType} isRemoteAvailable={isRemoteAvailable} isRemoteCasting={isRemoteCasting} isConnecting={isConnecting} onRemoteClick={onRemoteClick} className="text-playerControls" />
          </div>
        </section>
      )}
      <div className="flex items-center gap-2">
        <button type="button" aria-label={playing ? "Pauzeren" : "Afspelen"} onClick={onPlayPause} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-secondary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {playing ? <BsFillPauseFill size={26} /> : <BsFillPlayFill size={26} />}
        </button>
        <div className="min-w-0 flex-1 py-1" aria-live="polite">
          {loading ? (
            <div role="status" aria-label="Nummer laden" className="space-y-2"><div className="h-4 w-3/4 animate-pulse rounded bg-white" /><div className="h-3 w-1/2 animate-pulse rounded bg-white" /></div>
          ) : (
            <>
              <p className="break-words text-base font-semibold leading-snug text-gray-900">{track.title}</p>
              <p className="mt-0.5 break-words text-sm leading-snug text-gray-600">{track.artist}</p>
            </>
          )}
        </div>
        {customSongId && !loading && (
          <PlayerFavoriteButton customSongId={customSongId} title={track.title} refreshKey={detailsOpen} />
        )}
        <button type="button" aria-label="Speleropties" aria-expanded={detailsOpen} onClick={() => setDetailsOpen(!detailsOpen)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          {loading ? <span className="h-10 w-10 animate-pulse rounded-lg bg-white" /> : (
            <ImageWithFallback src={track.imageurl || "/logo.png"} fallbackSrc="/logo.png" alt="" className="h-10 w-10 rounded-lg object-cover" />
          )}
        </button>
      </div>
    </div>
  );
}
