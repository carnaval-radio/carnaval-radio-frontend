"use client";

import Link from "next/link";
import { getLocalStorage, setLocalStorage } from "@/helpers/storageHelper";
import { useState, useEffect } from "react";

export default function TicketNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [hasShown, setHasShown] = useState(true); // Start with true to prevent flash

  useEffect(() => {
    // Check if notification has been shown before
    const alreadyShown = getLocalStorage("ticket_notification_shown", null);
    
    if (alreadyShown === true) {
      setHasShown(true);
      return;
    }

    setHasShown(false);

    // Show notification after 15 seconds
    const timer = setTimeout(() => {
      setShowNotification(true);
      setLocalStorage("ticket_notification_shown", true);
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowNotification(false);
  };

  if (hasShown || !showNotification) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fade-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Sluiten"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Carnaval Radio Limburgse Avond 2026
          </h2>
          
          <p className="text-gray-600 mb-6">
            Er zijn nog tickets beschikbaar voor de Carnaval Radio Limburgse Avond 2026!
            o.a: Rempetemp, Träcksäck, Bjorn en Mieke, Erwin, Wir Sind Spitze, Van Lieshout en Arts en meer. 
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              href="/start-verkoop"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors"
              onClick={handleClose}
            >
              Koop nu je tickets
            </Link>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition-colors"
            >
              Sluit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
