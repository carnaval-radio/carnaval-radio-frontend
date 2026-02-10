"use client";

import { useState } from "react";
import HeroSlider from "./HeroSlider";
import HeroYoutubeMovie from "./HeroYoutubeMovie";
import { Slide } from "@/types/slideTypes";
import { MdSwapHorizontalCircle } from "react-icons/md";

interface HeroToggleSwitchProps {
  slides: Slide[];
  showAfterMovie: boolean;
}

const HeroToggleSwitch = ({
  slides,
  showAfterMovie,
}: HeroToggleSwitchProps) => {
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const [showMovie, setShowMovie] = useState<boolean>(true);

  const handleToggle = () => {
    setShowSlider((prev) => !prev);
    setShowMovie((prev) => !prev);
  };

  return (
    <>
      <div className=" flex flex-col h-full w-full transition-all duration-500">
        {showMovie && showAfterMovie ? (
          <HeroYoutubeMovie />
        ) : (
          <HeroSlider slides={slides} />
        )}
      </div>

      {showAfterMovie && (
        <div
          className="absolute -bottom-5 left-1/2 -mx-3 flex items-center justify-center cursor-pointer"
          onClick={handleToggle}
        >
          <div className="relative flex justify-center items-center bg-heroBackground rounded-full">
            <MdSwapHorizontalCircle
              className={`opacity-70 w-10 h-10 transition-transform duration-300 text-tertiary ${
                showMovie ? "rotate-180" : "rotate-0"
              }`}
              style={{ fontSize: "1.5rem" }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default HeroToggleSwitch;
