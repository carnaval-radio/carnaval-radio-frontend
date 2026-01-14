"use client";

import Link from "next/link";
import { getLocalStorage, setLocalStorage } from "@/helpers/storageHelper";
import { useState, useEffect } from "react";
import { notificationData } from "@/data/notificationData";

export default function Notification() {
  const [showNotification, setShowNotification] = useState(false);
  const [hasShown, setHasShown] = useState(true); // Start with true to prevent flash

  useEffect(() => {
    // Don't show if disabled
    if (!notificationData.enabled) {
      return;
    }

    // Check if notification has been shown before
    const lastShownTimestamp = getLocalStorage("notification_last_shown", null);
    
    if (lastShownTimestamp) {
      // If showAgainAfterDays is null, never show again
      if (notificationData.showAgainAfterDays === null) {
        setHasShown(true);
        return;
      }

      // Check if enough days have passed
      const daysSinceLastShown = (Date.now() - lastShownTimestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceLastShown < notificationData.showAgainAfterDays) {
        setHasShown(true);
        return;
      }
    }

    setHasShown(false);

    // Show notification after configured delay
    const timer = setTimeout(() => {
      setShowNotification(true);
      setLocalStorage("notification_last_shown", Date.now());
    }, notificationData.delay);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowNotification(false);
  };

  if (hasShown || !showNotification || !notificationData.enabled) {
    return null;
  }

  const renderIcon = () => {
    switch (notificationData.iconType) {
      case 'success':
        return (
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
        );
      case 'info':
        return (
          <svg
            className="w-16 h-16 mx-auto text-blue-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'warning':
        return (
          <svg
            className="w-16 h-16 mx-auto text-yellow-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
      default:
        return (
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
        );
    }
  };

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
            {renderIcon()}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {notificationData.title}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {notificationData.message}
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              href={notificationData.buttonLink}
              {...(notificationData.openInNewTab && {
                target: "_blank",
                rel: "noopener noreferrer"
              })}
              className="px-6 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors"
              onClick={handleClose}
            >
              {notificationData.buttonText}
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
