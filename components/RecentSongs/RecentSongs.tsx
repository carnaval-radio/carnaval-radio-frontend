import React, { Fragment, useEffect, useState } from "react";
import { MdMusicNote, MdFavorite, MdFavoriteBorder, MdComment } from "react-icons/md";
import DateAndTime from "../DateAndTime";
import RecentSongsLoading from "../LoadingSkeleten/RecentSongsLoading";
import { RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";
import SongCover from "../SongCover";
import FormateTitle from "../FormatTitle";
import { getFavoritesLocal, toggleFavoriteLocal, syncFavoriteToSupabase } from "@/helpers/favorites";
import SongCommentsModal from "../Comments/SongCommentsModal";


type RecentSongsProps = {
  recentTracks: RecentSong[];
  loading: boolean;
  maxTracks?: number; // 10 is the default and the maximum
  canAddToFavorites?: boolean;
};

const RecentSongs: React.FC<RecentSongsProps> = ({
  recentTracks,
  loading = null,
  maxTracks = 10,
  canAddToFavorites = false,
}) => {
  const [favorites, setFavorites] = useState<Record<string, true>>({});
  const [commentsModalOpen, setCommentsModalOpen] = useState<string | null>(null);

  useEffect(() => {
    setFavorites(getFavoritesLocal());
  }, []);

  const handleToggleFavorite = async (customSongId: string) => {
    const next = toggleFavoriteLocal(customSongId);
    setFavorites(next); // optimistic UI
    const makeFavorite = !!next[customSongId];
    syncFavoriteToSupabase(customSongId, makeFavorite).catch(() => {});
  };

  return (
    <div>
      {!loading ? (
        <>
          {recentTracks?.map((recentSong: RecentSong, i: number) => (
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
                    <div className="flex items-center gap-2">
                      {recentSong.date && (
                        <div
                          className={`py-2 px-4 rounded-full ${
                            i % 2 !== 0
                              ? "bg-tertiaryShade_1"
                              : "bg-secondaryShade_1"
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
                      <button
                        type="button"
                        aria-label="Comments"
                        onClick={() => setCommentsModalOpen(recentSong.ID)}
                        className="ml-2 text-xl text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <MdComment />
                      </button>
                      {canAddToFavorites && (
                        <button
                          type="button"
                          aria-label="Toggle favorite"
                          onClick={() => handleToggleFavorite(recentSong.ID)}
                          className={`ml-2 text-xl ${
                            favorites[recentSong.ID]
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        >
                          {favorites[recentSong.ID] ? <MdFavorite /> : <MdFavoriteBorder />}
                        </button>
                      )}
                    </div>
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

      {/* Comments Modal */}
      {commentsModalOpen && (
        <SongCommentsModal
          customSongId={commentsModalOpen}
          songTitle={recentTracks.find((s) => s.ID === commentsModalOpen)?.title || ""}
          songArtist={recentTracks.find((s) => s.ID === commentsModalOpen)?.artist || ""}
          isOpen={!!commentsModalOpen}
          onClose={() => setCommentsModalOpen(null)}
        />
      )}
    </div>
  );
};

export default RecentSongs;
