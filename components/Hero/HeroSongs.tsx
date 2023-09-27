"use client";
import React, { useEffect, useState } from "react";
import { BsFileMusicFill } from "react-icons/bs";
import Link from "next/link";
import axios from "axios";
import { Indie } from "@/app/fonts/font";
import RecentSongs from "../RecentSongs";
import { splitTitle } from "@/helpers/utils";

const HeroSongs = () => {
  const [recentTracks, setRecentTracks] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Boolean>(false);

  const fetchTracks = async () => {
    try {
      const response = await axios.get(
        "https://ams1.reliastream.com/recentfeed/scarna00/json"
      );

      const modifiedTracks = response.data.items.map((item: any) => ({
        ...item,
        titleParts: splitTitle(item.title),
      }));

      setRecentTracks(modifiedTracks);
      setLoading(false);
    } catch (error) {
      setError(true);
    }
  };
  
  useEffect(() => {
    fetchTracks();
    const interval = setInterval(fetchTracks, 30000);
    return () => clearInterval(interval);
  }, [error]);

  return (
    <div className="flex flex-col py-8 px-2 sm:px-4 md:px-8 lg:px-8 xl:px-8 rounded-xl min-w-[30vw] shadow-lg md:ml-5">
      <div className="flex items-center justify-center gap-2 mb-4">
        <BsFileMusicFill className="text-2xl text-secondary" />
        <h2 className={`text-center text-2xl font-semibold ${Indie.className}`}>
          Gedraaide nummers
        </h2>
      </div>
      <RecentSongs loading={loading} recentTracks={recentTracks} maxTracks={4} />      
      <Link
        href="/gedraaide-nummers"
        className="bg-gradient-to-r text-center from-primary to-secondary rounded-lg mt-8 py-3 px-4 text-white font-semibold"
      >
        Meer gedraaide nummers
      </Link>
    </div>
  );
};

export default HeroSongs;
