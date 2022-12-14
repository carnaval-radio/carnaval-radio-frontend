import React, { useRef } from "react";
import {
  FiRepeat,
  FiPlayCircle,
  FiPause,
  FiFastForward,
  FiRewind,
} from "react-icons/fi";

const PlayerControls = ({
  audioElem,
  isPlaying,
  setIsPlaying,
  currentTrack,
  setCurrentTrack,
  tracks,
}) => {
  const clickRef = useRef();
  const PlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const forwardSeekBar = (e) => {
    let width = clickRef.current.clientWidth;
    const offset = e.nativeEvent.offsetX;

    const trackProgress = (offset / width) * 100;
    audioElem.current.currentTime = (trackProgress / 100) * currentTrack.length;
  };

  const skipBack = () => {
    const index = tracks.findIndex((x) => x.url == currentTrack.url);
    if (index == 0) {
      setCurrentTrack(tracks[tracks.length - 1]);
    } else {
      setCurrentTrack(tracks[index - 1]);
    }

    audioElem.current.currentTime = 0;
  };

  const skipNext = () => {
    const index = tracks.findIndex((x) => x.url == currentTrack.url);
    if (index == tracks.length - 1) {
      setCurrentTrack(tracks[0]);
    } else {
      setCurrentTrack(tracks[index + 1]);
    }

    audioElem.current.currentTime = 0;
  };

  return (
    <div className="flex flex-row items-center justify-between bg-[#1DC724] w-full h-[6rem] px-10 fixed bottom-0">
      <div>
        <FiRepeat size={30} />
      </div>
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="min-w-[100%] h-[5px] rounded-[30px] cursor-pointer bg-white">
          <div
            onClick={forwardSeekBar}
            ref={clickRef}
            className=" h-[100%] bg-red-400 rounded-[30px]"
            style={{ width: `${currentTrack.progress + "%"}` }}
          ></div>
        </div>
        <div className="flex space-x-10 items-center justify-center">
          <FiRewind size={40} onClick={skipBack} />
          <div onClick={PlayPause}>
            {isPlaying ? <FiPause size={60} /> : <FiPlayCircle size={60} />}
          </div>
          <FiFastForward size={40} onClick={skipNext} />
        </div>
      </div>
      <div>{currentTrack.title}</div>
    </div>
  );
};

export default PlayerControls;
