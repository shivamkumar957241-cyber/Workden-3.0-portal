import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TaskPreviewScreen from "@/components/TaskPreviewScreen";
import TaskTimeGuard from "@/components/TaskTimeGuard";
import TaskLockedScreen from "@/components/TaskLockedScreen";
import TaskRefreshWarning from "@/components/TaskRefreshWarning";
import { useTaskLock } from "@/lib/TaskLockContext";
import { getTaskLockStatus, setTaskLocked, buildVIPReportHeader, buildVIPReportFooter } from "@/lib/taskLockStorage";
import { useTaskActivityTracker } from "@/lib/useTaskActivityTracker";
import { startTaskActivity, stopTaskActivity } from "@/lib/TaskActivityManager";

const TASK_NAME = "Form Filling";
let currentSessionId = null;

const TOTAL = 60;
const REWARD = "₹225";
const TASK_DURATION = 8 * 60 * 60;

const FIELDS = [
  ["fullName", "Full Name"],
  ["emailAddress", "Email Address"],
  ["phoneNumber", "Phone Number"],
  ["alternatePhoneNumber", "Alternate Phone Number"],
  ["aadharNumber", "Aadhar Number"],
  ["panNumber", "Pan Number"],
  ["city", "City"],
  ["state", "State"],
  ["pinCode", "Pin Code"],
  ["dob", "Dob"],
  ["gender", "Gender"],
  ["nationality", "Nationality"],
  ["organizationCompanyName", "Organization Company Name"],
  ["totalExperienceYears", "Total Experience Years"],
  ["qualification", "Qualification"],
  ["maritalStatus", "Marital Status"],
];

function createForm(i) {
  const form = { id: i + 1, isSaved: false, fullAddress: "" };
  FIELDS.forEach(([f]) => { form[f] = ""; });
  return form;
}

export default function FormFilling() {
  const [user, setUser] = useState(null);
  const [forms, setForms] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(TASK_DURATION);
  const [showPreview, setShowPreview] = useState(true);
  const [lockStatus, setLockStatus] = useState({ isLocked: false, lockUntil: null });
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const navigate = useNavigate();
  const { registerTask, unregisterTask, lockAndLeave } = useTaskLock();
  const { startTracking, stopTracking, markSave } = useTaskActivityTracker();
  const startTimeRef = useRef(null);

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
    setForms(Array.from({ length: TOTAL }, (_, i) => createForm(i)));
    const ls = getTaskLockStatus(TASK_NAME);
    setLockStatus(ls);
    const savedStart = sessionStorage.getItem(`task_start_${TASK_NAME}`);
    if (savedStart && !ls.isLocked) {
      const t = parseInt(savedStart);
      setStartTime(t);
      startTimeRef.current = t;
      setShowPreview(false);
      setShowRefreshWarning(true);
    }
  }, []);

  useEffect(() => {
    if (!startTime) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, TASK_DURATION - Math.floor((Date.now() - startTime) / 1000));
      setRemainingTime(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        alert("⏰ Time is over! Your 8-hour task time has ended. You can no longer edit or save.");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    return () => {
      unregisterTask();
      if (startTime && currentSessionId) {
         const behaviorData = {
           entries_completed: forms?.filter(f => f.isSaved).length || 0,
           items_saved: forms?.filter(f => f.isSaved).length || 0,
           task_content: `Form Filling - ${forms?.filter(f => f.isSaved).length || 0} forms completed`
         };
         stopTaskActivity(currentSessionId, 'ABANDONED', behaviorData).catch(() => {});
         stopTracking(false, true).catch(() => {});
         sessionStorage.removeItem(`task_start_${TASK_NAME}`);
         sessionStorage.removeItem(`task_session_${TASK_NAME}`);
         sessionStorage.removeItem('workden_active_task_name');
         currentSessionId = null;
       }
    };
  }, [stopTracking, startTime, unregisterTask]);


  const handleStart = async () => {
    const now = Date.now();
    setStartTime(now);
    startTimeRef.current = now;
    sessionStorage.setItem(`task_start_${TASK_NAME}`, now.toString());
    sessionStorage.setItem('workden_active_task_name', TASK_NAME);
    setShowPreview(false);

    console.log('🚀 Task Started:', { user: user?.id, userName: user?.full_name || user?.email, taskName: TASK_NAME });

    try {
      currentSessionId = await startTaskActivity(user?.id, user?.full_name || user?.email, TASK_NAME, 'Form Filling');
      console.log('📍 Session ID:', currentSessionId);
      sessionStorage.setItem(`task_session_${TASK_NAME}`, currentSessionId);
    } catch(e) {
      console.error('❌ Failed to start activity:', e);
    }

    // FIX #1: Pass sessionId directly to tracker — no race condition
    startTracking(user, TASK_NAME, TASK_NAME, currentSessionId);
    registerTask(async () => {
      setTaskLocked(TASK_NAME);
      try {
        const lockUntil = new Date();
        lockUntil.setDate(lockUntil.getDate() + 1);
        lockUntil.setHours(9, 0, 0, 0);
        const existing = await base44.entities.ActiveTask.filter({ user_id: user?.id, status: 'active' });
        if (existing?.length > 0) {
          await base44.entities.ActiveTask.update(existing[0].id, { status: 'locked', locked_until: lockUntil.toISOString(), lock_reason: 'incomplete' });
        }
      } catch(e) {}
    });
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const handleChange = (id, field, value) => {
    setForms(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleSave = async (form) => {
    if (remainingTime === 0) { alert("⏰ Time is over! You cannot save anymore."); return; }
    const now = new Date(); const h = now.getHours(), m = now.getMinutes();
    if (h * 60 + m < 9 * 60 || h * 60 + m > 23 * 60 + 30) {
      alert("⚠️ Task submission is allowed only between 9:00 AM to 11:30 PM"); return;
    }
    if (!user?.id) { alert("⚠️ User session error. Please refresh the page."); return; }
    if (!form.fullName || !form.emailAddress || !form.phoneNumber) {
      alert("⚠️ Please fill Full Name, Email, and Phone!"); return;
    }
    try {
      const content = [...FIELDS.map(([f, l]) => `${l}: ${form[f] || 'N/A'}`), `Full Address: ${form.fullAddress || 'N/A'}`].join('\n');
      await base44.entities.SavedWork.create({
        user_id: user?.id, user_name: user?.full_name || user?.email,
        user_id_number: user?.login_user_id || user?.id,
        work_type: "Form Filling", task_content: `Form #${form.id}\n${content}`,
        saved_date: new Date().toISOString(), status: "pending",
        reward_amount: 0, start_time: new Date(startTimeRef.current || startTime || Date.now()).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: Math.floor((Date.now() - (startTimeRef.current || startTime || Date.now())) / 1000),
        payment_completed: false
      });
      setSavedCount(p => p + 1);
      setForms(prev => prev.map(f => f.id === form.id ? { ...f, isSaved: true } : f));
      markSave();
      } catch (e) { 
      console.error('Save error:', e);
      alert("❌ Failed to save. Please try again."); 
      }
  };

  const downloadFile = () => {
    if (!savedCount) { alert("⚠️ No forms saved yet!"); return; }
    const saved = forms.filter(f => f.isSaved);
    const startDate = startTime ? new Date(startTime) : new Date();
    const endDate = new Date();
    const totalSec = Math.floor((endDate - startDate) / 1000);

    let txt = buildVIPReportHeader({ user, taskName: TASK_NAME, startDate, endDate, totalSec, completed: saved.length, total: TOTAL, reward: REWARD });

    txt += `  ┌${'─'.repeat(56)}┐\n`;
    txt += `  │                   FORM DATA                            │\n`;
    txt += `  └${'─'.repeat(56)}┘\n\n`;

    saved.forEach((f) => {
      txt += `  ╔${'═'.repeat(56)}╗\n`;
      txt += `  ║  FORM #${String(f.id).padEnd(49)}║\n`;
      txt += `  ╚${'═'.repeat(56)}╝\n`;
      FIELDS.forEach(([field, label]) => {
        txt += `  ${label.padEnd(30)}: ${f[field] || 'N/A'}\n`;
      });
      txt += `  ${'Full Address'.padEnd(30)}: ${f.fullAddress || 'N/A'}\n`;
      txt += `  ${'-'.repeat(58)}\n\n`;
    });

    txt += buildVIPReportFooter();

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `WorkDen_FormFilling_Report_${new Date().toISOString().split('T')[0]}.txt`; a.click();
    URL.revokeObjectURL(url);
    alert(`✅ Report Downloaded!\n\n📤 Submit via Menu (☰) → "Submit Your Work"`);
  };

  if (lockStatus.isLocked) {
    return <TaskLockedScreen taskName={TASK_NAME} lockUntil={lockStatus.lockUntil} onBack={() => navigate(createPageUrl("Tasks"))} />;
  }

  if (showPreview) {
    return (
      <TaskTimeGuard>
        <TaskPreviewScreen
          taskName="Form Filling"
          reward={REWARD}
          total={TOTAL}
          fields={FIELDS}
          onStart={handleStart}
          onBack={() => navigate(createPageUrl("Tasks"))}
        />
      </TaskTimeGuard>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {showRefreshWarning && (
        <TaskRefreshWarning
          taskName={TASK_NAME}
          onContinue={() => setShowRefreshWarning(false)}
          onExit={() => { setShowRefreshWarning(false); lockAndLeave('/Tasks'); }}
        />
      )}
      {/* Top Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <Button variant="ghost" size="icon" onClick={async () => {
          if (window.confirm("⚠️ If you leave this task, it will be LOCKED until tomorrow 9:00 AM. Do you want to continue?")) {
            if (currentSessionId) {
              try {
                const behaviorData = {
                   entries_completed: forms.filter(f => f.isSaved).length,
                   items_saved: forms.filter(f => f.isSaved).length,
                   task_content: `Form Filling - ${forms.filter(f => f.isSaved).length} forms completed`
                 };
                 await stopTaskActivity(currentSessionId, 'STOPPED', behaviorData);
              } catch(e) { console.error('Failed to stop activity:', e); }
              currentSessionId = null;
            }
            sessionStorage.removeItem(`task_start_${TASK_NAME}`);
            sessionStorage.removeItem(`task_session_${TASK_NAME}`);
            sessionStorage.removeItem('workden_active_task_name');
            try {
              await stopTracking(false, true);
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch(e) {}
            lockAndLeave('/Tasks');
          }
        }} className="rounded-full border">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-purple-700">Form Filling</h1>
        </div>
        <div className="text-sm font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
          ⏱ {String(Math.floor(remainingTime/3600)).padStart(2,'0')}:{String(Math.floor((remainingTime%3600)/60)).padStart(2,'0')}:{String(remainingTime%60).padStart(2,'0')}
        </div>
        <span className="text-sm font-semibold text-gray-600">{savedCount}/{TOTAL}</span>
      </div>

      {/* Items */}
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {forms.map((form, index) => (
          <div key={form.id} className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
            {/* Item Header */}
            <div className={`flex items-center justify-between px-5 py-4 text-white font-semibold ${
              index % 2 === 0
                ? 'bg-gradient-to-r from-purple-700 to-purple-500'
                : 'bg-gradient-to-r from-blue-500 to-teal-400'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 bg-white/25 rounded-full flex items-center justify-center font-bold text-base">{form.id}</span>
                <span className="text-lg font-bold">Item #{form.id}</span>
              </div>
              {!form.isSaved ? (
                <Button onClick={() => handleSave(form)} size="sm"
                  className="bg-white/20 hover:bg-white/35 text-white border border-white/40 font-semibold px-4 py-2 h-auto rounded-xl">
                  <Save className="w-4 h-4 mr-1.5" />Save
                </Button>
              ) : (
                <span className="text-sm bg-green-500 px-4 py-1.5 rounded-full font-semibold">✓ Saved</span>
              )}
            </div>

            {/* Item Content */}
            <div className="bg-white p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FIELDS.map(([field, label]) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label} *</label>
                    <textarea
                      placeholder="Type here..."
                      value={form[field]}
                      onChange={e => { handleChange(form.id, field, e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      disabled={form.isSaved}
                      rows={1}
                      className="w-full border border-gray-200 focus:border-purple-400 text-base bg-white rounded-lg px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-1 focus:ring-purple-400 disabled:opacity-60 disabled:bg-gray-50"
                      style={{ fontSize: '16px', minHeight: '44px' }}
                    />
                  </div>
                ))}
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Address *</label>
                  <textarea
                    placeholder="Type here..."
                    value={form.fullAddress}
                    onChange={e => { handleChange(form.id, 'fullAddress', e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                    disabled={form.isSaved}
                    rows={1}
                    className="w-full border border-gray-200 focus:border-purple-400 text-base bg-white rounded-lg px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-1 focus:ring-purple-400 disabled:opacity-60 disabled:bg-gray-50"
                    style={{ fontSize: '16px', minHeight: '44px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Download Button at bottom */}
        <div className="pt-4 pb-8">
          <button
            onClick={downloadFile}
            disabled={savedCount === 0}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-base shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Download File ({savedCount} saved)
          </button>
        </div>
      </div>
    </div>
  );
}