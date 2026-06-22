import { base44 } from '@/api/base44Client';

/**
 * Manages task activity lifecycle:
 * START → Insert into LiveActivity
 * STOP → Move to ActivityHistory, Delete from LiveActivity
 */

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * START TASK — Insert into LiveActivity (not UPDATE)
 */
export const startTaskActivity = async (userId, userName, taskName, taskType = null) => {
  try {
    const sessionId = generateSessionId();
    
    let retries = 3;
    while (retries > 0) {
      try {
        await base44.entities.LiveActivity.create({
          session_id: sessionId,
          user_id: userId,
          user_name: userName,
          task_name: taskName,
          task_type: taskType || taskName,
          start_time: new Date().toISOString(),
          status: 'LIVE',
          behavior_data: {
            total_typed_chars: 0,
            total_pasted_chars: 0,
            paste_event_count: 0,
            last_paste_length: 0,
            backspace_count: 0,
            tab_switch_count: 0,
            last_switch_time: null,
            window_minimized_seconds: 0,
            screen_hidden_events: 0,
            idle_time_seconds: 0,
            active_seconds: 0,
            wpm: 0,
            items_saved: 0,
            speed_per_hour: 0,
            elapsed_seconds: 0,
            last_save: null,
            last_activity: new Date().toISOString()
          }
        });

        console.log('✅ Task activity started:', { sessionId, userId, taskName });
        return sessionId;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(r => setTimeout(r, 300));
      }
    }
  } catch (error) {
    console.error('Failed to start task activity:', error);
    throw error;
  }
};

/**
 * STOP TASK — Insert into ActivityHistory, then DELETE from LiveActivity
 */
export const stopTaskActivity = async (sessionId, status = 'STOPPED', behaviorData = {}) => {
  try {
    const liveRecords = await base44.entities.LiveActivity.filter({ session_id: sessionId });
    
    if (!liveRecords || liveRecords.length === 0) {
      console.warn(`No live activity found for session: ${sessionId}`);
      return;
    }

    const liveRecord = liveRecords[0];
    const endTime = new Date().toISOString();
    const startTime = new Date(liveRecord.start_time);
    const totalDuration = Math.floor((new Date(endTime) - startTime) / 1000);

    const mergedBehavior = {
      ...(liveRecord.behavior_data || {}),
      ...(behaviorData || {}),
      task_content: behaviorData?.task_content || null,
      entries_completed: behaviorData?.entries_completed || 0,
      items_saved: behaviorData?.items_saved || 0,
      tab_switch_count: behaviorData?.tab_switches ?? liveRecord.behavior_data?.tab_switch_count ?? 0,
      typing_metrics: {
        ...(liveRecord.behavior_data?.typing_metrics || {}),
        ...(behaviorData?.typing_metrics || {})
      }
    };

    const historyData = {
      session_id: liveRecord.session_id,
      user_id: liveRecord.user_id,
      user_name: liveRecord.user_name,
      task_name: liveRecord.task_name,
      task_type: liveRecord.task_type,
      start_time: liveRecord.start_time,
      end_time: endTime,
      total_duration: totalDuration,
      status: status,
      behavior_data: mergedBehavior
    };
    
    await base44.entities.ActivityHistory.create(historyData);
    await base44.entities.LiveActivity.delete(liveRecord.id);

    console.log(`✅ Task activity completed - Session: ${sessionId}, Duration: ${totalDuration}s`);
  } catch (error) {
    console.error('Failed to stop task activity:', error);
    throw error;
  }
};

/**
 * UPDATE TASK — Real-time update while task is LIVE
 * Har 30s pe aur har save pe call hota hai
 * Items saved, tab switches, speed, elapsed time — sab update hota hai
 * last_activity bhi refresh hoti hai — yahi heartbeat ka kaam karta hai
 */
export const updateTaskActivity = async (sessionId, updateData = {}) => {
  try {
    const liveRecords = await base44.entities.LiveActivity.filter({ session_id: sessionId });
    if (!liveRecords || liveRecords.length === 0) {
      console.warn(`updateTaskActivity: No live record for session ${sessionId}`);
      return;
    }

    const existing = liveRecords[0].behavior_data || {};

    await base44.entities.LiveActivity.update(liveRecords[0].id, {
      behavior_data: {
        ...existing,
        items_saved: updateData.items_saved ?? existing.items_saved ?? 0,
        tab_switch_count: updateData.tab_switches ?? existing.tab_switch_count ?? 0,
        elapsed_seconds: updateData.elapsed_seconds ?? existing.elapsed_seconds ?? 0,
        speed_per_hour: updateData.speed_per_hour ?? existing.speed_per_hour ?? 0,
        task_content: updateData.task_content ?? existing.task_content ?? null,
        last_activity: new Date().toISOString(), // heartbeat
      }
    });
  } catch (error) {
    // Non-blocking — real-time update fail hone pe task nahi rukna chahiye
    console.warn('updateTaskActivity failed (non-blocking):', error);
  }
};

/**
 * Update behavior data while task is LIVE (existing function — preserved)
 */
export const updateTaskBehavior = async (sessionId, behaviorData) => {
  try {
    const liveRecords = await base44.entities.LiveActivity.filter({ session_id: sessionId });
    if (liveRecords && liveRecords.length > 0) {
      const existing = liveRecords[0].behavior_data || {};
      await base44.entities.LiveActivity.update(liveRecords[0].id, {
        behavior_data: {
          ...existing,
          ...behaviorData,
          last_activity: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Failed to update task behavior:', error);
  }
};

/**
 * Auto-close genuinely inactive sessions (browser crash / tab band recovery)
 * last_activity check karta hai — 2 ghante inactive ho toh ABANDONED mark karo
 */
export const autoCloseInactiveSessions = async () => {
  try {
    const liveActivities = await base44.entities.LiveActivity.list();
    const now = new Date();
    const twoHoursMs = 2 * 60 * 60 * 1000;

    for (const activity of liveActivities) {
      const lastActive = new Date(
        activity.behavior_data?.last_activity || activity.start_time
      );
      const elapsed = now - lastActive;

      if (elapsed > twoHoursMs) {
        console.log(
          `Auto-closing genuinely inactive session: ${activity.session_id}`,
          `| Last active: ${lastActive.toISOString()}`
        );
        await stopTaskActivity(activity.session_id, 'ABANDONED');
      }
    }
  } catch (error) {
    console.error('Failed to auto-close inactive sessions:', error);
  }
};

/**
 * Get current live activities for a user
 */
export const getUserLiveActivities = async (userId) => {
  try {
    return await base44.entities.LiveActivity.filter({ user_id: userId });
  } catch (error) {
    console.error('Failed to fetch user live activities:', error);
    return [];
  }
};

/**
 * Get activity history for a user
 */
export const getUserActivityHistory = async (userId, limit = 50) => {
  try {
    return await base44.entities.ActivityHistory.filter({ user_id: userId }, '-end_time', limit);
  } catch (error) {
    console.error('Failed to fetch user activity history:', error);
    return [];
  }
};

export default {
  startTaskActivity,
  stopTaskActivity,
  updateTaskActivity,
  updateTaskBehavior,
  autoCloseInactiveSessions,
  getUserLiveActivities,
  getUserActivityHistory
};