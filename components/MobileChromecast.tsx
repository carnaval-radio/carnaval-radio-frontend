"use client";

import React, { useRef } from "react";
import ChromecastButton from "./Player/ChromecastButton";
import { useSelector } from "react-redux";
import { GlobalState } from "@/GlobalState/GlobalState";

// We'll use a ref to store the cast click handler passed from Player
const castClickHandlerRef: { current: (() => void) | null } = { current: null };

export const setCastClickHandler = (handler: () => void) => {
  castClickHandlerRef.current = handler;
};

const MobileChromecast: React.FC = () => {
  const { isCastAvailable, isCasting, isConnecting } = useSelector(
    (state: GlobalState) => state.Player
  );

  const handleCastClick = () => {
    if (castClickHandlerRef.current) {
      castClickHandlerRef.current();
    }
  };

  return (
    <div className="md:hidden lg:hidden xl:hidden">
      <ChromecastButton
        isCastAvailable={isCastAvailable}
        isCasting={isCasting}
        isConnecting={isConnecting}
        onCastClick={handleCastClick}
        className="text-gray-800"
        size="large"
      />
    </div>
  );
};

export default MobileChromecast;
