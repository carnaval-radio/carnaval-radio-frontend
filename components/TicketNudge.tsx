"use client";

import React, { useEffect, useState } from "react";


const TicketNudge = () => {
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;
    // First bounce after 7s
    timeout = setTimeout(() => {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 2000);
      // Then every 5 minutes
      interval = setInterval(() => {
        setBouncing(true);
        setTimeout(() => setBouncing(false), 2000);
      }, 300000);
    }, 7000);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <a href="/tickets-kopen" target='_blank' rel="noopener noreferrer" aria-label="Koop tickets voor Carnaval Radio Limburgse Avond!" title="Koop tickets voor Carnaval Radio Limburgse Avond!">
      <span
        className={`text-primary inline-block ${bouncing ? 'animate-bounce' : ''}`}
        style={{ marginTop: '5px', width: '80px', height: '32px', maxWidth: '100%', maxHeight: '100%' }}
      >
        <img src="/assets/icons/ticket.svg" alt="Ticket Icon" className="w-full h-full text-primary" />
      </span>
    </a>
  );
};

export default TicketNudge;
