import { useEffect, useState } from "react";

export const useStreamDuration = (isActive: boolean) => {
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isActive && !startTime) {
      setStartTime(Date.now());
    } else if (!isActive) {
      setStartTime(null);
      setDuration(0);
    }
  }, [isActive, startTime]);

  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return { duration, formattedDuration: formatDuration(duration) };
};
