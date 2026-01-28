import React, { RefObject } from "react";
import Spinner from "../../components/Spinner";

interface UploadFormProps {
  files: File[];
  setFiles: (files: File[]) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  error: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (name: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ files, setFiles, fileInputRef, error, loading, onSubmit, name, setName }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles(selected.slice(0, 10));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Naam (optioneel) (bijv. LVK 2026 - Jeroen)"
        value={name}
        onChange={e => setName(e.target.value)}
        className="block w-full border rounded p-2"
        maxLength={40}
      />
      <input
        id="music-upload-file"
        type="file"
        accept="audio/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="block w-full border rounded p-2"
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded w-full flex items-center justify-center"
        disabled={loading || files.length === 0}
      >
        {loading ? <Spinner /> : `Uploaden (${files.length}/10)`}
      </button>
    </form>
  );
};

export default UploadForm;
