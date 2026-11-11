import React from "react";
import Image from "next/image";
import { enrichCover, isUnknownCover } from "@/GlobalState/ApiCalls/fetchSongs";
import { getInitials, getRandomColor } from "@/helpers/randomColor";

interface Props {
  url: string;
  artist: string;
  type?: string;
}
const SongCover = ({ url, artist, type = "hero" }: Props) => {
  const unknown = isUnknownCover(url);
  const commonClasses = `rounded-md ${
    type === "hero" ? "h-14 w-14" : "h-16 w-16"
  }`;

  return (
    <div
      style={{ backgroundColor: unknown ? getRandomColor(artist) : "transparent" }}
      className={`${commonClasses} flex items-center justify-center flex-shrink-0`}
    >
      {unknown ? (
        <h3 className="text-xl font-semibold text-white">{getInitials(artist)}</h3>
      ) : <Image
        src={enrichCover(url, { artist, title: "" })}
        alt={artist}
        height={100}
        width={100}
        className={`${commonClasses} object-cover`}
      />}
    </div>
  );
};

export default SongCover;
