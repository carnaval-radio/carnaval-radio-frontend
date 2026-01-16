"use client";

import React, { useEffect, useState } from "react";
import { MdComment } from "react-icons/md";
import { Indie } from "@/app/fonts/font";
import SongCommentsModal from "@/components/Comments/SongCommentsModal";

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

export default function AllCommentsPage() {
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsModalOpen, setCommentsModalOpen] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<{ title: string; artist: string } | null>(null);

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    try {
      const response = await fetch("/api/interactions/all-comments");
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const result = await response.json();
      if (result.comments) {
        setComments(result.comments);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading all comments:", err);
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

    return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
  }

  function handleCommentClick(customSongId: string, title: string, artist: string) {
    setSelectedSong({ title, artist });
    setCommentsModalOpen(customSongId);
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-8 md:px-20 lg:px-24 xl:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <MdComment className="text-4xl text-secondary" />
            <h1 className={`text-center text-4xl font-semibold ${Indie.className}`}>
              Alle reacties
            </h1>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse p-4 rounded-lg bg-gray-100">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-8 md:px-20 lg:px-24 xl:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <MdComment className="text-4xl text-secondary" />
            <h1 className={`text-center text-4xl font-semibold ${Indie.className}`}>
              Alle reacties
            </h1>
          </div>
          <p className="text-center text-gray-500 py-8">
            Nog geen reacties. Wees de eerste! Klik op 't 💬 icoon bij een nummer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-8 md:px-20 lg:px-24 xl:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MdComment className="text-4xl text-secondary" />
          <h1 className={`text-center text-4xl font-semibold ${Indie.className}`}>
            Alle reacties
          </h1>
        </div>
        
        <p className="text-center text-sm text-gray-600 mb-8">
          {comments.length} {comments.length === 1 ? "reactie" : "reacties"} • Klik óm te reageren
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comments.map((comment) => (
            <button
              key={comment.id}
              onClick={() => handleCommentClick(comment.song.custom_song_id, comment.song.title, comment.song.artist)}
              className="w-full text-left p-4 rounded-lg transition-all border shadow-sm hover:shadow-md group bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 hover:from-white hover:to-white hover:border-gray-200"
            >
              <p className="text-md text-gray-900 group-hover:text-secondary italic mb-3 line-clamp-3">
                "{comment.content}"
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary group-hover:text-gray-800 group-hover:bg-none">
                    {comment.song.title}
                  </span>
                  <span className="text-gray-400"> • </span>
                  <span className="text-gray-600">
                    {comment.song.artist}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 whitespace-nowrap">{formatDate(comment.created_at)}</span>
                  <MdComment className="text-primary group-hover:text-gray-400 transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
          <p className="text-center text-sm text-gray-700">
            <span className="font-semibold">Wil je ook reageren?</span> Klik óp 't comment-icoon bij een liedje!
          </p>
        </div>
      </div>

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
    </div>
  );
}
