import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const TaskLockContext = createContext(null);

export function TaskLockProvider({ children }) {
  const [lockConfig, setLockConfig] = useState(null);
  const lockConfigRef = useRef(null);
  const lockingRef = useRef(false);

  // Perform the actual lock — saves to localStorage immediately (works even on tab close)
  const performLock = useCallback(() => {
    const activeTaskName = sessionStorage.getItem('workden_active_task_name');
    if (!activeTaskName) return;
    const userId = localStorage.getItem('workden_login_id') || 'guest';
    const key = `workden_task_lock_${userId}_${activeTaskName.replace(/\s+/g, '_')}`;
    const lockUntil = new Date();
    lockUntil.setDate(lockUntil.getDate() + 1);
    lockUntil.setHours(9, 0, 0, 0);
    localStorage.setItem(key, lockUntil.toISOString());
    sessionStorage.removeItem('workden_task_active');
    sessionStorage.removeItem(`task_start_${activeTaskName}`);
  }, []);

  // visibilitychange: fires when tab is hidden/switched (more reliable than beforeunload)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && lockConfigRef.current && !lockingRef.current) {
        // Tab hidden — lock task immediately via localStorage (synchronous, always works)
        performLock();
        // Also call the async callback (best effort)
        if (lockConfigRef.current?.onLock) {
          lockingRef.current = true;
          lockConfigRef.current.onLock().catch(() => {}).finally(() => { lockingRef.current = false; });
        }
      }
    };

    const handleBeforeUnload = (e) => {
      if (!lockConfigRef.current) return;
      // Lock synchronously via localStorage — this ALWAYS runs before page closes
      performLock();
      // Show browser's native dialog (can't fully replace it, but lock is already applied)
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [performLock]);

  const registerTask = useCallback((onLockCallback, taskName) => {
    const config = { onLock: onLockCallback };
    setLockConfig(config);
    lockConfigRef.current = config;
    sessionStorage.setItem('workden_task_active', '1');
    if (taskName) sessionStorage.setItem('workden_active_task_name', taskName);
  }, []);

  const unregisterTask = useCallback(() => {
    setLockConfig(null);
    lockConfigRef.current = null;
    sessionStorage.removeItem('workden_task_active');
    sessionStorage.removeItem('workden_active_task_name');
  }, []);

  const lockAndLeave = useCallback(async (destination) => {
    lockingRef.current = true;
    const config = lockConfigRef.current;
    // Lock in localStorage first (synchronous — guaranteed)
    performLock();
    // Then try async DB update
    if (config?.onLock) {
      try { await config.onLock(); } catch(e) {}
    }
    // Clear
    setLockConfig(null);
    lockConfigRef.current = null;
    lockingRef.current = false;
    sessionStorage.removeItem('workden_task_active');
    sessionStorage.removeItem('workden_active_task_name');
    window.location.href = destination || '/Tasks';
  }, [performLock]);

  const isTaskActive = !!lockConfig;

  return (
    <TaskLockContext.Provider value={{ isTaskActive, lockConfig, registerTask, unregisterTask, lockAndLeave }}>
      {children}
    </TaskLockContext.Provider>
  );
}

export function useTaskLock() {
  const ctx = useContext(TaskLockContext);
  if (!ctx) throw new Error("useTaskLock must be used within TaskLockProvider");
  return ctx;
}