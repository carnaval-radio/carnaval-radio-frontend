
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
