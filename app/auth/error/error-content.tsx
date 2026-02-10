"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function AuthErrorContent() {
  const searchParams = useSearchParams() || new URLSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Callback: "Error processing your request. Please try again.",
    OAuthSignin: "Error connecting to OAuth provider.",
    OAuthCallback: "OAuth callback error. Please try again.",
    OAuthCreateAccount: "Could not create account from OAuth data.",
    EmailCreateAccount: "Could not create account from email.",
    EmailSignInError: "Email sign in failed.",
    CredentialsSignin: "Invalid credentials.",
    default: "An authentication error occurred. Please try again.",
  };

  const message = error && error in errorMessages ? errorMessages[error] : errorMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h1>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-primary text-white hover:bg-opacity-90 transition font-medium"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700"
          >
            Back to Home
          </Link>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 font-mono">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
