import { describe, expect, it } from "vitest";
import reducer, {
  setMuted,
  setPlay,
  setRemoteState,
  setsSongTitle,
} from "@/GlobalState/features/PlayerSlice";

describe("player state", () => {
  it("starts idle, unmuted, and without casting", () => {
    expect(reducer(undefined, { type: "initial" })).toEqual({
      songTitle: "",
      songUrl: "",
      isPlaying: false,
      muted: false,
      isRemoteAvailable: false,
      isRemoteCasting: false,
      isConnecting: false,
      remotePlayerState: "IDLE",
    });
  });

  it("toggles playback and mute independently", () => {
    const initial = reducer(undefined, { type: "initial" });
    const playing = reducer(initial, setPlay());
    const muted = reducer(playing, setMuted());
    expect(muted).toMatchObject({ isPlaying: true, muted: true });
    expect(reducer(reducer(muted, setPlay()), setMuted()))
      .toMatchObject({ isPlaying: false, muted: false });
    expect(initial.isPlaying).toBe(false);
  });

  it("updates the song title without resetting playback", () => {
    const playing = reducer(undefined, setPlay());
    expect(reducer(playing, setsSongTitle("Artist - Song")))
      .toMatchObject({ songTitle: "Artist - Song", isPlaying: true });
  });

  it("preserves the remote player state when an update omits it", () => {
    const casting = reducer(undefined, setRemoteState({
      isRemoteAvailable: true,
      isRemoteCasting: true,
      isConnecting: false,
      remotePlayerState: "PLAYING",
    }));
    const connecting = reducer(casting, setRemoteState({
      isRemoteAvailable: true,
      isRemoteCasting: false,
      isConnecting: true,
    }));
    expect(connecting).toMatchObject({
      isRemoteAvailable: true,
      isRemoteCasting: false,
      isConnecting: true,
      remotePlayerState: "PLAYING",
    });
  });
});
