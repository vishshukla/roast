"use client";
import { useEffect, useState } from "react";

interface TimerProps {
  durationSec: number;
  onComplete?: () => void;
  startedAt?: number;
}

export default function Timer({ durationSec, onComplete, startedAt }: TimerProps) {
  const [remaining, setRemaining] = useState(durationSec);

  useEffect(() => {
    const start = startedAt || Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, durationSec - elapsed);
      setRemaining(left);
      if (left === 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [durationSec, startedAt, onComplete]);

  const isUrgent = remaining <= 10;

  return (
    <div
      className={`text-6xl font-black tabular-nums transition-colors ${
        isUrgent ? "text-red-500 animate-pulse" : "text-white"
      }`}
    >
      {remaining}
    </div>
  );
}
