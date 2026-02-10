"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiLogOut, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

interface ProfileClientProps {
  session: Session;
}

export default function ProfileClient({ session }: ProfileClientProps) {
  const router = useRouter();
  const user = session.user;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100"
          title="Back"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">My Account</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-center gap-6 mb-8">
          {user?.image && (
            <img
              src={user.image}
              alt={user.name || "Profile"}
              className="w-24 h-24 rounded-full"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="mt-2 text-sm text-gray-500">
              Logged in since {session.user?.email ? new Date().toLocaleDateString("nl-NL") : "N/A"}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About Your Account</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Your favorites are automatically synced across all your devices</li>
              <li>✓ Log in on any device to see your entire favorites list</li>
              <li>✓ Your existing favorites are linked to your device and will be preserved</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium text-gray-800">{user?.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium text-gray-800">{user?.email || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/favorieten"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-opacity-90 transition"
        >
          ❤️ View Favorites
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
        >
          <FiLogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Privacy Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">🔒 Privacy</h3>
        <p className="text-sm text-gray-600">
          Your account is securely managed by NextAuth.js. We don't store your password - you sign in through Google, Facebook, Microsoft, or Apple.
        </p>
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300 font-mono text-xs">
          <p className="font-semibold text-gray-800 mb-2">Debug Info</p>
          <pre className="overflow-auto text-gray-700">
            {JSON.stringify({ user: session.user }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
