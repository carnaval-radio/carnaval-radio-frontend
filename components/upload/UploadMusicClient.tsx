"use client";

import React, { useState, useRef } from "react";
import PasswordForm from "./PasswordForm";
import UploadForm from "./UploadForm";
import UploadResults from "./UploadResults";

export default function UploadMusicClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ name: string; status: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setPasswordLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/validate-upload-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPasswordEntered(true);
      } else {
        setError(data.message || "Wachtwoord is onjuist.");
      }
    } catch (err) {
      setError("Netwerkfout bij valideren van wachtwoord.");
    }
    setPasswordLoading(false);
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
      if (name.trim()) {
        formData.append("name", name.trim());
      }
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
    // Do NOT reset name, so it is remembered
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {!passwordEntered ? (
        <>
          <PasswordForm
            password={password}
            setPassword={setPassword}
            onSubmit={handlePasswordSubmit}
          />
          {passwordLoading && (
            <div className="text-center text-sm text-gray-500 mt-2">Bezig met valideren...</div>
          )}
          {error && (
            <div className="text-center text-sm text-red-500 mt-2">{error}</div>
          )}
        </>
      ) : uploadResults.length === 0 ? (
        <UploadForm
          files={files}
          setFiles={setFiles}
          fileInputRef={fileInputRef}
          error={error}
          loading={loading}
          onSubmit={handleUpload}
          name={name}
          setName={setName}
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