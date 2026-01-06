"use client";
import { createSlice } from "@reduxjs/toolkit";

const PlayerSlice = createSlice({
  name: "Player",
  initialState: {
    songTitle: "",
    songUrl: "",
    isPlaying: false,
    muted: false,
    isCastAvailable: false,
    isCasting: false,
    isConnecting: false,
    castPlayerState: "IDLE" as string,
  },
  reducers: {
    setMuted: (state) => {
      state.muted = !state.muted;
    },
    setsSongTitle: (state, action) => {
      state.songTitle = action.payload;
    },
    setPlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setCastState: (state, action) => {
      state.isCastAvailable = action.payload.isCastAvailable;
      state.isCasting = action.payload.isCasting;
      state.isConnecting = action.payload.isConnecting;
      if (action.payload.castPlayerState !== undefined) {
        state.castPlayerState = action.payload.castPlayerState;
      }
    },
  },
});

export const { setMuted, setsSongTitle, setPlay, setCastState } = PlayerSlice.actions;
export type PlayerState = ReturnType<typeof PlayerSlice.reducer>;

export default PlayerSlice.reducer;