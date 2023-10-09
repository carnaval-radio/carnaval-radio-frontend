"use client";
import React, { useEffect, useState } from "react";
import { BsFileMusicFill } from "react-icons/bs";
import { Indie } from "../fonts/font";
import RecentSongs from "@/components/RecentSongs";
import { RecentSong, fetchSongs } from "@/GlobalState/ApiCalls/fetchSongs";

const page = () => {
  const [recentTracks, setRecentTracks] = useState<RecentSong[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Boolean>(false);

  const fetchTracks = async () => {
    try {
      const modifiedTracks = await fetchSongs()

      setRecentTracks(modifiedTracks);
      setLoading(false);
    } catch (error) {
      setError(true);
    }
  };
  useEffect(() => {
    document.title = "Recente nummers | 24/7 Vasteloavend Muzieek";
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
