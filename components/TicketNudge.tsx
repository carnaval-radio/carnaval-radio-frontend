"use client";

import React, { useEffect, useState } from "react";
import { notificationData } from "@/data/notificationData";


const TicketNudge = () => {
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let bounceTimeout: ReturnType<typeof setTimeout> | undefined;
    const bounce = () => {
      setBouncing(true);
      bounceTimeout = setTimeout(() => setBouncing(false), 2000);
    };
    // First bounce after 7s
    const timeout = setTimeout(() => {
      bounce();
      // Then every 5 minutes
      interval = setInterval(bounce, 300000);
    }, 7000);
    return () => {
      clearTimeout(timeout);
      clearTimeout(bounceTimeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <a
      href={notificationData.buttonLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${notificationData.buttonText}: ${notificationData.title}`}
      title={notificationData.title}
      className="flex h-10 w-16 shrink-0 items-center justify-center"
    >
      <span
        className={`text-primary inline-flex items-center justify-center ${bouncing ? 'animate-bounce' : ''}`}
        style={{ width: '64px', height: '32px', flexShrink: 0 }}
      >
        <img src="/assets/icons/ticket.svg" alt="Ticket Icon" className="w-full h-full object-contain" />
      </span>
    </a>
  );
};

export default TicketNudge;
