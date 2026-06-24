import React, { useState, useEffect } from "react";
import { Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function getCountdownToUnlock() {
  const now = new Date();
  const unlock = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  // If before 9 AM, unlock is today at 9:00 AM
  // If after 11:30 PM, unlock is tomorrow at 9:00 AM
  if (h < 9) {
    unlock.setHours(9, 0, 0, 0);
  } else {
    unlock.setDate(unlock.getDate() + 1);
    unlock.setHours(9, 0, 0, 0);
  }

  const diff = Math.max(0, Math.floor((unlock - now) / 1000));
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  return { hours, minutes, seconds };
}

export default function TaskTimeLockScreen() {
  const [countdown, setCountdown] = useState(getCountdownToUnlock());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdownToUnlock());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffb347 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #ff6b35, #ff8c42)" }} />

          <div className="p-8 text-center">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)" }}
            >
              <Lock className="w-10 h-10 text-white" />
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Tasks Currently Locked
            </h1>

            {/* Subtext */}
            <p className="text-gray-500 text-sm mb-4">
              Tasks are available between
            </p>

            {/* Time highlight */}
            <div
              className="inline-block px-5 py-2 rounded-full text-white font-bold text-lg mb-6 shadow-md"
              style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)" }}
            >
              9:00 AM – 11:30 PM
            </div>

            {/* Countdown */}
            <div className="mb-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
                Next tasks unlock in
              </p>
              <div className="flex items-center justify-center gap-2">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md"
                    style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)" }}
                  >
                    {pad(countdown.hours)}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">HRS</span>
                </div>
                <span className="text-2xl font-bold text-gray-400 mb-4">:</span>
                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md"
                    style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)" }}
                  >
                    {pad(countdown.minutes)}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">MIN</span>
                </div>
                <span className="text-2xl font-bold text-gray-400 mb-4">:</span>
                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md"
                    style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)" }}
                  >
                    {pad(countdown.seconds)}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">SEC</span>
                </div>
              </div>
            </div>

            {/* Info text */}
            <p className="text-gray-400 text-xs mt-4 mb-6">
              Please come back during task hours to start working.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => window.history.back()}
                className="w-full text-white font-semibold py-5 rounded-xl shadow-md"
                style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)" }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Go Back to Tasks
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <p className="text-white/70 text-xs text-center mt-4">
          WorkDen • Work from Home Platform
        </p>
      </div>
    </div>
  );
}
