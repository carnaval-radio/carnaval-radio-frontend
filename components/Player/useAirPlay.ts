"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Track } from "@/types/trackTypes";
import { useDispatch } from "react-redux";
import { setRemoteState } from "@/GlobalState/features/PlayerSlice";

interface UseAirPlayProps {
  trackUrl: string;
  currentTrack: Track;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  onAirPlayStateChange?: (isAirPlaying: boolean) => void;
}

export const useAirPlay = ({
  trackUrl,
  currentTrack,
  isPlaying,
  audioRef,
  onAirPlayStateChange,
}: UseAirPlayProps) => {
  const dispatch = useDispatch();
  const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);
  const [isAirPlaying, setIsAirPlaying] = useState(false);
  const [airPlayPlayerState, setAirPlayPlayerState] = useState<string>("IDLE");

  // Update Redux when AirPlay state changes
  useEffect(() => {
    dispatch(
      setRemoteState({
        isRemoteAvailable: isAirPlayAvailable,
        isRemoteCasting: isAirPlaying,
        isConnecting: false, // AirPlay doesn't have a connecting state
        remotePlayerState: airPlayPlayerState,
      })
    );
  }, [isAirPlayAvailable, isAirPlaying, airPlayPlayerState, dispatch]);

  // Check if AirPlay is available (iOS/Safari only)
  useEffect(() => {
    if (typeof window === "undefined" || !audioRef.current) return;

    const audio = audioRef.current as any;
    
    // Check if WebKit AirPlay is available
    const hasAirPlay = 
      typeof audio.webkitShowPlaybackTargetPicker === "function" ||
      "remote" in audio;

    setIsAirPlayAvailable(hasAirPlay);

    if (hasAirPlay) {
      console.log("AirPlay is available");
    }
  }, [audioRef]);

  // Monitor AirPlay connection status
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current as any;

    const handleWebkitPlaybackTargetAvailabilityChanged = (event: any) => {
      console.log("AirPlay availability changed:", event.availability);
      setIsAirPlayAvailable(event.availability !== "not-available");
    };

    const handleWebkitCurrentPlaybackTargetIsWirelessChanged = (event: any) => {
      const isWireless = audio.webkitCurrentPlaybackTargetIsWireless;
      console.log("AirPlay wireless changed:", isWireless);
      setIsAirPlaying(isWireless);
      
      if (isWireless) {
        setAirPlayPlayerState(audio.paused ? "PAUSED" : "PLAYING");
      } else {
        setAirPlayPlayerState("IDLE");
      }
      
      onAirPlayStateChange?.(isWireless);
    };

    // WebKit AirPlay events
    audio.addEventListener(
      "webkitplaybacktargetavailabilitychanged",
      handleWebkitPlaybackTargetAvailabilityChanged
    );
    audio.addEventListener(
      "webkitcurrentplaybacktargetiswirelesschanged",
      handleWebkitCurrentPlaybackTargetIsWirelessChanged
    );

    return () => {
      audio.removeEventListener(
        "webkitplaybacktargetavailabilitychanged",
        handleWebkitPlaybackTargetAvailabilityChanged
      );
      audio.removeEventListener(
        "webkitcurrentplaybacktargetiswirelesschanged",
        handleWebkitCurrentPlaybackTargetIsWirelessChanged
      );
    };
  }, [audioRef, onAirPlayStateChange]);

  // Update player state when audio element changes
  useEffect(() => {
    if (!audioRef.current || !isAirPlaying) return;

    const audio = audioRef.current;

    const updatePlayerState = () => {
      setAirPlayPlayerState(audio.paused ? "PAUSED" : "PLAYING");
    };

    audio.addEventListener("play", updatePlayerState);
    audio.addEventListener("pause", updatePlayerState);

    return () => {
      audio.removeEventListener("play", updatePlayerState);
      audio.removeEventListener("pause", updatePlayerState);
    };
  }, [audioRef, isAirPlaying]);

  // Show AirPlay picker
  const startAirPlay = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current as any;

    if (typeof audio.webkitShowPlaybackTargetPicker === "function") {
      audio.webkitShowPlaybackTargetPicker();
    }
  }, [audioRef]);

  // Stop AirPlay (not directly possible, user must disconnect from device)
  const stopAirPlay = useCallback(() => {
    // AirPlay can't be programmatically stopped
    // User must disconnect from their device
    console.log("AirPlay must be stopped from the device");
  }, []);

  // Toggle play/pause when AirPlaying
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (audio.paused) {
      audio.play().catch(console.error);
      setAirPlayPlayerState("PLAYING");
    } else {
      audio.pause();
      setAirPlayPlayerState("PAUSED");
    }
  }, [audioRef]);

  return {
    isAirPlayAvailable,
    isAirPlaying,
    airPlayPlayerState,
    startAirPlay,
    stopAirPlay,
    togglePlayPause,
  };
};
