"use client";

import React, { useId } from "react";

interface ChromecastButtonProps {
  isCastAvailable: boolean;
  isCasting: boolean;
  isConnecting: boolean;
  onCastClick: () => void;
  className?: string;
  size?: "small" | "medium" | "large";
}

const ChromecastButton: React.FC<ChromecastButtonProps> = ({
  isCastAvailable,
  isCasting,
  isConnecting,
  onCastClick,
  className = "",
  size = "medium",
}) => {
  const uniqueId = useId();
  const gradientConnectingId = `castGradientConnecting-${uniqueId}`;
  const gradientActiveId = `castGradientActive-${uniqueId}`;

  // Size classes
  const sizeClass = size === "large" ? "w-10 h-10" : size === "small" ? "w-6 h-6" : "w-7 h-7";

  if (!isCastAvailable && !isCasting) {
    return null; // Don't show button if no Cast devices available and not already casting
  }

  return (
    <button
      onClick={onCastClick}
      className={`flex items-center justify-center cursor-pointer transition-all ${className}`}
      aria-label={isCasting ? "Stop casting" : "Start casting"}
      title={isCasting ? "Stop casting" : "Cast to device"}
    >
      {isConnecting ? (
        // Connecting state - animated icon with gradient
        <svg
          className={`${sizeClass} animate-pulse`}
          viewBox="0 0 24 24"
          fill="none"
        >
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
      ) : isCasting ? (
        // Connected state - filled icon with gradient
        <svg
          className={sizeClass}
          viewBox="0 0 24 24"
          fill="none"
        >
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
        // Idle state - outline icon
        <svg
          className={`${sizeClass} hover:scale-110 transition-transform`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M1,18 L1,21 L4,21 C4,19.34 2.66,18 1,18 Z M1,14 L1,16 C3.76,16 6,18.24 6,21 L8,21 C8,17.13 4.87,14 1,14 Z M1,10 L1,12 C5.97,12 10,16.03 10,21 L12,21 C12,14.92 7.07,10 1,10 Z M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 Z" />
        </svg>
      )}
    </button>
  );
};

export default ChromecastButton;
