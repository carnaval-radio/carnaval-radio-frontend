"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  getFavoritesLocal,
  getFavoriteTimestamps,
  toggleFavoriteLocal,
  syncFavoriteToSupabase,
} from "@/helpers/favorites";
import SongCover from "@/components/SongCover";
import FormateTitle from "@/components/FormatTitle";
import DateAndTime from "@/components/DateAndTime";
import { getOrCreateDeviceId } from "@/helpers/deviceId";
import { BsFileMusicFill } from "react-icons/bs";
import { Indie } from "../fonts/font";

interface SongRow {
  id: string;
  custom_song_id: string;
  title: string;
  cover_url: string | null;
  artist: { name: string } | null;
  created_at?: string | null;
}

export default function FavoritesClient() {
  const [customIds, setCustomIds] = useState<string[]>([]);
  const [songs, setSongs] = useState<SongRow[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [ts, setTs] = useState<Record<string, number>>({});

  useEffect(() => {
    const map = getFavoritesLocal();
    const ids = Object.keys(map);
    setCustomIds(ids);
    setTs(getFavoriteTimestamps());
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const deviceId = getOrCreateDeviceId();
        const res = await fetch(
          `/api/favorites/songs?device_id=${encodeURIComponent(deviceId)}`,
          { cache: "no-store" }
        );
        if (!cancelled) {
          if (!res.ok) {
            setSongs(null);
          } else {
            const data: SongRow[] = await res.json();
            setSongs(Array.isArray(data) ? data : []);
          }
        }
      } catch {
        if (!cancelled) setSongs(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (customSongId: string) => {
    const next = toggleFavoriteLocal(customSongId);
    setCustomIds(Object.keys(next));
    setTs(getFavoriteTimestamps());
    setSongs((prev) =>
      prev ? prev.filter((s) => s.custom_song_id !== customSongId) : prev
    );
    syncFavoriteToSupabase(customSongId, false).catch(() => {});
  };

  const getAddedAt = (song: SongRow): number => {
    if (song.created_at) return new Date(song.created_at).getTime();
    const localTs = ts[song.custom_song_id];
    return typeof localTs === "number" ? localTs : 0;
  };

  const sortedSongs = useMemo(() => {
    if (!songs) return null;
    return [...songs].sort((a, b) => getAddedAt(b) - getAddedAt(a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(songs), JSON.stringify(ts)]);

  if (loading) {
    return <div className="p-4">Favorieten laden…</div>;
  }

  if (!customIds.length) {
    return <div className="p-4">Nog geen favorieten.</div>;
  }

  if (!sortedSongs || sortedSongs.length === 0) {
    return (
      <div className="p-4">
        <div className="text-gray">
          Sorry, we kunnen favorieten helaas niet laden op dit moment.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-0">
      {sortedSongs.map((song, i) => {
        const addedAt = getAddedAt(song) || undefined;
        return (
          <div key={song.id} className="flex flex-col">
            <div className="flex items-center justify-between p-2">
              <div className="flex space-x-3">
                <SongCover
                  url={
                    song.cover_url ||
                    "https://res.cloudinary.com/dwzn0q9wj/image/upload/c_thumb,w_200,g_face/v1672311200/logo_square_512_1_78657ec246.png"
                  }
                  artist={song.artist?.name || ""}
                  type="hero"
                />
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <div className="mr-2 hidden sm:inline-block md:inline-block lg:hidden xl:inline-block">
                      ❤
                    </div>
                    <div>
                      <FormateTitle text={song.title} />
                      <div className="text-[16px] hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary hover:to-secondary font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        <FormateTitle text={song.artist?.name || ""} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {addedAt && (
                  <div
                    className={`py-2 px-4 rounded-full ${
                      i % 2 !== 0 ? "bg-tertiaryShade_1" : "bg-secondaryShade_1"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        i % 2 !== 0 ? "text-tertiary" : "text-secondary"
                      }`}
                    >
                      <span className="mr-1">Toegevoegd:</span>
                      <DateAndTime timestamp={addedAt} />
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  aria-label="Verwijder favoriet"
                  onClick={() => handleDelete(song.custom_song_id)}
                  className="ml-2 text-sm text-gray-500 hover:text-red-600 border px-3 py-1 rounded"
                >
                  Verwijder
                </button>
              </div>
            </div>
            <div className="w-full h-[1px] bg-gray-200"></div>
          </div>
        );
      })}
    </div>
  );
}
