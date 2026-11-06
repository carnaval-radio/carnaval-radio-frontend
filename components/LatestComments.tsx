"use client";

import React, { useEffect, useState } from "react";
import { MdComment } from "react-icons/md";
import { FaArrowRight, FaQuoteLeft, FaMusic } from "react-icons/fa";
import ImageWithFallback from "./constants/ImageWithFallback";
import SongCommentsModal from "./Comments/SongCommentsModal";
import Link from "next/link";
import { Indie } from "@/app/fonts/font";

interface RecentComment {
  id: string;
  content: string;
  created_at: string;
  song: {
    custom_song_id: string;
    title: string;
    cover_url: string | null;
    artist: string;
  };
}

export default function LatestComments() {
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<{ title: string; artist: string } | null>(null);

  useEffect(() => {
    loadComments();
    // Reduced from 60s to 10 minutes (600,000ms) - comments don't need real-time updates
    const interval = setInterval(loadComments, 600000);
    return () => clearInterval(interval);
  }, []);

  async function loadComments() {
    try {
      const response = await fetch("/api/interactions/recent-comments");
      if (!response.ok) {
        console.error("Error loading recent comments:", response.status);
        setError(true);
        setLoading(false);
        return;
      }

      const result = await response.json();
      if (result.comments) {
        setComments(result.comments);
      }
      setError(false);
      setLoading(false);
    } catch (err) {
      console.error("Error loading recent comments:", err);
      setError(true);
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "zojuist";
    if (diffMins < 60) return `${diffMins} min geleden`;
    if (diffHours < 24) return `${diffHours} uur geleden`;
    if (diffDays < 7) return `${diffDays} dag${diffDays > 1 ? "en" : ""} geleden`;

    return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  }

  function handleCommentClick(customSongId: string, title: string, artist: string) {
    setSelectedSong({ title, artist });
    setCommentsModalOpen(customSongId);
  }

  return (
    <section aria-labelledby="latest-comments-title" className="sm:py-6">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-6 sm:gap-5">
        <div className="flex min-w-0 items-center gap-2">
          <MdComment aria-hidden="true" className="text-2xl text-secondary" />
          <h2 id="latest-comments-title" className={`text-2xl font-semibold sm:text-3xl ${Indie.className}`}>Laatste reacties</h2>
        </div>
        <Link href="/reacties" aria-label="Alle reacties" className="flex shrink-0 items-center gap-2 rounded-full bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary hover:bg-secondary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:px-5 sm:py-3 sm:text-base">
          <span className="sm:hidden">Alles</span><span className="hidden sm:inline">Alle reacties</span> <FaArrowRight aria-hidden="true" />
        </Link>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-red-700">Reacties konden niet worden geladen. Probeer het opnieuw.</p>}
      {loading ? (
        <div role="status" aria-label="Reacties laden" className="grid auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto sm:grid-flow-row sm:grid-cols-2 sm:auto-cols-auto sm:overflow-visible lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white p-5"><div className="mb-3 h-4 w-3/4 rounded bg-gray-200" /><div className="h-4 w-1/2 rounded bg-gray-100" /></div>)}
        </div>
      ) : comments.length === 0 ? (
        !error && <p className="rounded-2xl bg-white p-6 text-gray-600">Nog geen reacties. Vertel ons wat jouw favoriete nummer bijzonder maakt!</p>
      ) : (
      <div role="region" aria-label="Recente reacties" tabIndex={0} className="grid auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid-flow-row sm:grid-cols-2 sm:auto-cols-auto sm:overflow-visible lg:grid-cols-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        {comments.slice(0, 3).map((comment, index) => (
          <button
            key={comment.id}
            type="button"
            aria-label={`Bekijk reacties op ${comment.song.title} van ${comment.song.artist}`}
            onClick={() => handleCommentClick(comment.song.custom_song_id, comment.song.title, comment.song.artist)}
            className={`group flex min-w-0 snap-start flex-col rounded-2xl border-t-4 p-4 sm:p-5 text-left shadow-sm hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              index === 0 ? "border-orange-400 bg-gradient-to-br from-orange-100 to-amber-50"
                : index === 1 ? "border-rose-400 bg-gradient-to-br from-rose-100 to-orange-50"
                : "border-emerald-400 bg-gradient-to-br from-emerald-100 to-lime-50"
            }`}
          >
            <div className="mb-3 flex w-full items-center justify-between gap-2">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/70 ${
                index === 0 ? "text-orange-600" : index === 1 ? "text-rose-600" : "text-emerald-600"
              }`}><FaQuoteLeft aria-hidden="true" /></span>
              <time dateTime={comment.created_at} className="text-xs text-gray-600">{formatDate(comment.created_at)}</time>
            </div>
            <p className="mb-5 line-clamp-3 break-words text-base leading-relaxed text-gray-800">
              {comment.content}
            </p>
            <div className="mt-auto flex w-full items-center gap-3 rounded-xl bg-white/70 p-3">
              {comment.song.cover_url ? (
                <ImageWithFallback src={comment.song.cover_url} fallbackSrc="/logo.png" alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FaMusic aria-hidden="true" /></span>
              )}
              <div className="min-w-0 flex-1">
                <span className="block break-words text-sm font-semibold text-gray-900 group-hover:text-primary">{comment.song.title}</span>
                <span className="block break-words text-sm text-gray-500">{comment.song.artist}</span>
              </div>
              <FaArrowRight aria-hidden="true" className="shrink-0 text-primary" />
            </div>
          </button>
        ))}
      </div>
      )}
      <p className="mt-5 hidden items-start gap-2 text-sm text-gray-600 sm:flex"><MdComment aria-hidden="true" className="mt-1 shrink-0 text-secondary" />Praat mee: klik op een reactie of het reactie-icoon bij een liedje.</p>

      {/* Comments Modal */}
      {commentsModalOpen && selectedSong && (
        <SongCommentsModal
          customSongId={commentsModalOpen}
          songTitle={selectedSong.title}
          songArtist={selectedSong.artist}
          isOpen={!!commentsModalOpen}
          onClose={() => {
            setCommentsModalOpen(null);
            setSelectedSong(null);
            loadComments(); // Refresh after modal closes
          }}
        />
      )}
    </section>
  );
}
