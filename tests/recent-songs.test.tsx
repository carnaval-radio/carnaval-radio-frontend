// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecentSongs from "@/components/RecentSongs/RecentSongs";
import HeroSongs from "@/components/Hero/HeroSongs";
import RecentSongsPage from "@/components/RecentSongs/RecentSongsPage";
import { getFavoritesLocal, toggleFavoriteLocal, syncFavoriteToSupabase } from "@/helpers/favorites";
import type { RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";
import type { ComponentProps } from "react";

vi.mock("@/helpers/favorites", () => ({
  getFavoritesLocal: vi.fn(),
  toggleFavoriteLocal: vi.fn(),
  syncFavoriteToSupabase: vi.fn(),
}));
vi.mock("@/app/fonts/font", () => ({ Indie: { className: "test-font" } }));
vi.mock("@/components/Comments/SongCommentsModal", () => ({
  default: ({ songTitle, songArtist, onClose }: ComponentProps<typeof import("@/components/Comments/SongCommentsModal").default>) => (
    <div role="dialog" aria-label={songTitle}>
      <p>{songArtist}</p>
      <button onClick={onClose}>Sluiten</button>
    </div>
  ),
}));

const tracks: RecentSong[] = [
  {
    ID: "long-song",
    title: "Een heel lange Limburgse liedjestitel die volledig leesbaar moet blijven",
    artist: "Een artiestennaam die ook langer is dan achttien tekens",
    url: "https://res.cloudinary.com/test/image/upload/cover.jpg",
    date: new Date(2026, 10, 8, 10, 11).getTime(),
  },
  {
    ID: "second-song",
    title: "Tweede nummer",
    artist: "Tweede artiest",
    url: "https://res.cloudinary.com/test/image/upload/cover.jpg",
    date: new Date(2026, 10, 8, 10, 8).getTime(),
  },
];

beforeEach(() => {
  vi.mocked(getFavoritesLocal).mockReturnValue({});
  vi.mocked(toggleFavoriteLocal).mockReturnValue({ "long-song": true });
  vi.mocked(syncFavoriteToSupabase).mockResolvedValue(undefined);
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 8, 11));
});

describe("played songs list", () => {
  it("replaces known unknown artwork even for saved tracks", () => {
    render(<RecentSongs loading={false} recentTracks={[{
      ...tracks[0],
      url: "https://is1-ssl.mzstatic.com/image/thumb/5d2bc0d7-53cc-cf7b-b400-e7c8742fa5d6/artwork.jpg/300x300bb.jpg",
    }]} />);
    expect(screen.getByRole("img", { name: tracks[0].artist }).getAttribute("src"))
      .toContain("cloudinary.com");
  });

  it("renders full titles and artist names even on a narrow viewport", () => {
    vi.stubGlobal("innerWidth", 320);
    render(<RecentSongs loading={false} recentTracks={tracks} />);
    expect(screen.getByText(tracks[0].title)).toBeInTheDocument();
    expect(screen.getByText(tracks[0].artist)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "..." })).not.toBeInTheDocument();
    expect(screen.getByText(tracks[0].title)).toHaveClass("break-words");
  });

  it("keeps comments directly accessible without a one-option menu", () => {
    render(<RecentSongs loading={false} recentTracks={tracks} />);
    expect(screen.getByRole("button", { name: `Reacties: ${tracks[0].title}` })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Meer opties/ })).not.toBeInTheDocument();
  });

  it("opens comments for the selected song with one click", () => {
    render(<RecentSongs loading={false} recentTracks={tracks} />);
    fireEvent.click(screen.getByRole("button", { name: `Reacties: ${tracks[1].title}` }));
    expect(screen.getByRole("dialog", { name: tracks[1].title })).toHaveTextContent(tracks[1].artist);
    fireEvent.click(screen.getByRole("button", { name: "Sluiten" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("preserves full-size text and the desktop time-pill spacing", () => {
    render(<RecentSongs loading={false} recentTracks={tracks} />);
    expect(screen.getByText(tracks[0].title)).toHaveClass("text-base");
    expect(screen.getByText(tracks[0].artist)).toHaveClass("text-base");
    const times = screen.getAllByText("10:11");
    expect(times).toHaveLength(2);
    expect(times[0]).toHaveClass("text-sm", "px-2", "py-1");
    expect(times[1].parentElement).toHaveClass("sm:block", "px-4", "py-2");
  });

  it("preserves optimistic favorite toggling and sync", async () => {
    render(<RecentSongs loading={false} recentTracks={tracks} canAddToFavorites />);
    const favorite = screen.getByRole("button", { name: `Favoriet: ${tracks[0].title}` });
    expect(favorite).toHaveAttribute("aria-pressed", "false");
    await act(async () => fireEvent.click(favorite));
    expect(favorite).toHaveAttribute("aria-pressed", "true");
    expect(toggleFavoriteLocal).toHaveBeenCalledWith("long-song");
    expect(syncFavoriteToSupabase).toHaveBeenCalledWith("long-song", true);
    vi.mocked(toggleFavoriteLocal).mockReturnValue({});
    await act(async () => fireEvent.click(favorite));
    expect(favorite).toHaveAttribute("aria-pressed", "false");
    expect(syncFavoriteToSupabase).toHaveBeenLastCalledWith("long-song", false);
  });

  it("loads existing favorites and hides favorite controls when unavailable", () => {
    vi.mocked(getFavoritesLocal).mockReturnValue({ "long-song": true });
    const view = render(<RecentSongs loading={false} recentTracks={tracks} canAddToFavorites />);
    expect(screen.getByRole("button", { name: `Favoriet: ${tracks[0].title}` })).toHaveAttribute("aria-pressed", "true");
    view.rerender(<RecentSongs loading={false} recentTracks={tracks} />);
    expect(screen.queryByRole("button", { name: /Favoriet:/ })).not.toBeInTheDocument();
  });

  it("observes maxTracks and handles loading, missing dates and empty lists", () => {
    const view = render(<RecentSongs loading={false} recentTracks={tracks} maxTracks={1} />);
    expect(screen.queryByText(tracks[1].title)).not.toBeInTheDocument();
    view.rerender(<RecentSongs loading recentTracks={tracks} />);
    expect(screen.queryByText(tracks[0].title)).not.toBeInTheDocument();
    view.rerender(<RecentSongs loading={false} recentTracks={[{ ...tracks[0], date: null }]} />);
    expect(screen.queryByText("10:11")).not.toBeInTheDocument();
    view.rerender(<RecentSongs loading={false} recentTracks={[]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("widget and full-page integration", () => {
  it("renders the same full song text in the homepage widget", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ songs: tracks, canAddToFavorites: true })));
    await act(async () => render(<HeroSongs />));
    expect(fetch).toHaveBeenCalledWith("/api/songs?limit=4", { cache: "no-store" });
    expect(screen.getByText(tracks[0].title)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Meer gedraaide nummers" })).toHaveAttribute("href", "/gedraaide-nummers");
    expect(screen.getByRole("button", { name: `Reacties: ${tracks[0].title}` })).toBeInTheDocument();
  });

  it("renders full song text and smaller mobile padding on the history page", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ songs: tracks, canAddToFavorites: true })));
    let container: HTMLElement;
    await act(async () => {
      container = render(<RecentSongsPage />).container;
    });
    expect(fetch).toHaveBeenCalledWith("/api/songs?limit=50", { cache: "no-store" });
    expect(screen.getByText(tracks[0].title)).toBeInTheDocument();
    expect(container!.firstElementChild).toHaveClass("px-4");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Gedraaide nummers");
  });

  it.each([
    ["homepage", HeroSongs],
    ["history", RecentSongsPage],
  ])("refreshes %s history after 30 seconds and stops on unmount", async (_, Component) => {
    vi.mocked(fetch).mockImplementation(async () =>
      new Response(JSON.stringify({ songs: tracks, canAddToFavorites: true })));
    let view: ReturnType<typeof render>;
    await act(async () => { view = render(<Component />); });
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () => { vi.advanceTimersByTime(29999); });
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () => { vi.advanceTimersByTime(1); });
    expect(fetch).toHaveBeenCalledTimes(2);
    view!.unmount();
    await act(async () => { vi.advanceTimersByTime(30000); });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
