"use client";

import React, { useState, useRef } from "react";
import PasswordForm from "./PasswordForm";
import UploadForm from "./UploadForm";
import UploadResults from "./UploadResults";

export default function UploadMusicClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ name: string; status: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setPasswordEntered(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) {
      setError("Selecteer tot 10 bestanden.");
      return;
    }
    setLoading(true);
    setUploadResults([]);
    setError(null);

    // Upload all files in parallel
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);
      try {
        const res = await fetch("/api/upload-music", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return { name: file.name, status: data.message || (res.ok ? "Succesvol geüpload" : "Fout bij uploaden") };
      } catch (err) {
        return { name: file.name, status: "Netwerkfout" };
      }
    });

    const results = await Promise.all(uploadPromises);
    setUploadResults(results);
    setLoading(false);
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadMore = () => {
    setFiles([]);
    setUploadResults([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {!passwordEntered ? (
        <PasswordForm
          password={password}
          setPassword={setPassword}
          onSubmit={handlePasswordSubmit}
        />
      ) : uploadResults.length === 0 ? (
        <UploadForm
          files={files}
          setFiles={setFiles}
          fileInputRef={fileInputRef}
          error={error}
          loading={loading}
          onSubmit={handleUpload}
        />
      ) : (
        <UploadResults
          uploadResults={uploadResults}
          onUploadMore={handleUploadMore}
        />
      )}
    </>
  );
}