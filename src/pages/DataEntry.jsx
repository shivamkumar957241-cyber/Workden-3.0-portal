import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import TaskPreviewScreen from "@/components/TaskPreviewScreen";
import TaskTimeGuard from "@/components/TaskTimeGuard";
import TaskLockedScreen from "@/components/TaskLockedScreen";
import TaskRefreshWarning from "@/components/TaskRefreshWarning";
import { useTaskLock } from "@/lib/TaskLockContext";
import { getTaskLockStatus, setTaskLocked, buildVIPReportHeader, buildVIPReportFooter } from "@/lib/taskLockStorage";
import { useTaskActivityTracker } from "@/lib/useTaskActivityTracker";
import { startTaskActivity, stopTaskActivity, updateTaskActivity } from "@/lib/TaskActivityManager";

const TASK_NAME = "Data Entry";
const TOTAL = 65;
const REWARD = "₹200";
const TASK_DURATION = 8 * 60 * 60;

// Module-level ref so cleanup effect always sees latest value
let currentSessionId = null;

const FIELDS = [
  ["fullName", "Full Name"],
  ["phoneNumber", "Phone Number"],
  ["emailAddress", "Email Address"],
  ["aadharNumber", "Aadhar Number"],
  ["panNumber", "Pan Number"],
  ["qualification", "Qualification"],
  ["fullAddress", "Full Address"],
  ["city", "City"],
  ["state", "State"],
  ["pinCode", "Pin Code"],
  ["dob", "Dob"],
  ["gender", "Gender"],
  ["salary", "Salary"],
];

function createEntry(i) {
  const entry = { id: i + 1, isSaved: false };
  FIELDS.forEach(([f]) => { entry[f] = ""; });
  return entry;
}

export default function DataEntry() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(TASK_DURATION);
  const [showPreview, setShowPreview] = useState(true);
  const [lockStatus, setLockStatus] = useState({ isLocked: false, lockUntil: null });
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const navigate = useNavigate();
  const { registerTask, unregisterTask, lockAndLeave } = useTaskLock();
  const { startTracking, stopTracking, markSave } = useTaskActivityTracker();

  // Refs to always have latest values inside event listeners & cleanup
  const startTimeRef = useRef(null);
  const entriesRef = useRef([]);
  const savedCountRef = useRef(0);
  const tabSwitchCountRef = useRef(0);
  const userRef = useRef(null);
  const taskActiveRef = useRef(false); // FIX: track if task is actually running
  const realTimeIntervalRef = useRef(null);
  const visibilityHandlerRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { entriesRef.current = entries; }, [entries]);
  useEffect(() => { savedCountRef.current = savedCount; }, [savedCount]);
  useEffect(() => { tabSwitchCountRef.current = tabSwitchCount; }, [tabSwitchCount]);
  useEffect(() => { userRef.current = user; }, [user]);

  // ─── Load user & initial state ───────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userSource = localStorage.getItem('workden_user_source');
        const savedUserId = localStorage.getItem('workden_login_id');
        if (userSource === 'appuser' && savedUserId) {
          const users = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
          if (users?.length > 0) { setUser(users[0]); return; }
        }
        setUser(await base44.auth.me());
      } catch (e) {
        const saved = localStorage.getItem('workden_user');
        if (saved) setUser(JSON.parse(saved));
      }
    };
    loadUser();
    setEntries(Array.from({ length: TOTAL }, (_, i) => createEntry(i)));

    const ls = getTaskLockStatus(TASK_NAME);
    setLockStatus(ls);

    // Restore session if page was refreshed mid-task
    const savedStart = sessionStorage.getItem(`task_start_${TASK_NAME}`);
    if (savedStart && !ls.isLocked) {
      const t = parseInt(savedStart);
      setStartTime(t);
      startTimeRef.current = t;
      setShowPreview(false);
      setShowRefreshWarning(true);
      taskActiveRef.current = true;

      // Restore session id
      const savedSession = sessionStorage.getItem(`task_session_${TASK_NAME}`);
      if (savedSession) currentSessionId = savedSession;
    }

    // Cleanup on unmount
    return () => {
      stopRealTimeUpdates();
      removeVisibilityHandler();
    };
  }, []);

  // ─── Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!startTime) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, TASK_DURATION - Math.floor((Date.now() - startTime) / 1000));
      setRemainingTime(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        taskActiveRef.current = false;
        alert("⏰ Time is over! Your 8-hour task time has ended. You can no longer edit or save.");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // ─── Real-time activity update (every 30s) ───────────────────────────────
  const startRealTimeUpdates = useCallback(() => {
    stopRealTimeUpdates(); // clear any existing interval
    realTimeIntervalRef.current = setInterval(async () => {
      if (!currentSessionId || !taskActiveRef.current) return;
      try {
        const now = Date.now();
        const elapsedSec = startTimeRef.current
          ? Math.floor((now - startTimeRef.current) / 1000)
          : 0;
        const saved = savedCountRef.current;
        const speed = elapsedSec > 0 ? ((saved / elapsedSec) * 3600).toFixed(1) : 0; // entries per hour

        await updateTaskActivity(currentSessionId, {
          items_saved: saved,
          tab_switches: tabSwitchCountRef.current,
          elapsed_seconds: elapsedSec,
          speed_per_hour: parseFloat(speed),
          task_content: `Data Entry - ${saved}/${TOTAL} entries completed`,
          status: 'active',
        });
      } catch (e) {
        console.warn('Real-time update failed:', e);
      }
    }, 30000); // every 30 seconds
  }, []);

  const stopRealTimeUpdates = useCallback(() => {
    if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current);
      realTimeIntervalRef.current = null;
    }
  }, []);

  // ─── Tab visibility handler (FIX: only count, never abandon) ─────────────
  const setupVisibilityHandler = useCallback(() => {
    removeVisibilityHandler(); // remove old one first

    const handler = () => {
      if (!taskActiveRef.current) return;

      if (document.hidden) {
        // User switched away from tab — just COUNT it, do NOT abandon
        const newCount = tabSwitchCountRef.current + 1;
        setTabSwitchCount(newCount);
        tabSwitchCountRef.current = newCount;

        // Update DB with new tab switch count (non-blocking)
        if (currentSessionId) {
          updateTaskActivity(currentSessionId, {
            tab_switches: newCount,
            status: 'active', // KEEP as active, not abandoned
          }).catch(() => {});
        }
      }
      // When user comes BACK to tab — do nothing, task continues normally
    };

    document.addEventListener('visibilitychange', handler);
    visibilityHandlerRef.current = handler;
  }, []);

  const removeVisibilityHandler = useCallback(() => {
    if (visibilityHandlerRef.current) {
      document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
      visibilityHandlerRef.current = null;
    }
  }, []);

  // ─── Unmount cleanup (FIX: only abandon if taskActive and not properly exited) ──
  useEffect(() => {
    return () => {
      unregisterTask();
      stopRealTimeUpdates();
      removeVisibilityHandler();

      // Only mark abandoned if task was running and not properly stopped
      if (taskActiveRef.current && currentSessionId) {
        const saved = savedCountRef.current;
        const behaviorData = {
          entries_completed: saved,
          items_saved: saved,
          tab_switches: tabSwitchCountRef.current,
          task_content: `Data Entry - ${saved}/${TOTAL} entries completed`,
        };
        stopTaskActivity(currentSessionId, 'ABANDONED', behaviorData).catch(() => {});
        stopTracking(false, true).catch(() => {});

        sessionStorage.removeItem(`task_start_${TASK_NAME}`);
        sessionStorage.removeItem(`task_session_${TASK_NAME}`);
        sessionStorage.removeItem('workden_active_task_name');
        currentSessionId = null;
        taskActiveRef.current = false;
      }
    };
  }, [stopTracking, unregisterTask, stopRealTimeUpdates, removeVisibilityHandler]);

  // ─── Start task ───────────────────────────────────────────────────────────
  const handleStart = async () => {
    const now = Date.now();
    setStartTime(now);
    startTimeRef.current = now;
    taskActiveRef.current = true;

    sessionStorage.setItem(`task_start_${TASK_NAME}`, String(now));
    sessionStorage.setItem('workden_active_task_name', TASK_NAME);
    setShowPreview(false);

    // FIX: Start activity FIRST, get sessionId, then pass to tracker (no race condition)
    let sessionId = null;
    try {
      sessionId = await startTaskActivity(
        userRef.current?.id,
        userRef.current?.full_name || userRef.current?.email,
        TASK_NAME,
        'Data Entry'
      );
      currentSessionId = sessionId;
      sessionStorage.setItem(`task_session_${TASK_NAME}`, sessionId);
    } catch (e) {
      console.error('Failed to start activity:', e);
    }

    // Pass confirmed sessionId directly — no race condition
    startTracking(userRef.current, TASK_NAME, TASK_NAME, sessionId);

    // Start real-time 30s updates
    startRealTimeUpdates();

    // Setup tab switch detection (NOT abandon on switch)
    setupVisibilityHandler();

    registerTask(async () => {
      setTaskLocked(TASK_NAME);
      try {
        const lockUntil = new Date();
        lockUntil.setDate(lockUntil.getDate() + 1);
        lockUntil.setHours(9, 0, 0, 0);
        const existing = await base44.entities.ActiveTask.filter({ user_id: userRef.current?.id, status: 'active' });
        if (existing?.length > 0) {
          await base44.entities.ActiveTask.update(existing[0].id, {
            status: 'locked',
            locked_until: lockUntil.toISOString(),
            lock_reason: 'incomplete',
          });
        }
      } catch (e) {}
    });
  };

  // ─── Proper exit (user clicks back arrow with confirmation) ───────────────
  const handleExit = async () => {
    if (!window.confirm("⚠️ If you leave this task, it will be LOCKED until tomorrow 9:00 AM. Do you want to continue?")) {
      return;
    }

    taskActiveRef.current = false; // FIX: mark inactive BEFORE cleanup so unmount doesn't double-abandon
    stopRealTimeUpdates();
    removeVisibilityHandler();

    if (currentSessionId) {
      try {
        const saved = savedCountRef.current;
        const behaviorData = {
          entries_completed: saved,
          items_saved: saved,
          tab_switches: tabSwitchCountRef.current,
          task_content: `Data Entry - ${saved}/${TOTAL} entries completed`,
        };
        await stopTaskActivity(currentSessionId, 'STOPPED', behaviorData);
      } catch (e) {
        console.error('Failed to stop activity:', e);
      }
      currentSessionId = null;
    }

    sessionStorage.removeItem(`task_start_${TASK_NAME}`);
    sessionStorage.removeItem(`task_session_${TASK_NAME}`);
    sessionStorage.removeItem('workden_active_task_name');

    try {
      await stopTracking(false, true);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {}

    lockAndLeave('/Tasks');
  };

  // ─── Field change ─────────────────────────────────────────────────────────
  const handleChange = (index, field, value) => {
    const e = [...entries];
    e[index][field] = value;
    setEntries(e);
  };

  // ─── Save entry ───────────────────────────────────────────────────────────
  const handleSave = async (index) => {
    if (remainingTime === 0) { alert("⏰ Time is over! You cannot save anymore."); return; }
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    if (h * 60 + m < 9 * 60 || h * 60 + m > 23 * 60 + 30) {
      alert("⚠️ Task submission is allowed only between 9:00 AM to 11:30 PM"); return;
    }
    if (!userRef.current?.id) { alert("⚠️ User session error. Please refresh the page."); return; }

    const entry = entries[index];
    if (!entry.fullName || !entry.phoneNumber || !entry.emailAddress) {
      alert("Please fill Full Name, Phone Number, and Email Address!"); return;
    }

    try {
      const content = FIELDS.map(([f, l]) => `${l}: ${entry[f] || 'N/A'}`).join('\n');
      await base44.entities.DraftWork.create({
        user_id: userRef.current.id,
        user_name: userRef.current.full_name || userRef.current.email,
        user_id_number: userRef.current.login_user_id || userRef.current.id,
        work_type: "Data Entry",
        task_content: `Item #${entry.id}\n${content}`,
        task_data: entry,
        saved_date: new Date().toISOString(),
        start_time: new Date(startTimeRef.current || startTime || Date.now()).toISOString(),
      });

      const e = [...entries];
      e[index].isSaved = true;
      setEntries(e);

      const newSaved = savedCount + 1;
      setSavedCount(newSaved);
      savedCountRef.current = newSaved;
      markSave();

      // Immediate real-time update on save (don't wait 30s)
      if (currentSessionId) {
        const elapsedSec = startTimeRef.current
          ? Math.floor((Date.now() - startTimeRef.current) / 1000)
          : 0;
        const speed = elapsedSec > 0 ? ((newSaved / elapsedSec) * 3600).toFixed(1) : 0;
        updateTaskActivity(currentSessionId, {
          items_saved: newSaved,
          tab_switches: tabSwitchCountRef.current,
          elapsed_seconds: elapsedSec,
          speed_per_hour: parseFloat(speed),
          task_content: `Data Entry - ${newSaved}/${TOTAL} entries completed`,
          status: 'active',
        }).catch(() => {});
      }
    } catch (err) {
      alert("Failed to save. Please try again.");
    }
  };

  // ─── Download TXT ─────────────────────────────────────────────────────────
  const downloadTXT = () => {
    const done = entries.filter(e => e.isSaved);
    if (!done.length) { alert("No entries saved yet!"); return; }
    const startDate = startTime ? new Date(startTime) : new Date();
    const endDate = new Date();
    const totalSec = Math.floor((endDate - startDate) / 1000);

    let txt = buildVIPReportHeader({
      user: userRef.current,
      taskName: TASK_NAME,
      startDate,
      endDate,
      totalSec,
      completed: done.length,
      total: TOTAL,
      reward: REWARD,
    });

    txt += `  ┌${'─'.repeat(56)}┐\n`;
    txt += `  │                   ENTRY DATA                           │\n`;
    txt += `  └${'─'.repeat(56)}┘\n\n`;

    done.forEach((e) => {
      txt += `  ╔${'═'.repeat(56)}╗\n`;
      txt += `  ║  ENTRY #${String(e.id).padEnd(48)}║\n`;
      txt += `  ╚${'═'.repeat(56)}╝\n`;
      FIELDS.forEach(([field, label]) => {
        txt += `  ${label.padEnd(22)}: ${e[field] || 'N/A'}\n`;
      });
      txt += `  ${'-'.repeat(58)}\n\n`;
    });

    txt += buildVIPReportFooter();

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WorkDen_DataEntry_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    alert(`✅ Report Downloaded!\n\n📤 Upload to Google Drive and submit via Menu → "Submit Your Work"`);
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  // ─── Screens ──────────────────────────────────────────────────────────────
  if (lockStatus.isLocked) {
    return (
      <TaskLockedScreen
        taskName={TASK_NAME}
        lockUntil={lockStatus.lockUntil}
        onBack={() => navigate(createPageUrl("Tasks"))}
      />
    );
  }

  if (showPreview) {
    return (
      <TaskTimeGuard>
        <TaskPreviewScreen
          taskName="Data Entry"
          reward={REWARD}
          total={TOTAL}
          fields={FIELDS}
          onStart={handleStart}
          onBack={() => navigate(createPageUrl("Tasks"))}
        />
      </TaskTimeGuard>
    );
  }

  // ─── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Refresh warning overlay */}
      {showRefreshWarning && (
        <TaskRefreshWarning
          taskName={TASK_NAME}
          onContinue={() => setShowRefreshWarning(false)}
          onExit={() => {
            setShowRefreshWarning(false);
            sessionStorage.removeItem(`task_start_${TASK_NAME}`);
            lockAndLeave('/Tasks');
          }}
        />
      )}

      {/* Top Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExit}
          className="rounded-full border"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-purple-700">Data Entry</h1>
          {/* FIX: Show tab switch count so admin can see it */}
          {tabSwitchCount > 0 && (
            <p className="text-xs text-orange-500">Tab switches: {tabSwitchCount}</p>
          )}
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono font-bold ${
          remainingTime === 0
            ? 'bg-red-600 text-white'
            : remainingTime < 3600
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {remainingTime === 0
            ? '⏰ TIME OVER'
            : `⏱ ${String(Math.floor(remainingTime / 3600)).padStart(2, '0')}:${String(Math.floor((remainingTime % 3600) / 60)).padStart(2, '0')}:${String(remainingTime % 60).padStart(2, '0')}`
          }
        </div>

        <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl">
          {savedCount}/{TOTAL}
        </div>
      </div>

      {/* Entry Items */}
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {entries.map((entry, index) => (
          <div key={entry.id} className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
            {/* Item Header */}
            <div className={`flex items-center justify-between px-5 py-4 text-white font-semibold ${
              index % 2 === 0
                ? 'bg-gradient-to-r from-purple-700 to-purple-500'
                : 'bg-gradient-to-r from-blue-500 to-teal-400'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 bg-white/25 rounded-full flex items-center justify-center font-bold text-base">
                  {entry.id}
                </span>
                <span className="text-lg font-bold">Item #{entry.id}</span>
              </div>
              {!entry.isSaved ? (
                <Button
                  onClick={() => handleSave(index)}
                  size="sm"
                  className="bg-white/20 hover:bg-white/35 text-white border border-white/40 font-semibold px-4 py-2 h-auto rounded-xl"
                >
                  <Save className="w-4 h-4 mr-1.5" />Save
                </Button>
              ) : (
                <span className="text-sm bg-green-500 px-4 py-1.5 rounded-full font-semibold">✓ Saved</span>
              )}
            </div>

            {/* Item Fields */}
            <div className="bg-white p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FIELDS.map(([field, label]) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label} *</label>
                    <textarea
                      placeholder="Type here..."
                      value={entry[field]}
                      onChange={e => {
                        handleChange(index, field, e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      disabled={entry.isSaved}
                      rows={1}
                      className="w-full border border-gray-200 focus:border-purple-400 text-base bg-white rounded-lg px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-1 focus:ring-purple-400 disabled:opacity-60 disabled:bg-gray-50"
                      style={{ fontSize: '16px', minHeight: '44px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Download Button */}
        <div className="pt-4 pb-8">
          <Button
            onClick={downloadTXT}
            disabled={savedCount === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 text-base rounded-xl shadow-lg h-auto disabled:opacity-40"
          >
            <Download className="w-5 h-5 mr-2" />
            Download File ({savedCount} entries saved)
          </Button>
          {savedCount === 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">Save at least one entry to download</p>
          )}
        </div>
      </div>
    </div>
  );
}