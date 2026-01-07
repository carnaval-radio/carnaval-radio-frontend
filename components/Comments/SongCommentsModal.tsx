"use client";

import { useState } from "react";
import { MdClose } from "react-icons/md";
import SongComments from "./SongComments";

interface SongCommentsModalProps {
  customSongId: string;
  songTitle: string;
  songArtist: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SongCommentsModal({
  customSongId,
  songTitle,
  songArtist,
  isOpen,
  onClose,
}: SongCommentsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{songTitle}</h2>
            <p className="text-sm text-gray-600">{songArtist}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Sluiten"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Comments Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <SongComments customSongId={customSongId} />
        </div>
      </div>
    </div>
  );
}
