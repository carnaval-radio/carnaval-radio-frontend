"use client";

import React, { useState } from "react";
import Spinner from "../../components/Spinner";

export default function UploadMusicPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("Selecteer een bestand.");
      return;
    }
    setLoading(true);
    setStatus(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    const res = await fetch("/api/upload-music", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    setStatus(data.message);
    if (res.ok) {
      setFile(null);
      setPassword("");
      // Optionally reset file input value
      const fileInput = document.getElementById("music-upload-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    }
  };

  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-heroBackground">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-primary mb-4">Carnaval Radio Muziek Upload</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              id="music-upload-file"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full border rounded p-2"
            />
            <input
              type="password"
              placeholder="Wachtwoord"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="block w-full border rounded p-2"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded w-full flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Uploaden"}
            </button>
          </form>
          {status && <div className="mt-4 text-center text-sm text-gray-700">{status}</div>}
        </div>
      </div>
    </>
  );
}
