"use client";

import React, { useId } from "react";
import { RemotePlaybackType } from "./useRemotePlayback";

interface RemotePlaybackButtonProps {
  playbackType: RemotePlaybackType;
  isRemoteAvailable: boolean;
  isRemoteCasting: boolean;
  isConnecting: boolean;
  onRemoteClick: () => void;
  className?: string;
  size?: "small" | "medium" | "large";
}

const RemotePlaybackButton: React.FC<RemotePlaybackButtonProps> = ({
  playbackType,
  isRemoteAvailable,
  isRemoteCasting,
  isConnecting,
  onRemoteClick,
  className = "",
  size = "medium",
}) => {
  const uniqueId = useId();
  const gradientConnectingId = `remoteGradientConnecting-${uniqueId}`;
  const gradientActiveId = `remoteGradientActive-${uniqueId}`;

  // Size classes
  const sizeClass = size === "large" ? "w-10 h-10" : size === "small" ? "w-6 h-6" : "w-7 h-7";

  if (!isRemoteAvailable && !isRemoteCasting) {
    return null;
  }

  // AirPlay icon
  const AirPlayIcon = ({ fillColor }: { fillColor?: string }) => (
    <svg
      className={sizeClass}
      viewBox="0 0 24 24"
      fill={fillColor || "currentColor"}
    >
      <path d="M6,22H18L12,16M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H7V17H3V5H21V17H17V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3Z" />
    </svg>
  );

  // Chromecast icon
  const ChromecastIcon = ({ fillColor }: { fillColor?: string }) => (
    <svg
      className={sizeClass}
      viewBox="0 0 24 24"
      fill={fillColor || "currentColor"}
    >
      <path d="M1,18 L1,21 L4,21 C4,19.34 2.66,18 1,18 Z M1,14 L1,16 C3.76,16 6,18.24 6,21 L8,21 C8,17.13 4.87,14 1,14 Z M1,10 L1,12 C5.97,12 10,16.03 10,21 L12,21 C12,14.92 7.07,10 1,10 Z M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 Z" />
    </svg>
  );

  return (
    <button
      onClick={onRemoteClick}
      className={`flex items-center justify-center cursor-pointer transition-all ${className}`}
      aria-label={isRemoteCasting ? `Stop ${playbackType}` : `Start ${playbackType}`}
      title={isRemoteCasting ? `Stop ${playbackType}` : `Cast to ${playbackType} device`}
    >
      {isConnecting ? (
        // Connecting state - animated with gradient (Chromecast only)
        playbackType === "chromecast" ? (
          <svg className={`${sizeClass} animate-pulse`} viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id={gradientConnectingId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#f7931e" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${gradientConnectingId})`}
              d="M1,18 L1,21 L4,21 C4,19.34 2.66,18 1,18 Z M1,14 L1,16 C3.76,16 6,18.24 6,21 L8,21 C8,17.13 4.87,14 1,14 Z M1,10 L1,12 C5.97,12 10,16.03 10,21 L12,21 C12,14.92 7.07,10 1,10 Z M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 Z"
            />
          </svg>
        ) : (
          <AirPlayIcon />
        )
      ) : isRemoteCasting ? (
        // Active/casting state - gradient fill
        playbackType === "chromecast" ? (
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id={gradientActiveId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#f7931e" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${gradientActiveId})`}
              d="M1,18 L1,21 L4,21 C4,19.34 2.66,18 1,18 Z M1,14 L1,16 C3.76,16 6,18.24 6,21 L8,21 C8,17.13 4.87,14 1,14 Z M1,10 L1,12 C5.97,12 10,16.03 10,21 L12,21 C12,14.92 7.07,10 1,10 Z M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 Z"
            />
          </svg>
        ) : (
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id={gradientActiveId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#f7931e" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${gradientActiveId})`}
              d="M6,22H18L12,16M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H7V17H3V5H21V17H17V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3Z"
            />
          </svg>
        )
      ) : (
        // Idle state
        <div className={`${sizeClass} hover:scale-110 transition-transform flex items-center justify-center`}>
          {playbackType === "chromecast" ? <ChromecastIcon /> : <AirPlayIcon />}
        </div>
      )}
    </button>
  );
};

export default RemotePlaybackButton;
