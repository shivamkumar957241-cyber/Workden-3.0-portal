import React from "react";
import { Clock, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TaskTimerBar({ remainingTime, savedCount, total, onDownload, downloadDisabled }) {
  const h = String(Math.floor(remainingTime / 3600)).padStart(2, '0');
  const m = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, '0');
  const s = String(remainingTime % 60).padStart(2, '0');
  const isWarning = remainingTime < 3600;

  return (
    <div className="px-4 py-3 sticky top-[61px] z-10">
      <div className={`rounded-2xl ${isWarning ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'} text-white px-5 py-4 shadow-lg`}>
        <div className="flex items-center justify-between gap-3">
          {/* Timer Section */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${isWarning ? 'bg-white/20' : 'bg-white/20'} rounded-full flex items-center justify-center flex-shrink-0`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold opacity-75 leading-none mb-1">Time Remaining</p>
              <p className="font-mono font-black text-3xl leading-none tracking-wide">
                {h}<span className="opacity-60 mx-0.5">:</span>{m}<span className="opacity-60 mx-0.5">:</span>{s}
              </p>
            </div>
          </div>

          {/* Right: progress + download */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-bold text-sm">{savedCount}/{total}</span>
            </div>
            <Button
              onClick={onDownload}
              disabled={downloadDisabled}
              size="sm"
              className="bg-white/20 hover:bg-white/30 disabled:opacity-40 border border-white/30 text-white font-semibold text-xs px-4 py-2 h-auto rounded-xl"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
