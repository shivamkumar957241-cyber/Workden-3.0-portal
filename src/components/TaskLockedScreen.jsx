import React, { useState, useEffect } from "react";
import { Lock, Clock, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export default function TaskLockedScreen({ taskName, lockUntil, onBack }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const diffMs = Math.max(0, new Date(lockUntil) - now);
  const totalSec = Math.floor(diffMs / 1000);
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;

  const unlockDate = new Date(lockUntil);
  const unlockStr = unlockDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-red-200">

          {/* Top Banner */}
          <div className="bg-gradient-to-br from-red-500 to-rose-600 pt-8 pb-6 flex flex-col items-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 mb-4">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white text-center px-4">Task Locked!</h1>
            <p className="text-white/80 text-sm text-center mt-1 px-6">You exited the task before completing it</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Task Name */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-1">Locked Task</p>
              <p className="text-lg font-black text-red-800">{taskName}</p>
            </div>

            {/* Countdown */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Unlocks In</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                {[
                  { val: String(hh).padStart(2, '0'), label: 'HRS' },
                  { val: String(mm).padStart(2, '0'), label: 'MIN' },
                  { val: String(ss).padStart(2, '0'), label: 'SEC' },
                ].map((item, i) => (
                  <React.Fragment key={item.label}>
                    <div className="flex flex-col items-center">
                      <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white font-black text-3xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                        {item.val}
                      </div>
                      <p className="text-xs text-gray-400 font-semibold mt-1">{item.label}</p>
                    </div>
                    {i < 2 && <span className="text-2xl font-black text-red-400 mb-4">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Unlock info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-700 font-semibold">
                🔓 Retry available on <strong>{unlockStr}</strong> after 9:00 AM
              </p>
            </div>

            {/* Rules */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
              <p className="text-xs font-bold text-gray-700 mb-2">⚠️ Task Lock Rules:</p>
              <p className="text-xs text-gray-500">• Once you exit a task, it is immediately locked</p>
              <p className="text-xs text-gray-500">• You cannot resume the task on the same day</p>
              <p className="text-xs text-gray-500">• Retry is only allowed next day after 9:00 AM</p>
              <p className="text-xs text-gray-500">• One attempt allowed per task per day</p>
            </div>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
