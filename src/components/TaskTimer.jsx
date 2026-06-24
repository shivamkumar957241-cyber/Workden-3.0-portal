import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TaskTimer({ startTime, onTimeout }) {
  const [timeRemaining, setTimeRemaining] = useState(4 * 60 * 60); // 4 hours in seconds
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = startTime || new Date();
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsedSeconds = Math.floor((now - start) / 1000);
      const remaining = Math.max(0, (4 * 60 * 60) - elapsedSeconds);
      
      setElapsed(elapsedSeconds);
      setTimeRemaining(remaining);
      
      if (remaining === 0 && onTimeout) {
        clearInterval(interval);
        onTimeout();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, onTimeout]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatElapsed = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const percentComplete = ((elapsed / (4 * 60 * 60)) * 100).toFixed(1);
  const isLowTime = timeRemaining < 600; // Less than 10 minutes
  const isVeryLowTime = timeRemaining < 300; // Less than 5 minutes

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <Clock className={`w-5 h-5 ${isVeryLowTime ? 'text-red-600 animate-pulse' : isLowTime ? 'text-orange-600' : 'text-blue-600'}`} />
        <div>
          <p className="text-xs text-gray-500">Time Remaining</p>
          <p className={`text-xl font-bold ${isVeryLowTime ? 'text-red-600' : isLowTime ? 'text-orange-600' : 'text-blue-600'}`}>
            {formatTime(timeRemaining)}
          </p>
        </div>
      </div>
      
      <div className="hidden md:block h-10 w-px bg-gray-300"></div>
      
      <div className="flex items-center gap-2">
        <div>
          <p className="text-xs text-gray-500">Time Elapsed</p>
          <p className="text-sm font-semibold text-gray-700">{formatElapsed(elapsed)}</p>
        </div>
      </div>
      
      <div className="hidden md:block h-10 w-px bg-gray-300"></div>
      
      <div className="flex items-center gap-2">
        <div>
          <p className="text-xs text-gray-500">Progress</p>
          <Badge variant={percentComplete >= 80 ? 'destructive' : 'default'} className="text-sm">
            {percentComplete}%
          </Badge>
        </div>
      </div>
      
      {isVeryLowTime && (
        <Badge variant="destructive" className="animate-pulse">
          ⚠️ Time Almost Up!
        </Badge>
      )}
    </div>
  );
}
