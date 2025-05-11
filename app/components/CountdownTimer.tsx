'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        onComplete?.();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (Object.values(newTimeLeft).every(v => v === 0)) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const padNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-2 font-mono bg-white/10 rounded-lg px-3 py-1">
      {timeLeft.days > 0 && (
        <div className="flex items-center">
          <span className="font-bold text-lg">{timeLeft.days}</span>
          <span className="text-sm ml-1 opacity-90">days</span>
          <span className="mx-1 opacity-50">:</span>
        </div>
      )}
      <div className="flex items-center">
        <span className="font-bold text-lg">{padNumber(timeLeft.hours)}</span>
        <span className="text-sm ml-1 opacity-90">hrs</span>
        <span className="mx-1 opacity-50">:</span>
      </div>
      <div className="flex items-center">
        <span className="font-bold text-lg">{padNumber(timeLeft.minutes)}</span>
        <span className="text-sm ml-1 opacity-90">min</span>
        <span className="mx-1 opacity-50">:</span>
      </div>
      <div className="flex items-center">
        <span className="font-bold text-lg">{padNumber(timeLeft.seconds)}</span>
        <span className="text-sm ml-1 opacity-90">sec</span>
      </div>
    </div>
  );
} 