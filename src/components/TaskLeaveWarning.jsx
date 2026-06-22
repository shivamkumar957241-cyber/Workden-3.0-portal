import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock, Clock } from "lucide-react";

export default function TaskLeaveWarning({ isOpen, onStay, onLeave, lockUntilTime }) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!lockUntilTime) return;
    const timer = setInterval(() => {
      const now = new Date();
      const unlock = new Date(lockUntilTime);
      const diff = unlock - now;
      if (diff <= 0) {
        setCountdown("Unlocking soon...");
        clearInterval(timer);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockUntilTime]);

  // Calculate unlock time display
  const unlockDate = lockUntilTime ? new Date(lockUntilTime) : null;
  const unlockDisplay = unlockDate
    ? `Tomorrow at ${unlockDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : "Tomorrow at 9:00 AM";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onStay(); }}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-xl">
            <AlertTriangle className="w-6 h-6" />
            ⚠️ Leave Task?
          </DialogTitle>
          <DialogDescription className="text-gray-700 leading-relaxed text-sm">
            You are currently working on this task. If you leave now, the task will be locked until tomorrow.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Lock Reason */}
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-red-600" />
              <p className="font-bold text-red-800">Why will the task lock?</p>
            </div>
            <p className="text-sm text-red-700">
              Platform rule: Once a task is started, leaving it incomplete will lock it until the next day at 9:00 AM. This prevents incomplete submissions and ensures fair work quality.
            </p>
          </div>

          {/* Consequences */}
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <p className="text-sm font-semibold text-amber-900 mb-2">If you leave now:</p>
            <ul className="text-sm text-amber-800 space-y-1.5">
              <li>❌ All entered data will be <strong>permanently lost</strong></li>
              <li>🔒 Task will be <strong>locked</strong> — Reason: <em>Incomplete</em></li>
              <li>⏰ Unlocks: <strong>{unlockDisplay}</strong></li>
              <li>🚫 You cannot retry this task until it unlocks</li>
            </ul>
          </div>

          {/* Countdown Timer */}
          {lockUntilTime && (
            <div className="p-4 bg-gray-900 rounded-xl text-center">
              <p className="text-xs text-gray-400 mb-1">If locked, time until unlock:</p>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <p className="text-2xl font-bold font-mono text-orange-400">{countdown}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">HH:MM:SS</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={onStay}
            className="flex-1 border-2 border-green-500 text-green-700 hover:bg-green-50 font-semibold"
          >
            ✅ Stay & Continue Task
          </Button>
          <Button
            onClick={onLeave}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-semibold"
          >
            <Lock className="w-4 h-4 mr-2" />
            Lock Task & Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}