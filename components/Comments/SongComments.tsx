"use client";

import { useState, useEffect } from "react";
import { getOrCreateDeviceId } from "@/helpers/deviceId";

interface Comment {
  id: string;
  content: string | null;
  user_id: string;
  created_at: string;
}

interface SongCommentsProps {
  customSongId: string;
}

export default function SongComments({ customSongId }: SongCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    setDeviceId(getOrCreateDeviceId());
    loadComments();
  }, [customSongId]);

  async function loadComments() {
    try {
      const response = await fetch(`/api/interactions/comment?custom_song_id=${customSongId}`);
      if (!response.ok) return;
      
      const result = await response.json();
      if (result.comments) {
        setComments(result.comments);
      }
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/interactions/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_song_id: customSongId,
          device_id: deviceId,
          content: newComment,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.error || "Er ging iets mis");
        setLoading(false);
        return;
      }

      setNewComment("");
      await loadComments();
    } catch (err) {
      setError("Er ging iets mis");
      console.error("Error posting comment:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Weet je zeker dat je deze comment wilt verwijderen?")) return;

    try {
      const response = await fetch("/api/interactions/comment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_id: commentId,
          device_id: deviceId,
        }),
      });

      if (response.ok) {
        await loadComments();
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
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

  // Always render the UI, even if Supabase is not configured
  // The API endpoints will handle validation
  return (
    <div>
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Enne?... (10-300 tekens, max 1 per half uur)"
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          maxLength={300}
          disabled={loading}
        />
        <div className="flex justify-between items-center mt-2">
          <span className={`text-sm ${newComment.length > 300 ? "text-red-500" : "text-gray-500"}`}>
            {newComment.length}/300
          </span>
          <button
            type="submit"
            disabled={loading || newComment.trim().length < 10}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Plaatsen..." : "Plaatsen"}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>

      {/* Comments List */}
      <div>
        <h3 className="text-lg font-bold mb-4">Reaksies ({comments.length})</h3>
        <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nog gein reaksies. Wees de ieëste!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap break-words">{comment.content || ""}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                {comment.user_id === deviceId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Verwijderen
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
}
