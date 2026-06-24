import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

export default function SessionTracker() {
  const sessionStartRef = useRef(null);
  const updateIntervalRef = useRef(null);

  useEffect(() => {
    let currentUser = null;

    const startSession = async () => {
      try {
        currentUser = await base44.auth.me();
        sessionStartRef.current = new Date();
        
        // Mark user as online
        await base44.entities.User.update(currentUser.id, {
          is_online: true,
          last_active: new Date().toISOString()
        });

        // Update last_active every 30 seconds
        updateIntervalRef.current = setInterval(async () => {
          try {
            await base44.entities.User.update(currentUser.id, {
              last_active: new Date().toISOString()
            });
          } catch (error) {
            console.error("Failed to update last_active:", error);
          }
        }, 30000);
      } catch (error) {
        console.error("Failed to start session:", error);
      }
    };

    const endSession = async () => {
      if (!currentUser || !sessionStartRef.current) return;

      try {
        const sessionEnd = new Date();
        const durationSeconds = Math.floor((sessionEnd - sessionStartRef.current) / 1000);

        const existingLogs = currentUser.session_logs || [];
        const newLog = {
          login_time: sessionStartRef.current.toISOString(),
          logout_time: sessionEnd.toISOString(),
          duration_seconds: durationSeconds
        };

        await base44.entities.User.update(currentUser.id, {
          is_online: false,
          last_active: sessionEnd.toISOString(),
          total_time_spent: (currentUser.total_time_spent || 0) + durationSeconds,
          session_logs: [...existingLogs, newLog]
        });
      } catch (error) {
        console.error("Failed to end session:", error);
      }
    };

    startSession();

    // Handle page unload
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      endSession();
    };
  }, []);

  return null;
}
