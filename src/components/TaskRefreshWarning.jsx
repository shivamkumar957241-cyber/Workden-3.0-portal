import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shows a warning dialog when the user refreshes the page mid-task.
 * Props:
 *   taskName - name of the active task
 *   onContinue - callback to dismiss and continue the task
 *   onExit - callback to lock and leave the task
 */
export default function TaskRefreshWarning({ taskName, onContinue, onExit }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Top banner */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 px-6 pt-7 pb-5 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 mb-3">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black text-white text-center">Task In Progress!</h2>
          <p className="text-white/80 text-sm text-center mt-1">You refreshed the page during an active task</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Task name */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 text-center">
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-0.5">Active Task</p>
            <p className="text-base font-black text-orange-900">{taskName}</p>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs text-red-800 leading-relaxed">
              ⚠️ <strong>If you exit now</strong>, this task will be <strong>locked until tomorrow 9:00 AM</strong> and you will not be able to restart it today.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl h-auto"
            >
              <Play className="w-4 h-4 mr-2" />
              Cancel – Continue My Task
            </Button>
            <Button
              onClick={onExit}
              variant="outline"
              className="w-full border-2 border-red-300 text-red-700 hover:bg-red-50 font-bold py-3 rounded-xl h-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Continue – Exit & Lock Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}