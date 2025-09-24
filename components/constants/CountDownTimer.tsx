"use client";
import { useEffect, useState } from "react";

export interface CountdownTimerProps {
    targetDate: Date;
}

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        const now = new Date();
        const difference: number = targetDate.getTime() - now.getTime();
  
        if (difference <= 0) {
          clearInterval(intervalId);
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeRemaining({ days, hours, minutes, seconds });
        }
      }, 1000);
  
      return () => clearInterval(intervalId);
    }, [targetDate]);
  
    return (
        <p>
          Nog {timeRemaining.days} dagen, {timeRemaining.hours} uren, {timeRemaining.minutes} minuten en {timeRemaining.seconds} seconden
        </p>
    );
  };

  export default CountdownTimer;