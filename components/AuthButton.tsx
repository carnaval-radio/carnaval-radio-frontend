"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { FiUser, FiLogOut, FiLogIn, FiMail } from "react-icons/fi";

interface AuthButtonProps {
  compact?: boolean;
}

// Fallback component shown during prerendering
function AuthButtonFallback({ compact = false }: { compact?: boolean }) {
  return (
    <button
      disabled
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm"
    >
      <FiUser size={18} />
      {!compact && "Sign In"}
    </button>
  );
}

// Inner component that uses hooks
function AuthButtonInner({ compact = false }: AuthButtonProps) {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const sessionResult = useSession();
  const data = sessionResult?.data;
  const status = sessionResult?.status || "unauthenticated";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await signIn("email", { email, callbackUrl: "/" });
    setLoading(false);
  };

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  if (isLoading) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm"
      >
        <FiUser size={18} />
        {!compact && "Loading..."}
      </button>
    );
  }

  if (isAuthenticated && data?.user) {
    return (
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800">{data.user.email}</div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 mt-1"
            >
              <FiLogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowEmail(!showEmail)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-opacity-90 transition text-sm"
      >
        <FiLogIn size={18} />
        {!compact && "Sign in"}
      </button>

      {showEmail && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiMail size={18} />
            Sign in with Email
          </h3>
          <form onSubmit={handleSignIn} className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-3">
            We'll send you a link to sign in. No password needed!
          </p>
          <button
            onClick={() => setShowEmail(false)}
            className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthButton({ compact = false }: AuthButtonProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <AuthButtonFallback compact={compact} />;
  }

  return <AuthButtonInner compact={compact} />;
}
