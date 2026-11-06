"use client";

import { useEffect, useState } from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { getFavoritesLocal, toggleFavoriteLocal, syncFavoriteToSupabase } from "@/helpers/favorites";

interface Props {
  customSongId: string;
  title: string;
  refreshKey?: boolean;
}

export default function PlayerFavoriteButton({ customSongId, title, refreshKey }: Props) {
  const [favorites, setFavorites] = useState<Record<string, true>>({});

  useEffect(() => {
    const update = () => setFavorites(getFavoritesLocal());
    update();
    window.addEventListener("focus", update);
    window.addEventListener("storage", update);
    window.addEventListener("player-favorites-changed", update);
    return () => {
      window.removeEventListener("focus", update);
      window.removeEventListener("storage", update);
      window.removeEventListener("player-favorites-changed", update);
    };
  }, [customSongId, refreshKey]);

  const toggleFavorite = () => {
    const next = toggleFavoriteLocal(customSongId);
    setFavorites(next);
    window.dispatchEvent(new Event("player-favorites-changed"));
    void syncFavoriteToSupabase(customSongId, !!next[customSongId]);
  };

  return (
    <button type="button" aria-label={`Favoriet: ${title}`} aria-pressed={!!favorites[customSongId]} onClick={toggleFavorite} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${favorites[customSongId] ? "text-red-500" : "text-gray-500"}`}>
      {favorites[customSongId] ? <MdFavorite size={25} /> : <MdFavoriteBorder size={25} />}
    </button>
  );
}
