"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getOrCreateDeviceId } from "@/helpers/deviceId";

/**
 * Hook to automatically link the current device to the user's account when they log in
 * This enables cross-device favorite syncing
 */
export function useAuthSync() {
  const [mounted, setMounted] = useState(false);
  
  let sessionData: any = null;
  let sessionStatus = "unauthenticated";
  
  try {
    const result = useSession();
    if (result) {
      sessionData = result.data;
      sessionStatus = result.status || "unauthenticated";
    }
  } catch (error) {
    // During SSR/prerendering, useSession might fail - that's okay
  }
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || sessionStatus !== "authenticated" || !sessionData?.user?.email) {
      return;
    }

    const deviceId = getOrCreateDeviceId();

    // Link this device to the user account
    fetch("/api/auth/link-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId }),
    }).catch((error) => {
      console.error("Failed to link device:", error);
    });
  }, [sessionData?.user?.email, sessionStatus, mounted]);
}
