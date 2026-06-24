import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { queryClientInstance } from "@/lib/query-client";
import BottomNav from "./components/BottomNav";
import ReferralHandler from "./components/ReferralHandler";
import SessionTracker from "./components/SessionTracker";
import SystemVerification from "./components/SystemVerification";
import TaskNavigationWarning from "./components/TaskNavigationWarning";
import { useTaskLock } from "./lib/TaskLockContext";
import HolidayNotice from "./components/HolidayNotice";
import AlertBanner from "./components/AlertBanner";
import TermsSignatureDialog from "./components/TermsSignatureDialog";
import DailyFeedbackSurvey from "./components/DailyFeedbackSurvey";
import {
  Settings, HelpCircle, Upload, LogOut, Menu, X, Save,
  MessageCircle, Trophy, Bell, BarChart3, Shield, Building2,
  FileText, Download, GraduationCap, Users, CreditCard,
  Calendar, Gift, Play, Star, DollarSign, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";

// ─── HEARTBEAT CONFIG ────────────────────────────────────────────────────────
// Tab visible hai  → har 15 sec mein last_active + last_heartbeat update
// Tab hidden hai   → heartbeat band, last_active/last_heartbeat stale
// Tab wapas aao    → turant ping + interval restart
// Admin panel threshold = 45 sec (RecruiterDashboard.jsx isReallyOnline mein set hai)
const HEARTBEAT_INTERVAL_MS = 15 * 1000; // 15 seconds
// ─────────────────────────────────────────────────────────────────────────────

export default function Layout({ children, currentPageName }) {
  const [user, setUser]                               = useState(null);
  const [loading, setLoading]                         = useState(false);
  const [sidebarOpen, setSidebarOpen]                 = useState(false);
  const [submitWorkOpen, setSubmitWorkOpen]           = useState(false);
  const [selectedTask, setSelectedTask]               = useState("");
  const [fileLink, setFileLink]                       = useState("");
  const [workNotes, setWorkNotes]                     = useState("");
  const [tasks, setTasks]                             = useState([]);
  const [submittingWork, setSubmittingWork]           = useState(false);
  const [taskRewardsDialog, setTaskRewardsDialog]     = useState(false);
  const [taskRewardsPasswordInput, setTaskRewardsPasswordInput] = useState("");
  const [taskRewardsUnlocked, setTaskRewardsUnlocked] = useState(false);
  const [callDialog, setCallDialog]                   = useState(false);
  const [callForm, setCallForm]                       = useState({ fullName: "", mobile: "", email: "", subject: "", issue: "" });
  const [submittingCall, setSubmittingCall]           = useState(false);
  const [globalSettings, setGlobalSettings]           = useState([]);
  const [holidays, setHolidays]                       = useState([]);
  const [platformOff, setPlatformOff]                 = useState(false);

  // ── Global Subscription Listener (Instant Unlock & Lock) ──────────────────
  useEffect(() => {
    let unsubscribe = null;
    const userSource = localStorage.getItem('workden_3_user_source');
    if (user?.id && userSource === 'appuser') {
      unsubscribe = base44.entities.AppUser.subscribeDoc(user.id, (event) => {
         if (event.data) {
            setUser(prev => {
               if (prev) {
                   const wasUnlocked = prev.is_subscribed || prev.free_unlock;
                   const isUnlocked = event.data.is_subscribed || event.data.free_unlock;
                   
                   // If status changed in either direction (Unlock -> Lock OR Lock -> Unlock)
                   if (wasUnlocked !== isUnlocked) {
                       localStorage.setItem('workden_3_user', JSON.stringify(event.data));
                       window.location.reload();
                   }
               }
               return event.data;
            });
            localStorage.setItem('workden_3_user', JSON.stringify(event.data));
         }
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  // ── Global Cache Buster (Instant Admin Updates) ─────────────────────────
  useEffect(() => {
    let unsubscribe = null;
    try {
      unsubscribe = base44.entities.Settings.subscribeDoc('cache_buster', (event) => {
         if (event.data && event.data.timestamp) {
             const lastBust = localStorage.getItem('workden_last_cache_bust');
             if (lastBust && Number(lastBust) < event.data.timestamp) {
                 queryClientInstance.invalidateQueries(); // Force fetch new data instantly
             }
             localStorage.setItem('workden_last_cache_bust', event.data.timestamp);
         }
      });
    } catch(e) {}
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // ── Heartbeat refs (no re-render needed) ────────────────────────────────
  const heartbeatIntervalRef = useRef(null);
  const lastPingSentRef      = useRef(0);
  const heartbeatUserIdRef   = useRef(null); // tracks which user's heartbeat is running

  // ── Heartbeat: send one ping ─────────────────────────────────────────────
  const sendHeartbeatPing = useCallback(async (userId) => {
    if (!userId) return;

    // Debounce: 10 sec ke andar baar baar ping mat karo
    const now = Date.now();
    if (now - lastPingSentRef.current < 10_000) return;
    lastPingSentRef.current = now;

    try {
      await base44.entities.AppUser.update(userId, {
        last_active: new Date().toISOString(),
        // ✅ FIX: last_heartbeat bhi update karo
        // RecruiterDashboard ka isReallyOnline() last_heartbeat ko 45s threshold se check karta hai.
        // Pehle sirf last_active update hota tha → fallback 5-min threshold laga → user 5 min tak
        // "online" dikhta tha tab switch karne ke baad bhi.
        // Ab last_heartbeat bhi set hoga → 45s mein correctly offline ho jaayega.
        last_heartbeat: new Date().toISOString(),
      });
    } catch (err) {
      // Network error — silently ignore, don't crash
      console.warn("[Heartbeat] ping failed:", err?.message);
    }
  }, []);

  // ── Heartbeat: start interval (tab visible) ──────────────────────────────
  const startHeartbeat = useCallback((userId) => {
    if (!userId) return;
    clearInterval(heartbeatIntervalRef.current);
    sendHeartbeatPing(userId);                                         // turant ek ping
    heartbeatIntervalRef.current = setInterval(
      () => sendHeartbeatPing(userId),
      HEARTBEAT_INTERVAL_MS
    );
  }, [sendHeartbeatPing]);

  // ── Heartbeat: stop interval (tab hidden) ────────────────────────────────
  const stopHeartbeat = useCallback(() => {
    clearInterval(heartbeatIntervalRef.current);
    heartbeatIntervalRef.current = null;
    // last_active / last_heartbeat ko manually change nahi karte —
    // bas update band karo, 45s mein apne aap stale/offline ho jaayega
  }, []);

  // ── Heartbeat: setup effect — runs when user loads ───────────────────────
  useEffect(() => {
    const userSource = localStorage.getItem('workden_3_user_source');

    // Sirf appuser ke liye heartbeat — admin ya guest ke liye nahi
    if (!user?.id || userSource !== 'appuser' || user?.role === 'admin') return;

    heartbeatUserIdRef.current = user.id;

    // ── visibilitychange — CORE LOGIC ────────────────────────────────────
    // Tab pe aao    → startHeartbeat (ping + interval)
    // Tab chhodo    → stopHeartbeat (interval band)
    const handleVisibilityChange = () => {
      const uid = heartbeatUserIdRef.current;
      if (document.visibilityState === "visible") {
        startHeartbeat(uid);   // portal tab pe wapas aaye
      } else {
        stopHeartbeat();       // dusre tab pe gaye
      }
    };

    // Window focus bhi handle karo (Alt+Tab, taskbar se wapas aana)
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        startHeartbeat(heartbeatUserIdRef.current);
      }
    };

    // Mount pe — agar tab abhi visible hai toh turant start karo
    if (document.visibilityState === "visible") {
      startHeartbeat(user.id);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      stopHeartbeat();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      heartbeatUserIdRef.current = null;
    };
  }, [user?.id, startHeartbeat, stopHeartbeat]);
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const cachedUser  = localStorage.getItem('workden_3_user');
    const cachedTasks = localStorage.getItem('workden_tasks');

    if (cachedUser)  { try { setUser(JSON.parse(cachedUser));   } catch (e) {} }
    if (cachedTasks) { try { setTasks(JSON.parse(cachedTasks)); } catch (e) {} }

    loadUser();
    loadTasks();
    loadGlobalSettings();
    loadHolidays();

    // SESSION POLL — checks every 30s if this session is still valid
    const sessionPollInterval = setInterval(async () => {
      const userSource      = localStorage.getItem('workden_3_user_source');
      const storedSessionId = localStorage.getItem('workden_3_session_id');
      const savedUserId     = localStorage.getItem('workden_3_login_id');

      if (userSource !== 'appuser' || !storedSessionId || !savedUserId) return;

      try {
        const dbUsers = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
        if (!dbUsers || dbUsers.length === 0) return;

        const dbUser = dbUsers[0];

        if (dbUser.status === 'inactive') {
          alert("⚠️ Your account has been deactivated. Please contact admin.");
          localStorage.clear(); sessionStorage.clear();
          window.location.replace("#" + createPageUrl("UserLogin"));
          return;
        }

        const sessionChanged = dbUser.session_id && dbUser.session_id !== storedSessionId;
        if (sessionChanged) {
          const lastActive    = dbUser.last_active ? new Date(dbUser.last_active) : null;
          const fiveMinsAgo   = new Date(Date.now() - 5 * 60 * 1000);
          const otherDeviceIsActive = lastActive && lastActive > fiveMinsAgo;
          if (otherDeviceIsActive) {
            alert("⚠️ You have been logged out because another device logged in with your account.");
            localStorage.clear(); sessionStorage.clear();
            window.location.replace("#" + createPageUrl("UserLogin"));
            return;
          }
        }

        if (dbUser.role !== 'admin' && (!dbUser.is_subscribed && !dbUser.free_unlock)) {
          localStorage.setItem('workden_3_user', JSON.stringify(dbUser));
          setUser(dbUser);
        }
      } catch (e) {
        // Network error — skip this tick
      }
    }, 30000);

    // Task page security (copy/paste/right-click disable)
    const TASK_PAGE_NAMES = ['DataEntry','FormFilling','GrammarCorrection','EbookTyping','CaptchaFilling','TaskWorkspace','ChatSupport','PdfToWordTyping','Typing'];
    const isOnTaskPage = TASK_PAGE_NAMES.includes(currentPageName);

    const handleContextMenu = (e) => { if (currentPageName === 'CopyPaste') return; if (isOnTaskPage) e.preventDefault(); };
    const handleCopy        = (e) => { if (isOnTaskPage && currentPageName !== 'CopyPaste') e.preventDefault(); };
    const handleCut         = (e) => { if (isOnTaskPage) e.preventDefault(); };
    const handlePaste       = (e) => { if (isOnTaskPage) e.preventDefault(); };
    const handleDragStart   = (e) => { if (isOnTaskPage) e.preventDefault(); };
    const handleDrop        = (e) => { if (isOnTaskPage) e.preventDefault(); };
    const handleSelectStart = (e) => {
      if (!isOnTaskPage || currentPageName === 'CopyPaste') return;
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
    };
    const handleKeyDown = (e) => {
      if (!isOnTaskPage) return;
      if (currentPageName === 'CopyPaste') return;
      if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return; }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase())) {
        e.preventDefault(); e.stopPropagation(); return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (['a','c','v','x','u','s','p'].includes(e.key.toLowerCase())) {
          e.preventDefault(); e.stopPropagation();
        }
      }
    };

    let taskSecurityStyle = null;
    if (isOnTaskPage && currentPageName !== 'CopyPaste') {
      taskSecurityStyle = document.createElement('style');
      taskSecurityStyle.id = 'task-security-style';
      taskSecurityStyle.innerHTML = `
        @keyframes slideDown { from{transform:translateY(-100%)} to{transform:translateY(0)} }
        .task-content,.task-text,[data-task-content],p:not(input):not(textarea),h1,h2,h3,h4,span,div:not(input):not(textarea){
          -webkit-user-select:none!important;-moz-user-select:none!important;user-select:none!important;
        }
        input,textarea{-webkit-user-select:text!important;user-select:text!important;}
      `;
      document.head.appendChild(taskSecurityStyle);
    }

    // ── Mobile keyboard clipboard & desktop paste BLOCK ──────────────────
    const showPasteWarning = () => {
      if (document.getElementById('paste-warning-banner')) return;
      const warning = document.createElement('div');
      warning.id = 'paste-warning-banner';
      warning.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#dc2626;color:white;text-align:center;padding:10px 16px;font-weight:700;font-size:13px;z-index:99999;animation:slideDown 0.3s ease;box-shadow:0 4px 12px rgba(0,0,0,0.3)';
      warning.textContent = '⚠️ Paste Blocked! Pasting will lead to Task Rejection & Account Ban. Type manually only.';
      document.body.appendChild(warning);
      setTimeout(() => { warning.remove(); }, 2500);
    };

    // Line 1: beforeinput — stops standard paste, replacement text, bulk insert
    const handleBeforeInput = (e) => {
      if (!isOnTaskPage || currentPageName === 'CopyPaste') return;
      const tag = e.target?.tagName?.toLowerCase();
      if (tag !== 'input' && tag !== 'textarea') return;

      const inputType = e.inputType;
      const data = e.data || '';
      const isPaste = inputType === 'insertFromPaste' || inputType === 'insertReplacementText';
      const isBulkInsert = inputType === 'insertText' && data.length > 1;

      if (isPaste || isBulkInsert) {
        e.preventDefault();
        e.stopPropagation();
        showPasteWarning();
      }
    };
    document.addEventListener('beforeinput', handleBeforeInput, true);

    // Line 2: input event fallback — catches Gboard clipboard that bypasses beforeinput
    // Tracks last value per element; if >1 char added in one input event → block
    const lastInputValues = new WeakMap();
    const handleInputFallback = (e) => {
      if (!isOnTaskPage || currentPageName === 'CopyPaste') return;
      const tag = e.target?.tagName?.toLowerCase();
      if (tag !== 'input' && tag !== 'textarea') return;

      const prev = lastInputValues.get(e.target) || '';
      const curr = e.target.value;
      const diff = curr.length - prev.length;

      // If more than 1 character appeared at once (not normal typing)
      if (diff > 1) {
        e.target.value = prev;
        // Restore cursor position
        e.target.setSelectionRange(prev.length, prev.length);
        showPasteWarning();
        return;
      }

      // Also catch insertFromPaste/insertReplacementText on input event
      if (e.inputType === 'insertFromPaste' || e.inputType === 'insertReplacementText') {
        e.target.value = prev;
        e.target.setSelectionRange(prev.length, prev.length);
        showPasteWarning();
        return;
      }

      lastInputValues.set(e.target, curr);
    };
    document.addEventListener('input', handleInputFallback, true);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy',        handleCopy);
    document.addEventListener('cut',         handleCut);
    document.addEventListener('paste',       handlePaste);
    document.addEventListener('dragstart',   handleDragStart);
    document.addEventListener('drop',        handleDrop);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown',     handleKeyDown, true);

    return () => {
      document.removeEventListener('beforeinput', handleBeforeInput, true);
      document.removeEventListener('input', handleInputFallback, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy',        handleCopy);
      document.removeEventListener('cut',         handleCut);
      document.removeEventListener('paste',       handlePaste);
      document.removeEventListener('dragstart',   handleDragStart);
      document.removeEventListener('drop',        handleDrop);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown',     handleKeyDown, true);
      if (taskSecurityStyle?.parentNode) taskSecurityStyle.parentNode.removeChild(taskSecurityStyle);
      clearInterval(sessionPollInterval);
    };
  }, [currentPageName]);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'tawk-custom-style';
    style.innerHTML = `
      [class*="base44"],[id*="base44"],[class*="watermark"],[id*="watermark"],
      .powered-by,.made-with,a[href*="base44.com"],a[href*="base44.io"]{
        display:none!important;visibility:hidden!important;opacity:0!important;
        height:0!important;width:0!important;overflow:hidden!important;
        position:absolute!important;left:-9999px!important;
      }
      *{animation-duration:0.05s!important;transition-duration:0.05s!important;}
      @media print{.print\\:hidden{display:none!important;}}
      @media(max-width:1024px){
        #tidio-chat-iframe,#tidio-chat,[id^="tidio-chat"],.tidio-1,
        iframe[title*="tidio"],iframe[src*="tidio"]{
          display:none!important;visibility:hidden!important;opacity:0!important;
          pointer-events:none!important;width:0!important;height:0!important;
        }
      }
    `;
    document.head.appendChild(style);

    const tidioScript  = document.createElement("script");
    tidioScript.src    = "//code.tidio.co/cnjmhfu6axyap6lkz6v0dayvl8qeienl.js";
    tidioScript.async  = true;
    document.body.appendChild(tidioScript);

    const hideTidioBubble = () => {
      if (window.innerWidth <= 1024 && window.tidioChatApi) {
        window.tidioChatApi.hide();
        window.tidioChatApi.on('close', () => { if (window.innerWidth <= 1024) window.tidioChatApi.hide(); });
      }
    };
    document.addEventListener('tidioChat-ready', hideTidioBubble);
    setTimeout(hideTidioBubble, 3000);

    return () => {
      if (style.parentNode)      style.parentNode.removeChild(style);
      if (tidioScript.parentNode) tidioScript.parentNode.removeChild(tidioScript);
    };
  }, []);

  const handleSubmitCall = async (e) => {
    e.preventDefault();
    if (!callForm.fullName || !callForm.mobile || !callForm.subject || !callForm.issue) {
      alert("⚠️ Please fill all required fields"); return;
    }
    setSubmittingCall(true);
    try {
      await base44.entities.CallRequest.create({
        user_id: user?.id || "",
        full_name: callForm.fullName,
        mobile: callForm.mobile,
        email: callForm.email,
        subject: callForm.subject,
        issue: callForm.issue,
        status: "pending"
      });
      setCallDialog(false);
      setCallForm({ fullName: "", mobile: "", email: "", subject: "", issue: "" });
      alert("✅ Call request submitted! We'll contact you soon.");
    } catch {
      alert("❌ Failed to submit. Please try again.");
    } finally {
      setSubmittingCall(false);
    }
  };

  const generateUserId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const loadUser = async () => {
    const savedUserId     = localStorage.getItem('workden_3_login_id');
    const savedPassword   = localStorage.getItem('workden_3_login_password');
    const savedUserSource = localStorage.getItem('workden_3_user_source');
    const savedUserStr    = localStorage.getItem('workden_3_user');

    if (savedUserId === 'SHIVAM' && savedPassword === '995567') {
      if (savedUserStr) { try { setUser(JSON.parse(savedUserStr)); return; } catch (e) {} }
      try {
        const currentUser = await base44.auth.me();
        if (currentUser?.role === 'admin') { setUser(currentUser); return; }
      } catch (e) {}
      setUser({ role: 'admin', full_name: 'Admin', login_user_id: 'SHIVAM', login_password: '995567', is_subscribed: true });
      return;
    }

    if (savedUserId && savedPassword && savedUserSource === 'appuser') {
      if (savedUserStr) {
        try {
          const localUser = JSON.parse(savedUserStr);
          if (localUser.login_user_id === savedUserId) {
            try {
              const dbUsers = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
              if (dbUsers?.length > 0 && dbUsers[0].login_password === savedPassword) {
                const dbUser = dbUsers[0];

                if (dbUser.status === 'inactive') {
                  alert("Your account has been deactivated. Please contact admin.");
                  localStorage.clear();
                  window.location.replace("#" + createPageUrl("UserLogin"));
                  return;
                }

                const storedSessionId = localStorage.getItem('workden_3_session_id');
                if (
                  dbUser.role !== 'admin' &&
                  dbUser.session_id && storedSessionId &&
                  dbUser.session_id !== storedSessionId
                ) {
                  const lastActive = dbUser.last_active ? new Date(dbUser.last_active) : null;
                  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
                  if (lastActive && lastActive > fiveMinsAgo) {
                    alert("⚠️ Your session has expired because another device is actively logged in. Please logout from that device first.");
                    localStorage.clear(); sessionStorage.clear();
                    window.location.replace("#" + createPageUrl("UserLogin"));
                    return;
                  }
                }

                // Note: last_active / last_heartbeat ab heartbeat handle karega — yahan update mat karo
                // Warna heartbeat ka debounce trigger ho jaata hai on mount
                setUser(dbUser);
                localStorage.setItem('workden_3_user', JSON.stringify(dbUser));
                return;
              }
            } catch (e) {
              setUser(localUser); return;
            }
          }
        } catch (e) {}
      }
      if (currentPageName !== 'UserLogin') window.location.replace("#" + createPageUrl("UserLogin"));
      return;
    }

    try {
      const currentUser = await base44.auth.me();
      if (currentUser.status === 'inactive') {
        alert("Your account has been deactivated. Please contact support.");
        localStorage.clear();
        window.location.replace("#" + createPageUrl("UserLogin"));
        return;
      }
      if (currentUser.role === 'admin') {
        setUser(currentUser);
        localStorage.setItem('workden_3_user', JSON.stringify(currentUser));
        return;
      }
      if (savedUserId && savedPassword) {
        const localUser = savedUserStr ? JSON.parse(savedUserStr) : null;
        if (localUser?.login_user_id === savedUserId && localUser?.login_password === savedPassword) {
          setUser(localUser); return;
        }
      }
      if (!currentUser.login_user_id || !currentUser.login_password) {
        if (currentPageName !== 'UserLogin') window.location.replace("#" + createPageUrl("UserLogin"));
        return;
      }
      setUser(currentUser);
      localStorage.setItem('workden_3_user', JSON.stringify(currentUser));
    } catch (error) {
      if (savedUserId && savedPassword && savedUserStr) {
        try {
          const localUser = JSON.parse(savedUserStr);
          if (localUser?.login_user_id === savedUserId && localUser?.login_password === savedPassword) {
            setUser(localUser); return;
          }
        } catch (e) {}
      }
      if (currentPageName !== 'UserLogin') window.location.replace("#" + createPageUrl("UserLogin"));
    }
  };

  const loadTasks = async () => {
    try {
      const taskList = await base44.entities.Task.list();
      setTasks(taskList);
      localStorage.setItem('workden_tasks', JSON.stringify(taskList));
    } catch (error) { console.error("Error loading tasks:", error); }
  };

  const loadGlobalSettings = async () => {
    try {
      const settings = await base44.entities.GlobalSettings.list();
      setGlobalSettings(settings);
      const isOff = settings.find(s => s.setting_key === 'platform_off_enabled')?.setting_value === 'true';
      setPlatformOff(isOff);
    } catch (e) {}
  };

  const loadHolidays = async () => {
    try {
      const hols = await base44.entities.Holiday.list('holiday_date');
      setHolidays(hols);
    } catch (e) {}
  };

  const isSubmitTaskAllowed = () => {
    if (user?.role === 'admin') return true;
    const now = new Date();
    const totalMins = now.getHours() * 60 + now.getMinutes();
    if (totalMins < 9 * 60 || totalMins >= 23 * 60 + 30) return false;
    if (platformOff) return false;
    const todayStr = now.toLocaleDateString('en-CA');
    return !holidays.some(hol => hol.is_active && hol.holiday_date === todayStr);
  };

  const getSubmitTaskTooltip = () => {
    if (user?.role === 'admin') return '';
    const now = new Date();
    const totalMins = now.getHours() * 60 + now.getMinutes();
    if (totalMins < 9 * 60 || totalMins >= 23 * 60 + 30) return '⏰ Task submission available 9:00 AM – 11:30 PM only';
    if (platformOff) return '🔒 Platform is currently closed';
    const todayStr = now.toLocaleDateString('en-CA');
    const holiday = holidays.find(hol => hol.is_active && hol.holiday_date === todayStr);
    if (holiday) return `🎉 Today is ${holiday.holiday_name} — No submissions on holidays`;
    return '';
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
      if (m && m[2].length === 11) return `https://www.youtube.com/embed/${m[2]}`;
    }
    if (url.includes('drive.google.com')) {
      const m = url.match(/\/file\/d\/([^/]+)/);
      if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    }
    return url;
  };

  const openVideoDialog = (url) => {
    const embedUrl = getVideoEmbedUrl(url);
    const dialog = document.createElement('div');
    dialog.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    dialog.innerHTML = `<div style="width:100%;max-width:1200px;height:80vh;background:white;border-radius:12px;overflow:hidden;position:relative"><button onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:12px;right:12px;z-index:10;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:20px">×</button><iframe src="${embedUrl}" style="width:100%;height:100%;border:none" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"></iframe></div>`;
    document.body.appendChild(dialog);
    dialog.onclick = (e) => { if (e.target === dialog) dialog.remove(); };
  };

  const handleLogout = async () => {
    // Stop heartbeat immediately on logout
    stopHeartbeat();

    try {
      const userSource  = localStorage.getItem('workden_3_user_source');
      const savedUser   = localStorage.getItem('workden_3_user');

      if (userSource === 'appuser' && savedUser) {
        try {
          const localUser = JSON.parse(savedUser);
          if (localUser?.id) {
            await base44.entities.AppUser.update(localUser.id, {
              is_logged_in: false,
              session_id: null,
              last_active: new Date().toISOString()
            }).catch(() => {});
          }
        } catch (e) {}
      }

      if (userSource === 'user' && savedUser) {
        try {
          const localUser = JSON.parse(savedUser);
          if (localUser?.id) {
            await base44.entities.User.update(localUser.id, {
              is_logged_in: false,
              session_id: null,
              last_active: new Date().toISOString()
            }).catch(() => {});
          }
        } catch (e) {}
      }

      const recruiterID = localStorage.getItem('workden_3_recruiter_id');
      if (recruiterID) {
        await base44.entities.Recruiter.update(recruiterID, {
          is_logged_in: false, session_id: null
        }).catch(() => {});
      }

      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      await base44.auth.logout().catch(() => {});
      window.location.replace("#" + createPageUrl("UserLogin"));
    } catch (error) {
      console.error("Error during logout:", error);
      localStorage.clear(); sessionStorage.clear();
      window.location.replace("#" + createPageUrl("UserLogin"));
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar  = () => setSidebarOpen(false);

  const handleSubmitWork = async (e) => {
    e?.preventDefault();
    if (submittingWork) return;
    if (!selectedTask) { alert("⚠️ Please select a task"); return; }
    if (!fileLink.trim()) { alert("⚠️ Please enter a file link"); return; }
    if (!fileLink.trim().startsWith("http://") && !fileLink.trim().startsWith("https://")) {
      alert("⚠️ Please enter a valid URL (must start with http:// or https://)"); return;
    }

    setSubmittingWork(true);
    try {
      const task = tasks.find(t => t.id === selectedTask);
      if (!task) { alert("⚠️ Selected task not found. Please refresh and try again."); setSubmittingWork(false); return; }

      await base44.entities.Proof.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        user_id_number: user.user_id || user.id,
        task_id: selectedTask,
        task_name: task.name,
        work_type: task.name,
        file_url: fileLink.trim(),
        task_content: workNotes || `Submitted ${task.name}`,
        csv_data: "",
        status: "pending",
        submitted_date: new Date().toISOString(),
        reward_amount: task.reward,
        duration_seconds: 0,
        auto_submitted: false
      });

      const completedWorks = [...(user.completed_works || []), {
        task_id: selectedTask, task_name: task.name, date: new Date().toISOString()
      }];
      try { await base44.auth.updateMe({ completed_works: completedWorks }); } catch {}

      alert("✅ Work submitted successfully! Admin will review it soon.");
      setSubmitWorkOpen(false);
      setSelectedTask(""); setFileLink(""); setWorkNotes("");
      window.location.reload();
    } catch (error) {
      console.error("Error submitting work:", error);
      alert(`❌ Failed to submit work. ${error.message || "Please try again or contact admin."}`);
    } finally {
      setSubmittingWork(false);
    }
  };

  const navItems = [
    { icon: Upload, label: "Submit Tasks", page: null, action: () => {
      if (!isSubmitTaskAllowed()) { alert(getSubmitTaskTooltip() || '⏰ Submission not allowed right now'); return; }
      setSubmitWorkOpen(true);
    }},
    { icon: DollarSign, label: "Task Rewards List", page: null, action: () => { setTaskRewardsUnlocked(false); setTaskRewardsPasswordInput(""); setTaskRewardsDialog(true); }},
    { icon: Save,        label: "Task History",                 page: "SubmittedWork" },
    { icon: Bell,        label: "Notifications",                page: "Notifications" },
    { icon: Download,    label: "Download Work File",           page: "DownloadFiles" },
    { icon: Trophy,      label: "Earnings Testimonials",        page: "EarningProof",  alwaysVisible: true, showEvenWhenLocked: true },
    ...(user?.referral_access_enabled ? [{ icon: Users, label: "Referrals", page: "Referral" }] : []),
    { icon: Gift,        label: "Referral Partner",             page: "ReferralPartner" },
    { icon: CreditCard,  label: "ID Card Apply",                page: null, action: () => {
      const dialog = document.createElement('div');
      dialog.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
      dialog.innerHTML = `<div style="width:100%;max-width:500px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5)">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;text-align:center;color:white">
          <p style="font-size:22px;font-weight:800;margin:0">🪪 ID Card Apply</p>
          <p style="font-size:13px;opacity:0.9;margin:4px 0 0">Watch the demo first, then apply</p>
        </div>
        <div style="padding:20px">
          <button id="idcard-demo-btn" style="width:100%;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;border:none;border-radius:10px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:8px">▶ Watch Demo Video</button>
          <a href="https://idccard.base44.app" target="_blank" rel="noopener noreferrer" style="display:block;width:100%;background:linear-gradient(135deg,#10b981,#059669);color:white;border:none;border-radius:10px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;text-align:center;text-decoration:none;box-sizing:border-box">🪪 Apply Now</a>
          <button id="idcard-close-btn" style="width:100%;background:#f3f4f6;color:#374151;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;margin-top:10px">Close</button>
        </div>
      </div>`;
      document.body.appendChild(dialog);
      dialog.querySelector('#idcard-close-btn').onclick = () => dialog.remove();
      dialog.onclick = (e) => { if (e.target === dialog) dialog.remove(); };
      dialog.querySelector('#idcard-demo-btn').onclick = () => {
        dialog.remove();
        const videoUrl = globalSettings.find(s => s.setting_key === 'idcard_demo_video')?.setting_value || 'https://drive.google.com/file/d/1kBxKTj_T9yMgJvEV27lZck0CyKDYIRiv/preview';
        const embedUrl = videoUrl.includes('drive.google.com') ? videoUrl.replace('/view', '/preview') : videoUrl;
        const vd = document.createElement('div');
        vd.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
        vd.innerHTML = `<div style="width:100%;max-width:900px;height:70vh;background:white;border-radius:12px;overflow:hidden;position:relative"><button onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:12px;right:12px;z-index:10;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:20px">×</button><iframe src="${embedUrl}" style="width:100%;height:100%;border:none" allowfullscreen></iframe></div>`;
        document.body.appendChild(vd);
        vd.onclick = (e) => { if (e.target === vd) vd.remove(); };
      };
    }},
    { icon: HelpCircle,  label: "Support Tickets & History",    page: "SupportTickets" },
    { icon: MessageCircle, label: "Contact Us",                 page: "ContactUs" },
    { icon: FileText,    label: "Guidelines",                   page: "Guidelines" },
    { icon: FileText,    label: "Terms & Conditions",           page: "TermsConditions" },
    { icon: Building2,   label: "About Us",                     page: "AboutUs" },
    { icon: Calendar,    label: "Holidays",                     page: "Holidays",      showEvenWhenLocked: true },
    ...(user?.recruiter_menu_enabled ? [{ icon: Users, label: "Recruiter Panel", page: "RecruiterDashboard" }] : []),
    ...(user?.role === 'admin' ? [
      { icon: BarChart3, label: "Analytics",    page: "Analytics" },
      { icon: Shield,    label: "Admin Panel",  page: "AdminPanel" },
      { icon: Users,     label: "Create User",  page: "CreateUser" }
    ] : []),
    ...(user?.role === 'recruiter' ? [{ icon: Users, label: "My Recruiter Dashboard", page: "RecruiterDashboard" }] : [])
  ];

  const assignedTasks  = user?.role === 'admin' ? tasks :
    (user?.is_subscribed || user?.free_unlock) ? tasks :
    tasks.filter(task => (user?.assigned_tasks || []).includes(task.id));

  const isMenuFrozen = user?.role !== 'admin' && !user?.is_subscribed && !user?.free_unlock;

  const publicPages = ['UserLogin','UserSignup','RecruiterPortal','RecruiterLogin','RecruiterDashboard','CreateUser'];
  if (publicPages.includes(currentPageName)) return <>{children}</>;

  const hasSession = localStorage.getItem('workden_3_login_id') && localStorage.getItem('workden_3_user');
  if (!hasSession) { window.location.replace("#" + createPageUrl("UserLogin")); return null; }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <HolidayNotice />
      <AlertBanner user={user} />
      <ReferralHandler />
      <SessionTracker />
      <DailyFeedbackSurvey />
      <TermsSignatureDialog user={user} />
      <TaskNavigationWarning />

      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3 shadow-sm transition-transform ${
        sidebarOpen ? '-translate-y-full' : 'translate-y-0'
      }`} style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-gray-100">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e9e7d6f2c135f2968907d8/b84b417d1_6296293782902737811.jpg"
              alt="WorkDen" className="h-8 object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCallDialog(true)}
              className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md active:bg-green-700 transition-colors"
              style={{ WebkitTapHighlightColor:'transparent', touchAction:'manipulation', cursor:'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
              </svg>
            </button>
            <button
              onTouchEnd={(e) => {
                e.preventDefault(); e.stopPropagation();
                const forceShowTidio = () => {
                  let s = document.getElementById('tidio-show-override');
                  if (!s) { s = document.createElement('style'); s.id='tidio-show-override'; document.head.appendChild(s); }
                  s.innerHTML = `#tidio-chat-iframe,#tidio-chat,[id^="tidio-chat"],.tidio-1,iframe[title*="tidio"],iframe[src*="tidio"]{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;width:auto!important;height:auto!important;}`;
                  if (window.tidioChatApi) { window.tidioChatApi.show(); setTimeout(() => window.tidioChatApi.open(), 150); }
                  else setTimeout(() => { if (window.tidioChatApi) { window.tidioChatApi.show(); window.tidioChatApi.open(); } }, 1000);
                };
                forceShowTidio();
              }}
              onClick={() => {
                let s = document.getElementById('tidio-show-override');
                if (!s) { s = document.createElement('style'); s.id='tidio-show-override'; document.head.appendChild(s); }
                s.innerHTML = `#tidio-chat-iframe,#tidio-chat,[id^="tidio-chat"],.tidio-1,iframe[title*="tidio"],iframe[src*="tidio"]{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;width:auto!important;height:auto!important;}`;
                if (window.tidioChatApi) { window.tidioChatApi.show(); setTimeout(() => window.tidioChatApi.open(), 150); }
              }}
              className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-md active:bg-blue-700 transition-colors"
              style={{ WebkitTapHighlightColor:'transparent', touchAction:'manipulation', cursor:'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-xl lg:shadow-none transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } flex flex-col h-full`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e9e7d6f2c135f2968907d8/b84b417d1_6296293782902737811.jpg"
              alt="WorkDen" className="h-12 mb-2 object-contain w-full"
            />
            <p className="text-sm text-slate-600 text-center">Work from Home Platform</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
            {isMenuFrozen ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg text-center">
                  <p className="text-sm font-bold text-amber-900 mb-2">⚠️ Menu Locked</p>
                  <p className="text-xs text-amber-700">Your subscription is pending approval. Once admin approves, full access will be unlocked.</p>
                </div>
                <Link to={createPageUrl("Tasks")} onClick={closeSidebar}>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md">
                    <CreditCard className="w-5 h-5 mr-2" />Subscribe Now
                  </Button>
                </Link>
                <div className="border-t my-4"></div>
                {[
                  { label: "Earnings Testimonials", page: "EarningProof", icon: Trophy },
                  { label: "Support Tickets & History", page: "SupportTickets", icon: HelpCircle },
                  { label: "Contact Us", page: "ContactUs", icon: MessageCircle },
                  { label: "About Us", page: "AboutUs", icon: Building2 },
                ].map(item => (
                  <Link key={item.page} to={createPageUrl(item.page)} onClick={closeSidebar}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${currentPageName === item.page ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <>
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  if (isMenuFrozen && !item.showEvenWhenLocked) return null;
                  if (item.externalLink) return (
                    <a key={`ext-${index}`} href={item.externalLink} target="_blank" rel="noopener noreferrer" onClick={closeSidebar}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50">
                        <Icon className="w-5 h-5 flex-shrink-0" /><span className="font-medium">{item.label}</span>
                      </div>
                    </a>
                  );
                  if (item.action) {
                    const submitAllowed = item.label === "Submit Tasks" ? isSubmitTaskAllowed() : true;
                    const tooltip = item.label === "Submit Tasks" ? getSubmitTaskTooltip() : '';
                    return (
                      <div key={`action-${index}`} onClick={() => { item.action(); closeSidebar(); }} title={tooltip}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer ${submitAllowed ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 bg-slate-50 opacity-60'}`}>
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                        {!submitAllowed && item.label === "Submit Tasks" && <span className="ml-auto text-xs text-red-500">🔒</span>}
                      </div>
                    );
                  }
                  return (
                    <Link key={item.page} to={createPageUrl(item.page)} onClick={closeSidebar}>
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}>
                        <Icon className="w-5 h-5 flex-shrink-0" /><span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <div className="mt-auto border-t">
            <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user?.full_name?.[0] || user?.email?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.full_name || user?.email}</p>
                  <p className="text-xs text-slate-600 truncate">{user?.email || user?.login_user_id || "..."}</p>
                  {user?.id_verification_status === 'verified' && <p className="text-xs text-green-600 font-semibold">✓ Activated</p>}
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline"
                className="w-full flex items-center justify-center gap-2 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 font-semibold">
                <LogOut className="w-4 h-4" />Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pt-16 lg:pt-0 pb-24">{children}</main>

      {user && (user.is_subscribed || user.free_unlock || user.role === 'admin') && (
        <BottomNav currentPage={currentPageName} userRole={user?.role} sidebarOpen={sidebarOpen} referralEnabled={user?.referral_access_enabled} />
      )}

      {/* Task Rewards Dialog */}
      <Dialog open={taskRewardsDialog} onOpenChange={setTaskRewardsDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📋 Task Rewards List</DialogTitle>
            <DialogDescription>View all task rewards (wallet PIN required)</DialogDescription>
          </DialogHeader>
          {!taskRewardsUnlocked ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-center">
                <Lock className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-900">Enter your Wallet PIN to view rewards</p>
              </div>
              {user?.wallet_password ? (
                <>
                  <Input type="password" placeholder="Enter wallet PIN" value={taskRewardsPasswordInput}
                    onChange={e => setTaskRewardsPasswordInput(e.target.value)}
                    onKeyPress={e => { if (e.key === 'Enter') { if (taskRewardsPasswordInput === user?.wallet_password) setTaskRewardsUnlocked(true); else { alert("❌ Incorrect PIN!"); setTaskRewardsPasswordInput(""); } } }} />
                  <Button className="w-full" onClick={() => { if (taskRewardsPasswordInput === user?.wallet_password) setTaskRewardsUnlocked(true); else { alert("❌ Incorrect PIN!"); setTaskRewardsPasswordInput(""); } }}>Unlock</Button>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">No wallet PIN set. Please set a PIN in the Wallet section first.</p>
                  <Button variant="outline" onClick={() => setTaskRewardsDialog(false)}>Go to Wallet</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center text-sm text-green-700 font-medium">✅ Showing all task rewards</div>
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{task.name}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description || 'Complete this task to earn rewards'}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-2xl font-bold text-green-600">₹{task.reward}</p>
                    <p className="text-xs text-gray-500">reward</p>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-center text-gray-500 py-8">No tasks available</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Call Request Dialog */}
      <Dialog open={callDialog} onOpenChange={setCallDialog}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>📞 Request a Call</DialogTitle>
            <DialogDescription>Our team will contact you soon</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCall} className="space-y-3 py-2">
            <div><Label>Full Name *</Label><Input placeholder="Your full name" value={callForm.fullName} onChange={e => setCallForm({...callForm, fullName: e.target.value})} /></div>
            <div><Label>Mobile Number *</Label><Input placeholder="Your mobile number" value={callForm.mobile} onChange={e => setCallForm({...callForm, mobile: e.target.value})} /></div>
            <div><Label>Email (Optional)</Label><Input type="email" placeholder="Your email" value={callForm.email} onChange={e => setCallForm({...callForm, email: e.target.value})} /></div>
            <div><Label>Subject *</Label><Input placeholder="What is this call about?" value={callForm.subject} onChange={e => setCallForm({...callForm, subject: e.target.value})} /></div>
            <div><Label>Issue / Message *</Label><Textarea placeholder="Describe your issue" rows={3} value={callForm.issue} onChange={e => setCallForm({...callForm, issue: e.target.value})} /></div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setCallDialog(false)} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={submittingCall} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                {submittingCall ? "Submitting..." : "Request Call"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Work Dialog */}
      <Dialog open={submitWorkOpen} onOpenChange={setSubmitWorkOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Your Work</DialogTitle>
            <DialogDescription>Provide link to your completed work</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitWork}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2 mb-4">
                <Button type="button"
                  onClick={() => { const url = globalSettings.find(s => s.setting_key === 'submit_task_video')?.setting_value || "https://drive.google.com/file/d/10vgYiNtA9xJPoQ8RitHnukIrAGDRjx64/view?usp=drive_link"; openVideoDialog(url); }}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 shadow-lg">
                  <Play className="w-5 h-5 mr-2" />🎥 How to Submit Tasks - Watch Demo
                </Button>
              </div>
              <div className="grid gap-2">
                <Label>Select Task</Label>
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger><SelectValue placeholder="Choose a task" /></SelectTrigger>
                  <SelectContent>
                    {assignedTasks.length > 0 ? assignedTasks.map((task, i) => (
                      <SelectItem key={task.id} value={task.id}>{i + 1}. {task.name}</SelectItem>
                    )) : <SelectItem value="no-tasks" disabled>No tasks available</SelectItem>}
                  </SelectContent>
                </Select>
                {assignedTasks.length === 0 && <p className="text-xs text-amber-600 mt-1">No tasks assigned yet. Please contact admin.</p>}
              </div>
              <div className="grid gap-2">
                <Label>Work File Link (Google Drive, Dropbox, etc.)</Label>
                <Input placeholder="https://drive.google.com/file/..." value={fileLink} onChange={e => setFileLink(e.target.value)}
                  onContextMenu={e => e.stopPropagation()} onPaste={e => e.stopPropagation()} onCopy={e => e.stopPropagation()}
                  style={{ userSelect:'text', WebkitUserSelect:'text' }} />
                <p className="text-xs text-gray-500">📌 Upload your work file to Google Drive/Dropbox, make it shareable, and paste the link here</p>
              </div>
              <div className="grid gap-2">
                <Label>Work Notes (Optional)</Label>
                <Textarea placeholder="Add any notes about your work..." value={workNotes} onChange={e => setWorkNotes(e.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setSubmitWorkOpen(false); setSelectedTask(""); setFileLink(""); setWorkNotes(""); }}>Cancel</Button>
              <Button type="submit" disabled={!selectedTask || !fileLink.trim() || submittingWork}>
                {submittingWork ? "Submitting..." : "Submit Work"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
