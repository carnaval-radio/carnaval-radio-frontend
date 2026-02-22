"use client";

import { BsFileMusicFill } from "react-icons/bs";
import { Indie } from "../../app/fonts/font";
import { RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";
import { useEffect, useState } from "react";
import RecentSongs from "./RecentSongs";

const limit = 50;

const RecentSongsPage = () => {
  const [recentTracks, setRecentTracks] = useState<RecentSong[]>([]);
  const [canAddToFavorites, setCanAddToFavorites] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Boolean>(false);

  const fetchTracks = async () => {
    try {
      const res = await fetch(`/api/songs?limit=${limit}`, {
        // Changed from no-store to allow browser caching (API has 60s revalidate)
        cache: "default",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setRecentTracks(data.songs || []);
      setCanAddToFavorites(!!data.canAddToFavorites);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
      setError(true);
    }
  };
  useEffect(() => {
    document.title =
      "Recente Nummers | Carnaval Radio Brunssum - Laatste Vastelaovend Hits";
    fetchTracks();
    // Reduced from 60s to 5 minutes (300,000ms) - recent songs don't need constant updates
    const interval = setInterval(fetchTracks, 300000);
    return () => clearInterval(interval);
  }, [error]);
  return (
    <div className="p-10">
      <div className="flex items-center gap-2 mb-4">
        <BsFileMusicFill className="text-2xl text-secondary" />
        <h1 className={`text-center text-2xl font-semibold ${Indie.className}`}>
          Gedraaide nummers
        </h1>
      </div>
      <RecentSongs
        loading={loading}
        recentTracks={recentTracks}
        maxTracks={limit}
        canAddToFavorites={canAddToFavorites}
      />
    </div>
  );
};

export default RecentSongsPage;