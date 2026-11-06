"use client";

import { useEffect, useState } from "react";

export function useScheduledActivation(startsAt: string | null) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const startTime = startsAt === null ? 0 : Date.parse(startsAt);
    if (!Number.isFinite(startTime)) {
      throw new Error(`Invalid promotion start time: ${startsAt}`);
    }

    let timer: ReturnType<typeof setTimeout>;

    function checkSchedule() {
      const remaining = startTime - Date.now();
      setActive(remaining <= 0);

      if (remaining > 0) {
        // Browser timers cannot safely exceed a signed 32-bit delay.
        timer = setTimeout(checkSchedule, Math.min(remaining, 2147483647));
      }
    }

    checkSchedule();

    return () => clearTimeout(timer);
  }, [startsAt]);

  return active;
}
