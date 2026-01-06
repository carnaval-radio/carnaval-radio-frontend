"use client";
import { createSlice } from "@reduxjs/toolkit";

const PlayerSlice = createSlice({
  name: "Player",
  initialState: {
    songTitle: "",
    songUrl: "",
    isPlaying: false,
    muted: false,
    isRemoteAvailable: false,
    isRemoteCasting: false,
    isConnecting: false,
    remotePlayerState: "IDLE" as string,
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
    setRemoteState: (state, action) => {
      state.isRemoteAvailable = action.payload.isRemoteAvailable;
      state.isRemoteCasting = action.payload.isRemoteCasting;
      state.isConnecting = action.payload.isConnecting;
      if (action.payload.remotePlayerState !== undefined) {
        state.remotePlayerState = action.payload.remotePlayerState;
      }
    },
  },
});

export const { setMuted, setsSongTitle, setPlay, setRemoteState } = PlayerSlice.actions;
export type PlayerState = ReturnType<typeof PlayerSlice.reducer>;

export default PlayerSlice.reducer;