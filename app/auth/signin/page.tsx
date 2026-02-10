"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FiMail, FiArrowLeft } from "react-icons/fi";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await signIn("email", { email, callbackUrl: "/" });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail size={32} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Carnaval Radio</h1>
              <p className="text-gray-600">Sign in with your email</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">✨ How it works</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Enter your email above</li>
                <li>Check your inbox for a magic link</li>
                <li>Click the link to sign in</li>
                <li>Your favorites sync across all devices!</li>
              </ol>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              No password needed. No account creation. Just your email.
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Check your email!</h1>
              <p className="text-gray-600">
                We sent a magic link to <span className="font-semibold">{email}</span>
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Didn't receive it?</strong> Check your spam folder or try again with a different email.
              </p>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Try Another Email
            </button>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link href="/" className="flex items-center justify-center gap-2 text-primary hover:underline text-sm">
            <FiArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
