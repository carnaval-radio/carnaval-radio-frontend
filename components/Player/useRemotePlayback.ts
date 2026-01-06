"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useChromecast } from "./useChromecast";
import { useAirPlay } from "./useAirPlay";
import { useDevRemotePlayback } from "./useDevRemotePlayback";
import { Track } from "@/types/trackTypes";

interface UseRemotePlaybackProps {
  trackUrl: string;
  currentTrack: Track;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  onRemoteStateChange?: (isRemote: boolean) => void;
}

export type RemotePlaybackType = "chromecast" | "airplay" | "none";

export const useRemotePlayback = ({
  trackUrl,
  currentTrack,
  isPlaying,
  audioRef,
  onRemoteStateChange,
}: UseRemotePlaybackProps) => {
  // Check for dev mode after hydration to avoid SSR mismatch
  const [devMode, setDevMode] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("devMode");
    if (mode === "airplay" || mode === "chromecast") {
      setDevMode(mode);
      console.log(`[DEV MODE] Using simulated ${mode} playback`);
    }
  }, []);

  // Detect platform
  const playbackType = useMemo<RemotePlaybackType>(() => {
    if (typeof window === "undefined") return "none";
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    // iOS or Safari = AirPlay
    if (isIOS || isSafari) {
      return "airplay";
    }
    
    // Chrome-based browsers = Chromecast
    return "chromecast";
  }, []);

  // Always call all hooks (Rules of Hooks - must call in same order every render)
  const devPlayback = useDevRemotePlayback({
    isPlaying,
    onRemoteStateChange,
  });

  // Initialize Chromecast
  const chromecast = useChromecast({
    trackUrl,
    currentTrack,
    isPlaying,
    onCastStateChange: onRemoteStateChange,
  });

  // Initialize AirPlay
  const airplay = useAirPlay({
    trackUrl,
    currentTrack,
    isPlaying,
    audioRef,
    onAirPlayStateChange: onRemoteStateChange,
  });

  // Return dev mode if active
  if (devMode) {
    return {
      ...devPlayback,
      playbackType: devMode as RemotePlaybackType,
    };
  }

  // Return unified interface based on platform
  if (playbackType === "airplay") {
    return {
      playbackType: "airplay" as RemotePlaybackType,
      isRemoteAvailable: airplay.isAirPlayAvailable,
      isRemoteCasting: airplay.isAirPlaying,
      isConnecting: false, // AirPlay doesn't have connecting state
      remotePlayerState: airplay.airPlayPlayerState,
      startRemotePlayback: airplay.startAirPlay,
      stopRemotePlayback: airplay.stopAirPlay,
      togglePlayPause: airplay.togglePlayPause,
    };
  }

  // Chromecast
  return {
    playbackType: "chromecast" as RemotePlaybackType,
    isRemoteAvailable: chromecast.isCastAvailable,
    isRemoteCasting: chromecast.isCasting,
    isConnecting: chromecast.isConnecting,
    remotePlayerState: chromecast.castPlayerState,
    startRemotePlayback: chromecast.startCasting,
    stopRemotePlayback: chromecast.stopCasting,
    togglePlayPause: chromecast.togglePlayPause,
  };
};
