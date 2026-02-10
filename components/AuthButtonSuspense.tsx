"use client";

import { Suspense } from "react";
import AuthButton from "./AuthButton";
import { FiUser } from "react-icons/fi";

interface AuthButtonSuspenseProps {
  compact?: boolean;
}

function AuthButtonFallback({ compact = false }: AuthButtonSuspenseProps) {
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

export function AuthButtonWithSuspense({ compact = false }: AuthButtonSuspenseProps) {
  return (
    <Suspense fallback={<AuthButtonFallback compact={compact} />}>
      <AuthButton compact={compact} />
    </Suspense>
  );
}
