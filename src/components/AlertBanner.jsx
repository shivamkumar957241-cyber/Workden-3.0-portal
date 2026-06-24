import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Bell, Wrench, AlertTriangle, Clock } from "lucide-react";

export default function AlertBanner({ user }) {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('workden_dismissed_alerts') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const settings = await base44.entities.GlobalSettings.list();
      const now = new Date();
      const today = new Date(now); today.setHours(0,0,0,0);
      const newAlerts = [];

      // Maintenance alerts (show 3 days before)
      const maintDateStr = settings.find(s => s.setting_key === 'maintenance_date')?.setting_value;
      const maintMsg = settings.find(s => s.setting_key === 'maintenance_message')?.setting_value;
      if (maintDateStr && maintMsg) {
        const maintDate = new Date(maintDateStr);
        const daysUntil = Math.ceil((maintDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 3) {
          newAlerts.push({
            id: `maintenance_${maintDateStr}`,
            type: 'maintenance',
            icon: <Wrench className="w-4 h-4" />,
            bgColor: 'bg-orange-500',
            text: daysUntil === 0 ? `🔧 Maintenance Today: ${maintMsg}` : `🔧 Maintenance in ${daysUntil} day${daysUntil > 1 ? 's' : ''}: ${maintMsg}`
          });
        }
      }

      // Task hold alert (show 30 days countdown)
      const holdDateStr = settings.find(s => s.setting_key === 'task_hold_date')?.setting_value;
      const holdMsg = settings.find(s => s.setting_key === 'task_hold_message')?.setting_value;
      if (holdDateStr && holdMsg) {
        const holdDate = new Date(holdDateStr);
        const daysUntil = Math.ceil((holdDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 30) {
          newAlerts.push({
            id: `taskhold_${holdDateStr}`,
            type: 'hold',
            icon: <Clock className="w-4 h-4" />,
            bgColor: 'bg-red-600',
            text: daysUntil === 0 ? `⏸️ Task Hold Today: ${holdMsg}` : `⏸️ Task Hold in ${daysUntil} days: ${holdMsg}`
          });
        }
      }

      // Upcoming task alert (show 7 days before)
      const newTaskDateStr = settings.find(s => s.setting_key === 'new_task_date')?.setting_value;
      const newTaskMsg = settings.find(s => s.setting_key === 'new_task_message')?.setting_value;
      if (newTaskDateStr && newTaskMsg) {
        const newTaskDate = new Date(newTaskDateStr);
        const daysUntil = Math.ceil((newTaskDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 7) {
          newAlerts.push({
            id: `newtask_${newTaskDateStr}`,
            type: 'newtask',
            icon: <Bell className="w-4 h-4" />,
            bgColor: 'bg-blue-600',
            text: daysUntil === 0 ? `🆕 New Task Today: ${newTaskMsg}` : `🆕 New Task in ${daysUntil} days: ${newTaskMsg}`
          });
        }
      }

      setAlerts(newAlerts.filter(a => !dismissed.includes(a.id)));
    } catch (e) {}
  };

  const dismiss = (id) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('workden_dismissed_alerts', JSON.stringify(newDismissed));
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (!alerts.length || user?.role === 'admin') return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] space-y-0">
      {alerts.map(alert => (
        <div key={alert.id} className={`${alert.bgColor} text-white px-4 py-2 flex items-center justify-between gap-3 text-sm font-semibold`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {alert.icon}
            <span className="truncate">{alert.text}</span>
          </div>
          <button onClick={() => dismiss(alert.id)} className="flex-shrink-0 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
