// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import PlayerControls from "@/components/Player/PlayerControls";
import playerReducer, { setPlay, setRemoteState } from "@/GlobalState/features/PlayerSlice";
import { getFavoritesLocal } from "@/helpers/favorites";

vi.mock("@/helpers/favorites", () => {
  let favorites: Record<string, true> = {};
  return {
    getFavoritesLocal: () => favorites,
    toggleFavoriteLocal: (id: string) => {
      favorites = favorites[id] ? {} : { [id]: true };
      return favorites;
    },
    syncFavoriteToSupabase: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("@/components/Comments/SongCommentsModal", () => ({
  default: ({ onClose }: { onClose: () => void }) => <div role="dialog" aria-label="Reacties"><button onClick={onClose}>Sluiten</button></div>,
}));

function setup(overrides: Partial<ComponentProps<typeof PlayerControls>> = {}) {
  const store = configureStore({ reducer: { Player: playerReducer } });
  const audio = document.createElement("audio");
  const props: ComponentProps<typeof PlayerControls> = {
    currentTrack: {
      title: "Een lange liedjestitel met alle woorden en geen afgebroken einde",
      artist: "Een artiest met een heel lange naam", imageurl: "/cover.jpg",
    },
    audioElem: { current: audio }, trackUrl: "/stream", loading: false,
    customSongId: "desktop-song", playbackType: "chromecast",
    isRemoteAvailable: true, isRemoteCasting: false, isConnecting: false,
    onRemoteClick: vi.fn(), ...overrides,
  };
  const result = render(<Provider store={store}><PlayerControls {...props} /></Provider>);
  const desktop = within(result.container.querySelector('[aria-label="Desktopspeler"]')! as HTMLElement);
  return { ...result, desktop, props, store, audio };
}

describe("desktop player", () => {
  it("prioritizes full metadata with play first, artwork last and direct secondary controls", () => {
    const { desktop, props, container } = setup();
    expect(desktop.getByText(props.currentTrack.title)).toHaveClass("break-words", "text-lg");
    expect(desktop.getByText(props.currentTrack.title)).not.toHaveClass("uppercase");
    expect(desktop.getByText(props.currentTrack.artist)).toHaveClass("text-sm");
    const bar = container.querySelector('[aria-label="Desktopspeler"]')!;
    expect(bar.firstElementChild).toBe(desktop.getByRole("button", { name: "Afspelen" }));
    expect(bar.lastElementChild).toBe(desktop.getByRole("img"));
    expect(desktop.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
    expect(desktop.getByRole("button", { name: /Reacties:/ })).toBeInTheDocument();
    expect(desktop.getByRole("button", { name: "Start chromecast" })).toBeInTheDocument();
  });

  it("controls local playback, mute and actual audio volume", () => {
    const { desktop, store, audio } = setup();
    expect(audio.volume).toBe(0.3);
    fireEvent.click(desktop.getByRole("button", { name: "Afspelen" }));
    expect(store.getState().Player.isPlaying).toBe(true);
    expect(desktop.getByRole("button", { name: "Pauzeren" })).toBeInTheDocument();
    fireEvent.change(desktop.getByRole("slider", { name: "Volume" }), { target: { value: "65" } });
    expect(audio.volume).toBe(0.65);
    fireEvent.click(desktop.getByRole("button", { name: "Geluid uit" }));
    expect(audio.muted).toBe(true);
    expect(desktop.getByRole("button", { name: "Geluid aan" })).toHaveAttribute("aria-pressed", "true");
  });

  it("uses the remote playback state and dispatches through the remote handler", () => {
    const handler = vi.fn();
    const { desktop, store, props } = setup({ isRemoteCasting: true, onPlayPauseClick: handler });
    act(() => { store.dispatch(setPlay()); });
    expect(desktop.getByRole("button", { name: "Afspelen" })).toBeInTheDocument();
    fireEvent.click(desktop.getByRole("button", { name: "Afspelen" }));
    expect(handler).toHaveBeenCalledOnce();
    fireEvent.click(desktop.getByRole("button", { name: "Stop chromecast" }));
    expect(props.onRemoteClick).toHaveBeenCalledOnce();
    act(() => {
      store.dispatch(setRemoteState({
        isRemoteCasting: true, isRemoteAvailable: true, isConnecting: false,
        remotePlayerState: "PLAYING",
      }));
    });
    expect(desktop.getByRole("button", { name: "Pauzeren" })).toBeInTheDocument();
  });

  it("keeps favorites synchronized between the mounted mobile and desktop controls", () => {
    const { desktop, container } = setup();
    const button = desktop.getByRole("button", { name: /Favoriet:/ });
    fireEvent.click(button);
    expect(getFavoritesLocal()["desktop-song"]).toBe(true);
    for (const heart of Array.from(container.querySelectorAll('[aria-label^="Favoriet:"]'))) {
      expect(heart).toHaveAttribute("aria-pressed", "true");
    }
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("opens and closes the existing comments modal", () => {
    const { desktop } = setup();
    fireEvent.click(desktop.getByRole("button", { name: /Reacties:/ }));
    expect(screen.getByRole("dialog", { name: "Reacties" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sluiten" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps loading/unknown tracks free of song-specific controls and guards absent audio", () => {
    const { desktop } = setup({ loading: true, customSongId: undefined, audioElem: { current: null }, isRemoteAvailable: false });
    expect(desktop.getByRole("status", { name: "Nummer laden" })).toBeInTheDocument();
    expect(desktop.queryByRole("button", { name: /Favoriet:|Reacties:|chromecast/ })).not.toBeInTheDocument();
  });
});
