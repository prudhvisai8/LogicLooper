import React, { useEffect, useState } from 'react';

interface TimerProps {
  running: boolean;
  startTime: number | null;
  endTime?: number | null;
}

const Timer: React.FC<TimerProps> = ({ running, startTime, endTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running || !startTime) {
      if (endTime && startTime) {
        setElapsed(Math.floor((endTime - startTime) / 1000));
      }
      return;
    }

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [running, startTime, endTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="flex items-center gap-2 font-display text-timer">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-70">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4V8L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-lg tabular-nums">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;
