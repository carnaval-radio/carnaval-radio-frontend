"use client";

import React, { useState, useEffect } from "react";
import RemotePlaybackButton from "./Player/RemotePlaybackButton";
import { useSelector } from "react-redux";
import { GlobalState } from "@/GlobalState/GlobalState";
import { RemotePlaybackType } from "./Player/useRemotePlayback";

// We'll use a ref to store the remote playback click handler passed from Player
const remoteClickHandlerRef: { current: (() => void) | null } = { current: null };

// Keep old name for backward compatibility
export const setCastClickHandler = (handler: () => void) => {
  remoteClickHandlerRef.current = handler;
};

const MobileChromecast: React.FC = () => {
  const { isRemoteAvailable, isRemoteCasting, isConnecting } = useSelector(
    (state: GlobalState) => state.Player
  );

  const [playbackType, setPlaybackType] = useState<RemotePlaybackType>("chromecast");

  useEffect(() => {
    // Check for dev mode first
    const params = new URLSearchParams(window.location.search);
    const devMode = params.get("devMode");
    if (devMode === "airplay" || devMode === "chromecast") {
      setPlaybackType(devMode);
      return;
    }

    // Determine playback type based on user agent
    const ua = navigator.userAgent;
    const type = /iPad|iPhone|iPod/.test(ua) || (/Safari/.test(ua) && !/Chrome/.test(ua))
      ? "airplay"
      : "chromecast";
    setPlaybackType(type);
  }, []);

  const handleRemoteClick = () => {
    if (remoteClickHandlerRef.current) {
      remoteClickHandlerRef.current();
    }
  };

  return (
    <div className="md:hidden lg:hidden xl:hidden">
      <RemotePlaybackButton
        playbackType={playbackType}
        isRemoteAvailable={isRemoteAvailable}
        isRemoteCasting={isRemoteCasting}
        isConnecting={isConnecting}
        onRemoteClick={handleRemoteClick}
        className="text-gray-800"
        size="large"
      />
    </div>
  );
};

export default MobileChromecast;
