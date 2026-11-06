import React, { Fragment, useEffect, useState } from "react";
import { MdMusicNote, MdFavorite, MdFavoriteBorder, MdComment } from "react-icons/md";
import DateAndTime from "../DateAndTime";
import RecentSongsLoading from "../LoadingSkeleten/RecentSongsLoading";
import { RecentSong } from "@/GlobalState/ApiCalls/fetchSongs";
import SongCover from "../SongCover";
import { getFavoritesLocal, toggleFavoriteLocal, syncFavoriteToSupabase } from "@/helpers/favorites";
import SongCommentsModal from "../Comments/SongCommentsModal";


type RecentSongsProps = {
  recentTracks: RecentSong[];
  loading: boolean;
  maxTracks?: number; // 10 is the default and the maximum
  canAddToFavorites?: boolean;
  denseDate?: boolean;
};

const RecentSongs: React.FC<RecentSongsProps> = ({
  recentTracks,
  loading = null,
  maxTracks = 10,
  denseDate = false,
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
                  <div className="flex items-center justify-between gap-2 p-2">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <SongCover
                        url={recentSong.url}
                        artist={recentSong.artist}
                        type="hero"
                      />
                      <MdMusicNote
                        size={24}
                        className="hidden shrink-0 sm:inline-block md:inline-block lg:hidden xl:inline-block"
                      />
                      <div className="min-w-0">
                        <p className="break-words text-base">
                          {recentSong.title}
                        </p>
                        <p className="break-words text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                          {recentSong.artist}
                        </p>
                        {recentSong.date && (
                          <div className="mt-1 sm:hidden">
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-sm tabular-nums ${
                                i % 2 !== 0
                                  ? "bg-tertiaryShade_1 text-tertiary"
                                  : "bg-secondaryShade_1 text-secondary"
                              }`}
                            >
                              <DateAndTime timestamp={recentSong.date} dense={denseDate} compact />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col-reverse items-center gap-1 sm:flex-row sm:gap-2">
                      {recentSong.date && (
                        <div
                          className={`hidden rounded-full px-4 py-2 sm:block ${
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
                            <DateAndTime timestamp={recentSong.date} dense={denseDate} />
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        aria-label={`Reacties: ${recentSong.title}`}
                        onClick={() => setCommentsModalOpen(recentSong.ID)}
                        className="flex h-9 w-9 items-center justify-center text-lg text-gray-300 transition-colors hover:text-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary sm:ml-2 sm:h-auto sm:w-auto sm:text-xl sm:text-gray-400"
                      >
                        <MdComment />
                      </button>
                      {canAddToFavorites && (
                        <button
                          type="button"
                          aria-label={`Favoriet: ${recentSong.title}`}
                          aria-pressed={!!favorites[recentSong.ID]}
                          onClick={() => handleToggleFavorite(recentSong.ID)}
                          className={`flex h-9 w-9 items-center justify-center text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary sm:ml-2 sm:h-auto sm:w-auto ${
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
