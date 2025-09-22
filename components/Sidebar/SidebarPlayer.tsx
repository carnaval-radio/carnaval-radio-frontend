"use client";
import React from "react";
import { GiSpeaker, GiSpeakerOff } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { setMuted, setPlay } from "@/GlobalState/features/PlayerSlice";
import { GlobalState } from "@/GlobalState/GlobalState";

const SidebarPlayer = () => {
  const dispatch = useDispatch();
  const { isPlaying, muted, songTitle } = useSelector(
    (state: GlobalState) => state.Player
  );

  const updateSongTitle = (title: string) => {
    const arr = title.split(" ");
    const titleArr = [arr[0], arr[1], arr[2]];
    const finalTitle = titleArr.join(" ");
    if (arr.length > 3) return <p className="text-sm text-menuText">{finalTitle}...</p>;
    else return <p className="text-sm text-menuText">{finalTitle}</p>;
  };

  return (
    <>
      {true && (
        <div className="flex items-center justify-between mt-2 border-[3px] border-white rounded-2xl py-2 px-4 bg-gradient-to-r to-secondaryShade_1 from-tertiaryShade_2 mx-2">
          {muted ? (
            <GiSpeakerOff
              onClick={() => dispatch(setMuted())}
              className="text-3xl text-black cursor-pointer"
            />
          ) : (
            <GiSpeaker
              onClick={() => dispatch(setMuted())}
              className="text-3xl text-black cursor-pointer"
            />
          )}
          {songTitle && updateSongTitle(songTitle)}
          <div
            onClick={() => dispatch(setPlay())}
            className="sm:flex md::flex lg:flex xl:flex items-center justify-center p-[2px] bg-black rounded-full text-secondary text-secondary cursor-pointer"
          >
            {isPlaying ? (
              <BsFillPauseFill size={18} />
            ) : (
              <BsFillPlayFill size={18} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarPlayer;
