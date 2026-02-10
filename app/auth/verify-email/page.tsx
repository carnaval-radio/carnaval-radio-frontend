import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | Carnaval Radio",
  description: "Verify your email to sign in",
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h1>
        <p className="text-gray-600 mb-6">
          We've sent a magic link to your email. Click it to sign in to your Carnaval Radio account.
        </p>
        <p className="text-sm text-gray-500">
          The link will expire in 24 hours. If you didn't receive it, check your spam folder or try signing in again.
        </p>
      </div>
    </div>
  );
}
