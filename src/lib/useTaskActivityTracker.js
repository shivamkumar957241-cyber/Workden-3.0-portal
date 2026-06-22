/**
 * useTaskActivityTracker
 *
 * ORIGINAL FIXES (v1):
 * 1. buildMetadata — moved OUTSIDE hook so beforeunload & all callbacks can access it
 * 2. updateTaskBehaviorMerged — removed extra DB READ (filter), now uses direct update via sessionId
 * 3. beforeunload — buildMetadata scope error fixed
 * 4. DB sync interval stays 3s but now only 1 DB call (write only, no read)
 *
 * NEW FIXES (v2) — Global All-User Activity Tracking:
 * 5. BUG FIX: sessionId = null case — generate fallback sessionId so ALL users get tracked
 *    Pehle: agar user ka session_id null tha toh LiveActivity lookup skip ho jaata tha
 *    Ab: user.id + timestamp se ek guaranteed sessionId generate karo
 * 6. BUG FIX: Race condition — LiveActivity record fetch retry (5x with 2s delay)
 *    Pehle: startTracking ke time LiveActivity record exist nahi karta tha (TaskActivityManager late hota tha)
 *    Ab: 5 retries × 2 seconds — race condition completely handled
 * 7. BUG FIX: Auto-create LiveActivity if still not found after retries
 *    Pehle: record nahi mila toh liveRecordId = null forever
 *    Ab: directly create karo — user guaranteed visible hoga tracker mein
 * 8. BUG FIX: Sync interval self-healing — retries liveRecordId fetch if null
 *    Pehle: agar liveRecordId null tha toh interval silently skip karta tha forever
 *    Ab: interval khud try karta hai fetch/create karne ki — koi bhi user miss nahi hoga
 */

import { useRef, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { stopTaskActivity } from "@/lib/TaskActivityManager";

// ✅ FIX 1: buildMetadata — module level pe rakha
// Pehle ye useCallback ke baad define tha — beforeunload useEffect mein accessible nahi tha
// Ab har jagah se call ho sakta hai bina scope issue ke
const buildMetadata = (s) => ({
  total_typed_chars: s.typedChars,
  total_pasted_chars: s.pastedChars,
  paste_event_count: s.pasteEventCount,
  last_paste_length: s.lastPasteLength,
  backspace_count: s.backspaceCount,
  tab_switch_count: s.tabSwitchCount,
  last_switch_time: s.lastSwitchTime,
  window_minimized_seconds: s.windowMinimizedSeconds,
  screen_hidden_events: s.screenHiddenEvents,
  idle_time_seconds: s.idleTimeSeconds,
  active_seconds: s.activeSeconds,
  wpm: s.wpm,
  last_save: s.lastSave,
  last_activity: new Date().toISOString()
});

// ✅ FIX 2: Direct update — pehle filter (READ) + update (WRITE) = 2 DB calls har 3s pe
// Ab sirf seedha LiveActivity record dhundho sessionId se aur update karo — 1 DB call
const updateBehaviorDirect = async (recordId, existingData, newData) => {
  if (!recordId) return;
  try {
    await base44.entities.LiveActivity.update(recordId, {
      behavior_data: { ...existingData, ...newData }
    });
  } catch (e) {
    console.error('Behavior update failed:', e);
  }
};

// ✅ FIX 6 (NEW): Retry helper — LiveActivity fetch with retries
// Race condition handle karta hai: TaskActivityManager late ho sakta hai record create karne mein
const fetchLiveRecordWithRetry = async (sessionId, retries = 5, delayMs = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const records = await base44.entities.LiveActivity.filter({ session_id: sessionId });
      if (records && records.length > 0) return records[0];
    } catch (e) {
      console.error(`LiveActivity fetch attempt ${i + 1} failed:`, e);
    }
    if (i < retries - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return null;
};

// ✅ FIX 7 (NEW): Auto-create LiveActivity record if not found after retries
// Ensures har user ka ek record hoga in the tracker — no one is invisible
const ensureLiveRecord = async (sessionId, user, taskName, taskId, startTime) => {
  // First try fetching with retries
  const existing = await fetchLiveRecordWithRetry(sessionId);
  if (existing) return existing;

  // Not found after all retries — create it directly
  try {
    const created = await base44.entities.LiveActivity.create({
      session_id: sessionId,
      user_id: user?.id || '',
      user_name: user?.full_name || user?.login_user_id || 'Unknown',
      task_id: taskId || '',
      task_name: taskName || '',
      start_time: startTime,
      status: 'ACTIVE',
      behavior_data: {},
    });
    console.log('[ActivityTracker] LiveActivity record auto-created for:', user?.full_name || user?.login_user_id);
    return created;
  } catch (e) {
    console.error('[ActivityTracker] Failed to auto-create LiveActivity record:', e);
    return null;
  }
};

export function useTaskActivityTracker() {
  const stateRef = useRef(null);

  // ✅ FIX 3: beforeunload — ab buildMetadata accessible hai (module level pe hai)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const s = stateRef.current;
      if (!s || !s.sessionId) return;
      const metadata = buildMetadata(s);
      stopTaskActivity(s.sessionId, 'ABANDONED', metadata).catch(() => {});
      stateRef.current = null;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const startTracking = useCallback(async (user, taskName, taskId = '', sessionId = null) => {
    if (stateRef.current) return;

    // ✅ FIX 5 (NEW): Generate fallback sessionId if null
    // Pehle: sessionId = null hone par poora LiveActivity tracking skip ho jaata tha
    // Ab: guaranteed unique sessionId — har user tracked hoga globally
    const effectiveSessionId = sessionId || `tracker_${user?.id || 'unknown'}_${Date.now()}`;

    const startTime = new Date().toISOString();
    const state = {
      user,
      taskName,
      taskId,
      startTime,
      sessionId: effectiveSessionId,   // ✅ FIX 5: always non-null
      logId: null,
      liveRecordId: null,
      liveRecordData: null,

      // Typing
      typedChars: 0,
      pastedChars: 0,
      pasteEventCount: 0,
      lastPasteLength: 0,
      backspaceCount: 0,

      // Tab / Focus
      tabSwitchCount: 0,
      lastSwitchTime: null,
      windowMinimizedSeconds: 0,
      screenHiddenEvents: 0,
      _hiddenStart: null,

      // Timing
      idleTimeSeconds: 0,
      _lastActivityTime: Date.now(),
      _idleTimer: null,

      // WPM
      _keystrokeTimestamps: [],
      wpm: 0,

      // Save tracking
      lastSave: null,

      // Intervals
      _syncInterval: null,
      _logSyncInterval: null,

      // Active time
      activeSeconds: 0,
      _activeTimer: null,
    };

    stateRef.current = state;

    // Create initial TaskActivityLog
    try {
      const log = await base44.entities.TaskActivityLog.create({
        user_id: user?.id || '',
        user_name: user?.full_name || user?.login_user_id || 'Unknown',
        task_id: taskId,
        task_name: taskName,
        activity_type: 'task_started',
        start_time: startTime,
        metadata: buildMetadata(state),
      });
      state.logId = log?.id;
    } catch (e) {
      console.error('[ActivityTracker] TaskActivityLog create failed:', e);
    }

    // ✅ FIX 6 + FIX 7 (NEW): Fetch LiveActivity with retries, auto-create if missing
    // Yeh async background mein chalega taaki event listeners turant attach ho sakein
    (async () => {
      const record = await ensureLiveRecord(
        effectiveSessionId,
        user,
        taskName,
        taskId,
        startTime
      );
      if (record && stateRef.current) {
        stateRef.current.liveRecordId = record.id;
        stateRef.current.liveRecordData = record.behavior_data || {};
        // Immediately sync current state so the record shows real data right away
        const metadata = buildMetadata(stateRef.current);
        stateRef.current.liveRecordData = { ...stateRef.current.liveRecordData, ...metadata };
        await updateBehaviorDirect(record.id, {}, stateRef.current.liveRecordData);
      }
    })();

    // ── Event Listeners ──────────────────────────────────

    const onKeydown = (e) => {
      const s = stateRef.current;
      if (!s) return;
      s._lastActivityTime = Date.now();
      if (e.key === 'Backspace') { s.backspaceCount++; return; }
      if (e.key.length === 1) {
        s.typedChars++;
        const now = Date.now();
        s._keystrokeTimestamps.push(now);
        const cutoff = now - 60000;
        s._keystrokeTimestamps = s._keystrokeTimestamps.filter(t => t >= cutoff);
        if (s._keystrokeTimestamps.length > 5) {
          const span = (now - s._keystrokeTimestamps[0]) / 60000;
          if (span > 0) s.wpm = Math.round((s._keystrokeTimestamps.length / 5) / span);
        }
      }
    };

    const onPaste = (e) => {
      const s = stateRef.current;
      if (!s) return;
      s._lastActivityTime = Date.now();
      s.pasteEventCount++;
      try {
        const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
        s.lastPasteLength = text.length;
        s.pastedChars += text.length;
      } catch (_) {}
    };

    // Tab switch tracked but does NOT trigger abandon
    const onVisibilityChange = () => {
      const s = stateRef.current;
      if (!s) return;
      if (document.hidden) {
        s.tabSwitchCount++;
        s.screenHiddenEvents++;
        s.lastSwitchTime = new Date().toISOString();
        s._hiddenStart = Date.now();
      } else {
        if (s._hiddenStart) {
          s.windowMinimizedSeconds += Math.floor((Date.now() - s._hiddenStart) / 1000);
          s._hiddenStart = null;
        }
        s._lastActivityTime = Date.now();
      }
    };

    const onActivity = () => {
      const s = stateRef.current;
      if (s) s._lastActivityTime = Date.now();
    };

    document.addEventListener('keydown', onKeydown, true);
    document.addEventListener('paste', onPaste, true);
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('mousemove', onActivity, { passive: true });
    document.addEventListener('touchstart', onActivity, { passive: true });

    state._listeners = { onKeydown, onPaste, onVisibilityChange, onActivity };

    // Idle timer: every 5s
    state._idleTimer = setInterval(() => {
      const s = stateRef.current;
      if (!s) return;
      const idle = (Date.now() - s._lastActivityTime) / 1000;
      if (idle > 30) { s.idleTimeSeconds += 5; }
    }, 5000);

    // Active time — count even when tab is hidden
    state._activeTimer = setInterval(() => {
      const s = stateRef.current;
      if (!s) return;
      const idle = (Date.now() - s._lastActivityTime) / 1000;
      if (idle <= 30) { s.activeSeconds += 2; }
    }, 2000);

    // ✅ FIX 4 + FIX 8 (NEW): DB Sync every 3s — self-healing
    // Pehle: liveRecordId null hone par interval silently skip karta tha forever
    // Ab: agar liveRecordId null hai toh interval khud fetch/create karta hai — self-healing
    state._syncInterval = setInterval(async () => {
      const s = stateRef.current;
      if (!s || !s.sessionId) return;

      // ✅ FIX 8: Self-heal — agar liveRecordId abhi bhi null hai toh try karo
      if (!s.liveRecordId) {
        try {
          const records = await base44.entities.LiveActivity.filter({ session_id: s.sessionId });
          if (records && records.length > 0) {
            s.liveRecordId = records[0].id;
            s.liveRecordData = records[0].behavior_data || {};
          } else {
            // Last resort: create record now
            const created = await base44.entities.LiveActivity.create({
              session_id: s.sessionId,
              user_id: s.user?.id || '',
              user_name: s.user?.full_name || s.user?.login_user_id || 'Unknown',
              task_id: s.taskId || '',
              task_name: s.taskName || '',
              start_time: s.startTime,
              status: 'ACTIVE',
              behavior_data: {},
            });
            if (created) {
              s.liveRecordId = created.id;
              s.liveRecordData = {};
            }
          }
        } catch (e) {
          // Will retry on next interval tick
          return;
        }
      }

      if (!s.liveRecordId) return; // Still failed, try next tick

      const metadata = buildMetadata(s);
      s.liveRecordData = { ...s.liveRecordData, ...metadata };
      await updateBehaviorDirect(s.liveRecordId, {}, s.liveRecordData);
    }, 3000);

    state._logSyncInterval = setInterval(() => {
      syncToDB(false);
    }, 20000);

  }, []);

  const syncToDB = useCallback(async (completed = false, abandoned = false) => {
    const s = stateRef.current;
    if (!s || !s.logId) return;
    const now = new Date().toISOString();
    const totalSeconds = Math.floor((Date.now() - new Date(s.startTime).getTime()) / 1000);
    try {
      let activityType = 'task_started';
      if (completed) activityType = 'task_completed';
      else if (abandoned) activityType = 'task_abandoned';
      await base44.entities.TaskActivityLog.update(s.logId, {
        activity_type: activityType,
        end_time: now,
        duration_seconds: totalSeconds,
        metadata: buildMetadata(s),
      });
    } catch (e) {}
  }, []);

  const markSave = useCallback(() => {
    const s = stateRef.current;
    if (s) s.lastSave = new Date().toISOString();
  }, []);

  const stopTracking = useCallback(async (completed = false, abandoned = false) => {
    const s = stateRef.current;
    if (!s) return;

    // Clear all intervals
    clearInterval(s._syncInterval);
    clearInterval(s._logSyncInterval);
    clearInterval(s._idleTimer);
    clearInterval(s._activeTimer);

    // Remove listeners
    if (s._listeners) {
      document.removeEventListener('keydown', s._listeners.onKeydown, true);
      document.removeEventListener('paste', s._listeners.onPaste, true);
      document.removeEventListener('visibilitychange', s._listeners.onVisibilityChange);
      document.removeEventListener('mousemove', s._listeners.onActivity);
      document.removeEventListener('touchstart', s._listeners.onActivity);
    }

    // Sync TaskActivityLog
    await syncToDB(completed, abandoned);

    // Move LiveActivity → ActivityHistory
    if (s.sessionId) {
      const status = completed ? 'COMPLETED' : abandoned ? 'ABANDONED' : 'STOPPED';
      try {
        await stopTaskActivity(s.sessionId, status, buildMetadata(s));
      } catch (e) {
        console.error('stopTaskActivity failed:', e);
      }
    }

    stateRef.current = null;
  }, [syncToDB]);

  return { startTracking, stopTracking, markSave };
}
