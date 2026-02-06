import React from "react";
import Image from "next/image";
import { getInitials, getRandomColor } from "@/helpers/randomColor";

interface Props {
  url: string;
  artist: string;
  type?: string;
}



const SongCover = ({ url, artist, type = "hero" }: Props) => {
  const nocover =
    "https://ams1.reliastream.com/static/scarna00/covers/nocover.png";

  const isNocover = url === nocover;
  const initials = getInitials(artist);
  const backgroundColor = isNocover ? getRandomColor(artist) : "transparent";

  const commonClasses = `rounded-md ${
    type === "hero" ? "h-14 w-14" : "h-16 w-16"
  }`;

  return (
    <div
      style={{ backgroundColor }}
      className={`${commonClasses} flex items-center justify-center flex-shrink-0`}
    >
      {isNocover ? (
        <h3 className="text-xl font-semibold text-white">{initials}</h3>
      ) : (
        <Image
          src={url}
          alt={artist}
          height={100}
          width={100}
          className={`${commonClasses} object-cover`}
        />
      )}
    </div>
  );
};

export default SongCover;
