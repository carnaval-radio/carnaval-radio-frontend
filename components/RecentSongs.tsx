import React, { Fragment } from "react";
import { MdMusicNote } from "react-icons/md";
import DateAndTime from "./DateAndTime";
import RecentSongsLoading from "./LoadingSkeleten/RecentSongsLoading";
import { RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";
import SongCover from "./SongCover";
import FormateTitle from "./FormatTitle";

type RecentSongsProps = {
  recentTracks: RecentSong[];
  loading: boolean;
  maxTracks?: number; // 10 is the default and the maximum
};

const RecentSongs: React.FC<RecentSongsProps> = ({
  recentTracks,
  loading = null,
  maxTracks = 10,
}) => {
  return (
    <div>
      {!loading ? (
        <>
          {recentTracks?.map((recentSong: RecentSong, i: any) => (
            <Fragment key={"frag" + i}>
              {i < maxTracks && (
                <div key={"div" + i} className="flex flex-col">
                  <div className="flex items-center justify-between p-2">
                    <div className="flex space-x-3">
                      <SongCover
                        url={recentSong.url}
                        artist={recentSong.artist}
                        type="hero"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <MdMusicNote
                            size={24}
                            className="mr-2 hidden sm:inline-block md:inline-block lg:hidden xl:inline-block"
                          />{" "}
                          <div>
                            <FormateTitle text={recentSong.title} />
                            <div className="text-[16px] hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary hover:to-secondary font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                              <FormateTitle text={recentSong.artist} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {recentSong.date && (
                    <div
                      className={`py-2 px-4 rounded-full ${
                        i % 2 !== 0
                          ? "bg-tertiaryShade_1"
                          : "bg-secondayShade_1"
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          i % 2 !== 0 ? "text-tertiary" : "text-secondary"
                        }`}
                      >
                        <DateAndTime timestamp={recentSong.date} />
                      </p>
                    </div>
                    )}
                  </div>
                  <div className="w-full h-[1px] bg-gray-200"></div>
                </div>
              )}
            </Fragment>
          ))}
        </>
      ) : (
        <RecentSongsLoading />
      )}
    </div>
  );
};

export default RecentSongs;
