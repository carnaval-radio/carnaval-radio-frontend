"use client";
import React, { useEffect, useState } from "react";
import { BsFileMusicFill } from "react-icons/bs";
import { Indie } from "../fonts/font";
import RecentSongs from "@/components/RecentSongs";
import { RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";

export const fetchCache = 'force-no-store';

const page = () => {
  const [recentTracks, setRecentTracks] = useState<RecentSong[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Boolean>(false);

  const fetchTracks = async () => {
    try {
      const res = await fetch("/api/songs", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const recentTracks = await res.json();
      setRecentTracks(recentTracks);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
      setError(true);
    }
  };
  useEffect(() => {
    document.title = "Recente nummers | Carnaval Radio | 24/7 Vasteloavend Muzieek";
    fetchTracks();
    const interval = setInterval(fetchTracks, 60000);
    return () => clearInterval(interval);
  }, [error]);
  return (
    <div className="p-10">
      <div className="flex items-center gap-2 mb-4">
        <BsFileMusicFill className="text-2xl text-secondary" />
        <h2 className={`text-center text-2xl font-semibold ${Indie.className}`}>
          Gedraaide nummers
        </h2>
      </div>
      <RecentSongs loading={loading} recentTracks={recentTracks} />
    </div>
  );
};

export default page;
