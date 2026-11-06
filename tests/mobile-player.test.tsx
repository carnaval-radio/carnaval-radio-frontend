// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import MobilePlayer from "@/components/Player/MobilePlayer";
import { getFavoritesLocal, toggleFavoriteLocal, syncFavoriteToSupabase } from "@/helpers/favorites";

vi.mock("@/helpers/favorites", () => ({
  getFavoritesLocal: vi.fn(),
  toggleFavoriteLocal: vi.fn(),
  syncFavoriteToSupabase: vi.fn(),
}));

const props = (): ComponentProps<typeof MobilePlayer> => ({
  track: {
    title: "Een lange liedjestitel met alle woorden en geen afgebroken einde",
    artist: "Een artiest met een heel lange naam",
    imageurl: "/cover.jpg",
  },
  loading: false,
  playing: false,
  muted: false,
  customSongId: "song-1",
  onPlayPause: vi.fn(),
  onMute: vi.fn(),
  onComments: vi.fn(),
  playbackType: "chromecast",
  isRemoteAvailable: true,
  isRemoteCasting: false,
  isConnecting: false,
  onRemoteClick: vi.fn(),
});

beforeEach(() => {
  vi.mocked(getFavoritesLocal).mockReturnValue({});
  vi.mocked(toggleFavoriteLocal).mockReturnValue({ "song-1": true });
  vi.mocked(syncFavoriteToSupabase).mockResolvedValue();
});

describe("mobile player", () => {
  it("shows complete wrapping song metadata, artwork, play and heart without secondary controls", () => {
    const input = props();
    render(<MobilePlayer {...input} />);
    expect(screen.getByText(input.track.title)).toHaveClass("break-words", "text-base");
    expect(screen.getByText(input.track.artist)).toHaveClass("break-words");
    expect(screen.getByRole("button", { name: "Afspelen" })).toHaveClass("h-11", "w-11");
    expect(screen.getByRole("button", { name: "Speleropties" }).querySelector("img")).toHaveAttribute("src", "/cover.jpg");
    expect(screen.queryByRole("button", { name: "Reageren" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Geluid uit" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Afspelen" }));
    expect(input.onPlayPause).toHaveBeenCalledOnce();
  });

  it("uses optimistic favorites and synchronizes the correct song", () => {
    const input = props();
    render(<MobilePlayer {...input} />);
    const heart = screen.getByRole("button", { name: `Favoriet: ${input.track.title}` });
    expect(heart).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(heart);
    expect(toggleFavoriteLocal).toHaveBeenCalledWith("song-1");
    expect(syncFavoriteToSupabase).toHaveBeenCalledWith("song-1", true);
    expect(heart).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps comments, mute and casting available through artwork on the right", () => {
    const input = props();
    render(<MobilePlayer {...input} />);
    expect(screen.queryByRole("button", { name: /^Reacties:/ })).not.toBeInTheDocument();
    const artwork = screen.getByRole("button", { name: "Speleropties" });
    expect(artwork.parentElement?.lastElementChild).toBe(artwork);
    fireEvent.click(screen.getByRole("button", { name: "Speleropties" }));
    expect(screen.getByRole("button", { name: "Speleropties" })).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: "Geluid uit" }));
    expect(input.onMute).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Start chromecast" }));
    expect(input.onRemoteClick).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Reageren" }));
    expect(input.onComments).toHaveBeenCalledOnce();
    expect(screen.queryByRole("region", { name: "Speleropties" })).not.toBeInTheDocument();
  });

  it("updates song favorites and shows paused/muted remote controls correctly", () => {
    const input = props();
    const { rerender } = render(<MobilePlayer {...input} playing muted />);
    expect(screen.getByRole("button", { name: "Pauzeren" })).toBeInTheDocument();
    vi.mocked(getFavoritesLocal).mockReturnValue({ "song-2": true });
    rerender(<MobilePlayer {...input} playing muted customSongId="song-2" />);
    expect(screen.getByRole("button", { name: /Favoriet:/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Speleropties" }));
    expect(screen.getByRole("button", { name: "Geluid aan" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(screen.getByRole("region", { name: "Speleropties" }), { key: "Escape" });
    expect(screen.queryByRole("region", { name: "Speleropties" })).not.toBeInTheDocument();
  });

  it("does not offer favorites or comments for unknown/loading songs", () => {
    render(<MobilePlayer {...props()} customSongId={undefined} loading />);
    expect(screen.getByRole("status", { name: "Nummer laden" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Favoriet:/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Speleropties" }));
    expect(screen.queryByRole("button", { name: "Reageren" })).not.toBeInTheDocument();
  });
});
