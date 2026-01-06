"use client";

import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setRemoteState } from "@/GlobalState/features/PlayerSlice";

interface UseDevRemotePlaybackProps {
  isPlaying: boolean;
  onRemoteStateChange?: (isRemote: boolean) => void;
}

export const useDevRemotePlayback = ({
  isPlaying,
  onRemoteStateChange,
}: UseDevRemotePlaybackProps) => {
  const dispatch = useDispatch();
  const [isDevCasting, setIsDevCasting] = useState(false);
  const [isDevConnecting, setIsDevConnecting] = useState(false);
  const [devPlayerState, setDevPlayerState] = useState<string>("IDLE");

  // Update Redux
  useEffect(() => {
    dispatch(
      setRemoteState({
        isRemoteAvailable: true, // Always available in dev mode
        isRemoteCasting: isDevCasting,
        isConnecting: isDevConnecting,
        remotePlayerState: devPlayerState,
      })
    );
  }, [isDevCasting, isDevConnecting, devPlayerState, dispatch]);

  // Sync player state when casting
  useEffect(() => {
    if (isDevCasting) {
      setDevPlayerState(isPlaying ? "PLAYING" : "PAUSED");
    }
  }, [isPlaying, isDevCasting]);

  const startRemotePlayback = useCallback(() => {
    console.log("[DEV MODE] Starting simulated remote playback");
    setIsDevConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsDevConnecting(false);
      setIsDevCasting(true);
      setDevPlayerState("PLAYING");
      onRemoteStateChange?.(true);
    }, 1000);
  }, [onRemoteStateChange]);

  const stopRemotePlayback = useCallback(() => {
    console.log("[DEV MODE] Stopping simulated remote playback");
    setIsDevCasting(false);
    setDevPlayerState("IDLE");
    onRemoteStateChange?.(false);
  }, [onRemoteStateChange]);

  const togglePlayPause = useCallback(() => {
    console.log("[DEV MODE] Toggle play/pause");
    if (isDevCasting) {
      const newState = devPlayerState === "PLAYING" ? "PAUSED" : "PLAYING";
      setDevPlayerState(newState);
    }
  }, [isDevCasting, devPlayerState]);

  return {
    isRemoteAvailable: true,
    isRemoteCasting: isDevCasting,
    isConnecting: isDevConnecting,
    remotePlayerState: devPlayerState,
    startRemotePlayback,
    stopRemotePlayback,
    togglePlayPause,
  };
};
