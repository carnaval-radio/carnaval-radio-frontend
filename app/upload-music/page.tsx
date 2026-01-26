"use client";

import React, { useState, useRef } from "react";
import PasswordForm from "../../components/upload/PasswordForm";
import UploadForm from "../../components/upload/UploadForm";
import UploadResults from "../../components/upload/UploadResults";


// Note: Cannot set metadata (robots) in a client component. If needed, set in a parent layout or server component.

export default function UploadMusicPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ name: string; status: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File change logic is now in UploadForm

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

    import UploadMusicClient from "../../components/upload/UploadMusicClient";

    export default function UploadMusicPage() {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-heroBackground">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-primary mb-4">Carnaval Radio Muziek Upload</h1>
            <UploadMusicClient />
          </div>
        </div>
      );
    }
        const data = await res.json();
