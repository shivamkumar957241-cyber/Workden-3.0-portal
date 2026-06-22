import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock } from "lucide-react";
import { useTaskLock } from "@/lib/TaskLockContext";

// Task pages - navigation WITHIN these is allowed
const TASK_PAGES = ['DataEntry', 'FormFilling', 'GrammarCorrection', 'EbookTyping', 'CaptchaFilling', 'TaskWorkspace', 'CopyPaste', 'ChatSupport', 'PdfToWordTyping', 'Typing'];

function isTaskPage(href) {
  return TASK_PAGES.some(p => href && href.includes(p));
}

export default function TaskNavigationWarning() {
  const { isTaskActive, lockAndLeave } = useTaskLock();
  const [showWarning, setShowWarning] = React.useState(false);
  const [locking, setLocking] = React.useState(false);
  const pendingDest = useRef(null);
  const isActiveRef = useRef(false);

  // Keep a ref in sync so event handlers always see latest value
  useEffect(() => {
    isActiveRef.current = isTaskActive;
  }, [isTaskActive]);

  useEffect(() => {
    // beforeunload — triggers on browser close, tab close, and page refresh
    const handleBeforeUnload = (e) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      e.returnValue = "⚠️ Your task will be locked if you leave. Are you sure?";
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!isTaskActive) return;

    // Push dummy state so back button fires popstate
    window.history.pushState(null, '', window.location.href);

    // Intercept ALL clicks — catches both <a> and React Router <Link> (which renders as <a>)
    const handleClick = (e) => {
      if (!isActiveRef.current) return;

      // Find the nearest anchor
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href') || '';

      // Allow clicks with no real navigation, hash-only, or within task pages
      if (!href || href === '#' || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('upi')) return;
      if (isTaskPage(href)) return;

      // It's navigation away from a task — intercept!
      e.preventDefault();
      e.stopPropagation();
      pendingDest.current = href;
      setShowWarning(true);
    };

    // Intercept browser back/forward button
    const handlePopState = () => {
      if (!isActiveRef.current) return;
      window.history.pushState(null, '', window.location.href);
      pendingDest.current = '/Tasks';
      setShowWarning(true);
    };

    // Intercept keyboard shortcuts (Escape key especially)
    const handleKeyDown = (e) => {
      if (!isActiveRef.current) return;
      // Block Alt+Left (browser back), Alt+F4 hint via Escape handling
      if ((e.altKey && e.key === 'ArrowLeft') || (e.altKey && e.key === 'ArrowRight')) {
        e.preventDefault();
        pendingDest.current = '/Tasks';
        setShowWarning(true);
      }
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isTaskActive]);

  const handleLockAndLeave = async () => {
    setLocking(true);
    await lockAndLeave(pendingDest.current || '/Tasks');
    setLocking(false);
    setShowWarning(false);
  };

  const handleStay = () => {
    setShowWarning(false);
    pendingDest.current = null;
  };

  if (!showWarning) return null;

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        // Override the built-in X button to show warning instead of closing
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Custom close button that shows warning */}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => {
            // X button click — just stay (don't allow close)
            // Do nothing, task is active
          }}
          title="Task is active — use buttons below"
        >
          <Lock className="h-4 w-4 text-red-500" />
          <span className="sr-only">Locked</span>
        </button>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            ⚠️ Task In Progress!
          </DialogTitle>
          <DialogDescription className="text-gray-700 leading-relaxed">
            Are you sure you want to exit? Your task will be <strong className="text-red-600">LOCKED</strong> immediately and can only be retried <strong>tomorrow after 9:00 AM</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <ul className="text-sm text-red-800 space-y-1">
              <li>🔒 Task will be <strong>LOCKED immediately</strong></li>
              <li>❌ You cannot restart the task today</li>
              <li>⏰ Retry only allowed next day after 9:00 AM</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleStay}
            className="flex-1 border-2 border-green-500 text-green-700 hover:bg-green-50 font-semibold"
          >
            ✅ Continue Task
          </Button>
          <Button
            onClick={handleLockAndLeave}
            disabled={locking}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-semibold"
          >
            <Lock className="w-4 h-4 mr-2" />
            {locking ? "Locking..." : "Exit & Lock Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}