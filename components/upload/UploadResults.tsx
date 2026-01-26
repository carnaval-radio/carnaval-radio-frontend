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
      {uploadResults.map((result, idx) => (
        <li key={idx} className={result.status.includes("Succes") ? "text-green-600" : "text-red-600"}>
          {result.name}: {result.status}
        </li>
      ))}
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
