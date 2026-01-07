"use client";

import React, { useEffect, useState } from "react";
import { MdComment } from "react-icons/md";
import { Indie } from "@/app/fonts/font";
import SongCommentsModal from "./Comments/SongCommentsModal";

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
  const [commentsModalOpen, setCommentsModalOpen] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<{ title: string; artist: string } | null>(null);

  useEffect(() => {
    loadComments();
    const interval = setInterval(loadComments, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function loadComments() {
    try {
      const response = await fetch("/api/interactions/recent-comments", { cache: "no-store" });
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
      console.error("Error loading recent comments:", err);
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

  if (loading) {
    return (
      <div className="flex flex-col py-8 px-2 sm:px-4 md:px-8 lg:px-8 xl:px-8 rounded-xl shadow-lg bg-gradient-to-br from-gradientStart to-gradientEnd">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MdComment className="text-2xl text-secondary" />
          <h2 className={`text-center text-2xl font-semibold ${Indie.className}`}>
            Letste reäksies
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col py-8 px-2 sm:px-4 md:px-8 lg:px-8 xl:px-8 rounded-xl shadow-lg bg-white">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MdComment className="text-2xl text-secondary" />
          <h2 className={`text-center text-2xl font-semibold ${Indie.className}`}>
            Wat vinje d'r van?
          </h2>
        </div>
        <p className="text-center text-gray-500 py-4">Nog gein reäksies. Wees de ieëste! Klik op 't 💬 icoon bij een nummer.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-8 px-2 sm:px-4 md:px-8 lg:px-8 xl:px-8 rounded-xl shadow-lg bg-white">
      <div className="flex items-center justify-center gap-2 mb-4">
        <MdComment className="text-2xl text-secondary" />
        <h2 className={`text-center text-2xl font-semibold ${Indie.className}`}>
          Wat vins ze d'r van?
        </h2>
      </div>
      
      <p className="text-center text-sm text-gray-600 mb-4">
        Letste reaksies • Klik óm te reageren
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        {comments.map((comment) => (
          <button
            key={comment.id}
            onClick={() => handleCommentClick(comment.song.custom_song_id, comment.song.title, comment.song.artist)}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 transition-all border border-gray-200 hover:border-primary/30 hover:shadow-md group"
          >
            <p className="text-sm text-gray-700 italic mb-2 line-clamp-2 group-hover:text-gray-900">
              "{comment.content}"
            </p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex-1 min-w-0 mr-2">
                <span className="font-semibold text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary">
                  {comment.song.title}
                </span>
                <span className="text-gray-400"> • </span>
                <span className="text-gray-600">
                  {comment.song.artist}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 whitespace-nowrap">{formatDate(comment.created_at)}</span>
                <MdComment className="text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-dashed border-primary/30">
        <p className="text-center text-sm text-gray-700">
          💬 <span className="font-semibold">Wil je ook reageren?</span> Klik óp 't comment-icoon bij ein nummer!
        </p>
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
