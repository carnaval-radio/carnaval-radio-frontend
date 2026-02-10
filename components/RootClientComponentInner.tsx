"use client";

import { useAuthSync } from "@/hooks/useAuthSync";
import { useState, useEffect } from "react";

export function RootClientComponentInner({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Automatically sync device with user account when authenticated
  useAuthSync();

  return <>{children}</>;
}
