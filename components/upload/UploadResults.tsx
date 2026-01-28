import React from "react";

interface UploadResult {
  name: string;
  status: string;
}

interface UploadResultsProps {
  uploadResults: UploadResult[];
  onUploadMore: () => void;
}


const UploadResults: React.FC<UploadResultsProps> = ({ uploadResults, onUploadMore }) => (
  <div className="space-y-4">
    <div className="mb-2 font-semibold">Uploadresultaten:</div>
    <ul className="text-sm">
      {uploadResults.map((result, idx) => {
        const statusLower = result.status.toLowerCase();
        // Match both 'succes' and 'geslaagd' for Dutch success
        const isSuccess = statusLower.includes("succes") || statusLower.includes("geslaagd");
        return (
          <li
            key={idx}
            className={`flex items-center gap-2 ${isSuccess ? "text-green-700" : "text-red-600"}`}
          >
            <span className="font-mono text-xs w-6">{idx + 1}.</span>
            <span className="inline-block w-4">
              {isSuccess ? (
                <span title="Gelukt" aria-label="Gelukt">✅</span>
              ) : (
                <span title="Mislukt" aria-label="Mislukt">❌</span>
              )}
            </span>
            <span className="font-semibold">{result.name}</span>
            <span className="ml-2 text-xs">{result.status}</span>
          </li>
        );
      })}
    </ul>
    <button
      onClick={onUploadMore}
      className="bg-primary text-white px-4 py-2 rounded w-full flex items-center justify-center"
    >
      Meer uploaden
    </button>
  </div>
);

export default UploadResults;
