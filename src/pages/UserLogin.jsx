import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

// ─── DEVICE FINGERPRINT ───────────────────────────────────────────────────────
function getDeviceFingerprint() {
  const ua = navigator.userAgent || "";
  const scr = `${window.screen.width}x${window.screen.height}`;
  const tz  = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const lang = navigator.language || "";
  const raw  = `${ua}|${scr}|${tz}|${lang}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getDeviceName() {
  const ua = navigator.userAgent || "";
  let name = "Unknown Browser";
  if (/Chrome/.test(ua) && !/Chromium|Edge/.test(ua)) name = "Chrome";
  else if (/Firefox/.test(ua)) name = "Firefox";
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) name = "Safari";
  else if (/Edge/.test(ua)) name = "Edge";
  if (/Windows/.test(ua))        name += " on Windows";
  else if (/Macintosh/.test(ua)) name += " on Mac";
  else if (/Android/.test(ua))   name += " on Android";
  else if (/iPhone|iPad/.test(ua)) name += " on iOS";
  else if (/Linux/.test(ua))     name += " on Linux";
  return name;
}

// ─── GLOBAL LOGOUT UTILITY ────────────────────────────────────────────────────
export async function performLogout() {
  try {
    const userSource  = localStorage.getItem('workden_3_user_source');
    const userId      = localStorage.getItem('workden_3_user_db_id');
    const recruiterID = localStorage.getItem('workden_3_recruiter_id');
    const clearPayload = { is_logged_in: false, session_id: null };
    if (userId) {
      if (userSource === 'appuser') await base44.entities.AppUser.update(userId, clearPayload).catch(() => {});
      else if (userSource === 'user') await base44.entities.User.update(userId, clearPayload).catch(() => {});
    }
    if (recruiterID) await base44.entities.Recruiter.update(recruiterID, clearPayload).catch(() => {});
  } catch (e) {}
  const keys = [
    'workden_3_login_id','workden_3_login_password','workden_3_user',
    'workden_3_user_db_id','workden_3_user_source','workden_3_session_fingerprint',
    'workden_3_session_id','workden_3_recruiter_id'
  ];
  keys.forEach(k => localStorage.removeItem(k));
}

// ─── SINGLE DEVICE CHECK ──────────────────────────────────────────────────────
function isBlockedByOtherDevice(dbUser, currentFingerprint) {
  if (!dbUser) return false;
  if (dbUser.role === 'admin') return false;
  if (!dbUser.is_logged_in) return false;
  if (!dbUser.session_id || dbUser.session_id.trim() === "") return false;
  return dbUser.session_id !== currentFingerprint;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .wl-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Inter', sans-serif;
    background: #eef0f5;
  }

  /* ════════════ LEFT PANEL ════════════ */
  .wl-left {
    width: 48%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 44px 48px;
  }

  .wl-left-bg {
    position: absolute;
    inset: 0;
    background-image: url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80');
    background-size: cover;
    background-position: center bottom;
    z-index: 0;
  }

  .wl-left-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      rgba(10, 18, 50, 0.93) 0%,
      rgba(14, 24, 70, 0.88) 40%,
      rgba(20, 30, 90, 0.80) 100%
    );
    z-index: 1;
  }

  .wl-left-dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
    background-size: 28px 28px;
    z-index: 2;
  }

  .wl-left-inner {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .wl-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
  }

  .wl-brand-icon {
    width: 42px; height: 42px;
    border-radius: 10px;
    overflow: hidden;
    border: 1.5px solid rgba(255,255,255,0.15);
    flex-shrink: 0;
  }

  .wl-brand-icon img { width: 100%; height: 100%; object-fit: cover; }

  .wl-brand-name {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.3px;
  }

  .wl-brand-name span { color: #4f8ef7; }

  .wl-accent-line {
    width: 36px; height: 3px;
    background: linear-gradient(90deg, #4f8ef7, #6366f1);
    border-radius: 2px;
    margin-top: 14px;
    margin-bottom: 36px;
  }

  .wl-hero-title {
    font-size: clamp(28px, 2.8vw, 42px);
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
    margin-bottom: 18px;
    letter-spacing: -0.5px;
  }

  .wl-hero-desc {
    font-size: 15px;
    color: rgba(255,255,255,0.55);
    line-height: 1.65;
    max-width: 340px;
    font-weight: 400;
    margin-bottom: 44px;
  }

  .wl-features { display: flex; flex-direction: column; gap: 22px; }

  .wl-feat {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .wl-feat-icon {
    width: 44px; height: 44px;
    border-radius: 50%;
    background: rgba(79,142,247,0.18);
    border: 1.5px solid rgba(79,142,247,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .wl-feat-text { display: flex; flex-direction: column; gap: 3px; }

  .wl-feat-title {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
  }

  .wl-feat-desc {
    font-size: 12.5px;
    color: rgba(255,255,255,0.45);
    line-height: 1.5;
    font-weight: 400;
  }

  /* ════════════ RIGHT PANEL ════════════ */
  .wl-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 40px;
    background: #eef0f5;
  }

  .wl-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 44px 40px 36px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
  }

  .wl-lock-wrap {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: #eef0ff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }

  .wl-card-title {
    text-align: center;
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 6px;
    letter-spacing: -0.4px;
  }

  .wl-card-sub {
    text-align: center;
    font-size: 14px;
    color: #94a3b8;
    margin-bottom: 32px;
    font-weight: 400;
  }

  .wl-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: #fef2f2;
    border: 1.5px solid #fecaca;
    border-radius: 10px;
    color: #dc2626;
    font-size: 13px;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .wl-field { margin-bottom: 18px; }

  .wl-field-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
  }

  .wl-input-wrap { position: relative; }

  .wl-field-icon {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    width: 17px; height: 17px;
    pointer-events: none;
  }

  .wl-input {
    width: 100%;
    height: 50px;
    padding: 0 44px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #0f172a;
    background: #fff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .wl-input::placeholder { color: #c0c9d8; }

  .wl-input:focus {
    border-color: #4f8ef7;
    box-shadow: 0 0 0 4px rgba(79,142,247,0.1);
  }

  .wl-eye {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer;
    color: #94a3b8;
    display: flex; align-items: center;
    transition: color 0.2s;
    padding: 2px;
  }
  .wl-eye:hover { color: #4f8ef7; }

  .wl-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    margin-top: 4px;
  }

  .wl-remember {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #475569;
    cursor: pointer;
    user-select: none;
  }

  .wl-remember input[type="checkbox"] {
    width: 15px; height: 15px;
    accent-color: #4f8ef7;
    cursor: pointer;
  }

  .wl-admin-hint {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 400;
  }

  .wl-btn-primary {
    width: 100%;
    height: 52px;
    background: linear-gradient(135deg, #4f5ef7 0%, #3b4de8 100%);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
    letter-spacing: 0.1px;
    box-shadow: 0 4px 20px rgba(79,94,247,0.35);
    margin-bottom: 18px;
  }

  .wl-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(79,94,247,0.45);
  }

  .wl-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .wl-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

  .wl-or {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 13px;
    color: #94a3b8;
  }

  .wl-or::before, .wl-or::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e8ecf0;
  }

  .wl-btn-secondary {
    width: 100%;
    height: 48px;
    background: #fff;
    color: #475569;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: border-color 0.2s, background 0.2s, color 0.2s;
    margin-bottom: 24px;
  }

  .wl-btn-secondary:hover { border-color: #4f8ef7; background: #f8faff; color: #4f8ef7; }

  .wl-security {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    color: #b0bac8;
  }

  .wl-spin {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: wl-spin 0.7s linear infinite;
  }
  @keyframes wl-spin { to { transform: rotate(360deg); } }

  .wl-mobile-brand {
    display: none;
    align-items: center;
    gap: 10px;
    justify-content: center;
    margin-bottom: 28px;
  }

  @media (max-width: 900px) {
    .wl-left { display: none; }
    .wl-right { padding: 32px 20px; background: #eef0f5; align-items: flex-start; padding-top: 48px; }
    .wl-card { padding: 32px 24px 28px; }
    .wl-mobile-brand { display: flex; }
  }
`;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UserLogin() {
  useEffect(() => {
  const script = document.createElement("script");
  script.src = "//code.tidio.co/cnjmhfu6axyap6lkz6v0dayvl8qeienl.js";
  script.async = true;
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);
  const [loginId, setLoginId]           = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    const savedLoginId = localStorage.getItem('workden_3_login_id');
    const savedUser    = localStorage.getItem('workden_3_user');
    const userSource   = localStorage.getItem('workden_3_user_source');
    if (!savedLoginId || !savedUser) return;
    try {
      const localUser = JSON.parse(savedUser);
      if (!localUser) return;
      if (userSource === 'recruiter') {
        window.location.replace("#" + createPageUrl("RecruiterDashboard"));
        return;
      }
      if (localUser.login_user_id === savedLoginId || savedLoginId === 'SHIVAM') {
        window.location.replace("#" + createPageUrl("Dashboard"));
      }
    } catch (e) {}
  }, []);

  // ── LOGIN HANDLER (all logic unchanged) ──────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginId.trim() || !password.trim()) {
      setError("⚠️ Please enter User ID and Password.");
      return;
    }

    const fp          = getDeviceFingerprint();
    const deviceName  = getDeviceName();
    const inputId     = loginId.trim();
    const inputPass   = password.trim();
    const sessionPayload = {
      last_login:   new Date().toISOString(),
      last_active:  new Date().toISOString(),
      is_logged_in: true,
      session_id:   fp,
      device_name:  deviceName,
      device_model: deviceName,
    };

    setLoading(true);

    // ── ADMIN SHORTCUT ────────────────────────────────────────────────────
    if (inputId.toUpperCase() === "SHIVAM" && inputPass === "995567") {
      try {
        const allUsers = await base44.entities.User.list();
        const adminUser = allUsers.find(u => u.role === 'admin');
        if (adminUser) {
          await base44.entities.User.update(adminUser.id, sessionPayload).catch(() => {});
          localStorage.setItem('workden_3_login_id', adminUser.login_user_id || 'SHIVAM');
          localStorage.setItem('workden_3_login_password', adminUser.login_password || '995567');
          localStorage.setItem('workden_3_user', JSON.stringify(adminUser));
          localStorage.setItem('workden_3_user_db_id', adminUser.id);
          localStorage.setItem('workden_3_user_source', 'user');
        } else {
          const dummy = { role:'admin', full_name:'Admin', login_user_id:'SHIVAM', login_password:'995567', is_subscribed:true };
          localStorage.setItem('workden_3_login_id', 'SHIVAM');
          localStorage.setItem('workden_3_login_password', '995567');
          localStorage.setItem('workden_3_user', JSON.stringify(dummy));
          localStorage.setItem('workden_3_user_source', 'user');
        }
        localStorage.setItem('workden_3_session_fingerprint', fp);
        localStorage.setItem('workden_3_session_id', fp);
      } catch (e) {
        const dummy = { role:'admin', full_name:'Admin', login_user_id:'SHIVAM', login_password:'995567', is_subscribed:true };
        localStorage.setItem('workden_3_login_id', 'SHIVAM');
        localStorage.setItem('workden_3_login_password', '995567');
        localStorage.setItem('workden_3_user', JSON.stringify(dummy));
        localStorage.setItem('workden_3_user_source', 'user');
        localStorage.setItem('workden_3_session_fingerprint', fp);
        localStorage.setItem('workden_3_session_id', fp);
      }
      window.location.replace("#" + createPageUrl("Dashboard"));
      return;
    }

    try {
      // ── 1. CHECK AppUser ────────────────────────────────────────────────
      const allAppUsers = await base44.entities.AppUser.list();
      const appUser = allAppUsers.find(u => {
        const idOk   = u.login_user_id?.toLowerCase() === inputId.toLowerCase() ||
                       u.email?.toLowerCase()         === inputId.toLowerCase();
        const passOk = u.login_password === inputPass || u.phone === inputPass;
        return idOk && passOk;
      });

      if (appUser) {
        if (appUser.status === 'inactive') {
          setError("⚠️ Your account has been deactivated. Please contact admin.");
          setLoading(false); return;
        }
        if (isBlockedByOtherDevice(appUser, fp)) {
          setError("🔒 Account is already logged in on another device. Please logout from that device first.");
          setLoading(false); return;
        }
        await base44.entities.AppUser.update(appUser.id, sessionPayload).catch(() => {});
        localStorage.setItem('workden_3_session_fingerprint', fp);
        localStorage.setItem('workden_3_session_id', fp);
        localStorage.setItem('workden_3_login_id',       appUser.login_user_id);
        localStorage.setItem('workden_3_login_password', appUser.login_password);
        localStorage.setItem('workden_3_user',           JSON.stringify({ ...appUser, id: appUser.id }));
        localStorage.setItem('workden_3_user_db_id',     appUser.id);
        localStorage.setItem('workden_3_user_source',    'appuser');
        await base44.entities.LoginAttempt.create({
          user_id: appUser.id, login_user_id: appUser.login_user_id,
          login_password: appUser.login_password, user_name: appUser.full_name || "",
          user_email: appUser.email || "", user_phone: appUser.phone || "",
          is_subscribed: appUser.is_subscribed || false,
          login_time: new Date().toISOString(),
        }).catch(() => {});
        window.location.replace("#" + createPageUrl("Dashboard"));
        return;
      }

      // ── 2. CHECK User entity ────────────────────────────────────────────
      const allUsers = await base44.entities.User.list();
      const dbUser = allUsers.find(u => {
        const idOk   = u.login_user_id?.toLowerCase() === inputId.toLowerCase() ||
                       u.email?.toLowerCase()         === inputId.toLowerCase();
        const passOk = u.login_password === inputPass || u.phone === inputPass;
        return idOk && passOk;
      });

      if (dbUser) {
        if (dbUser.status === 'inactive') {
          setError("⚠️ Your account has been deactivated. Please contact admin.");
          setLoading(false); return;
        }
        if (isBlockedByOtherDevice(dbUser, fp)) {
          setError("🔒 Account is already logged in on another device. Please logout from that device first.");
          setLoading(false); return;
        }
        await base44.entities.User.update(dbUser.id, sessionPayload).catch(() => {});
        localStorage.setItem('workden_3_session_fingerprint', fp);
        localStorage.setItem('workden_3_session_id', fp);
        localStorage.setItem('workden_3_login_id',       dbUser.login_user_id);
        localStorage.setItem('workden_3_login_password', dbUser.login_password);
        localStorage.setItem('workden_3_user',           JSON.stringify(dbUser));
        localStorage.setItem('workden_3_user_db_id',     dbUser.id);
        localStorage.setItem('workden_3_user_source',    'user');
        await base44.entities.LoginAttempt.create({
          user_id: dbUser.id, login_user_id: dbUser.login_user_id,
          login_password: dbUser.login_password, user_name: dbUser.full_name || "",
          user_email: dbUser.email || "", user_phone: dbUser.phone || "",
          is_subscribed: dbUser.is_subscribed || false,
          login_time: new Date().toISOString(),
        }).catch(() => {});
        window.location.replace("#" + createPageUrl("Dashboard"));
        return;
      }

      // ── 3. CHECK Recruiter ──────────────────────────────────────────────
      const allRecruiters = await base44.entities.Recruiter.list();
      const recruiter = allRecruiters.find(
        r => r.mobile === inputId && r.password === inputPass && r.status === 'active'
      );
      if (recruiter) {
        if (isBlockedByOtherDevice(recruiter, fp)) {
          setError("🔒 Account is already logged in on another device. Please logout from that device first.");
          setLoading(false); return;
        }
        await base44.entities.Recruiter.update(recruiter.id, {
          last_login: new Date().toISOString(),
          is_logged_in: true, session_id: fp, device_name: deviceName,
        }).catch(() => {});
        localStorage.setItem('workden_3_session_fingerprint', fp);
        localStorage.setItem('workden_3_session_id', fp);
        localStorage.setItem('workden_3_login_id',       recruiter.mobile);
        localStorage.setItem('workden_3_login_password', recruiter.password);
        localStorage.setItem('workden_3_user',           JSON.stringify({ ...recruiter, role:'recruiter' }));
        localStorage.setItem('workden_3_user_source',    'recruiter');
        localStorage.setItem('workden_3_recruiter_id',   recruiter.id);
        window.location.replace("#" + createPageUrl("RecruiterDashboard"));
        return;
      }

      setError("❌ Invalid User ID or Password. Please try again.");
      setLoading(false);

    } catch (err) {
      console.error("Login error:", err);
      setError("❌ Login failed. Please try again.");
      setLoading(false);
    }
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{S}</style>
      <div className="wl-root">

        {/* ══════════ LEFT PANEL ══════════ */}
        <div className="wl-left">
          <div className="wl-left-bg" />
          <div className="wl-left-overlay" />
          <div className="wl-left-dots" />

          <div className="wl-left-inner">
            {/* Brand */}
            <div className="wl-brand">
              <div className="wl-brand-icon">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e9e7d6f2c135f2968907d8/b84b417d1_6296293782902737811.jpg"
                  alt="WorkDen"
                />
              </div>
              <span className="wl-brand-name">Work<span>Den</span></span>
            </div>

            <div className="wl-accent-line" />

            {/* Hero */}
            <h1 className="wl-hero-title">
              Earn Smart<br />WorkDen
            </h1>
            <p className="wl-hero-desc">
              Access your member dashboard to complete tasks, track earnings and manage your account.
            </p>

            {/* Features */}
            <div className="wl-features">
              <div className="wl-feat">
                <div className="wl-feat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#4f8ef7" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="wl-feat-text">
                  <span className="wl-feat-title">Secure Access</span>
                  <span className="wl-feat-desc">Your data is protected with enterprise-grade security</span>
                </div>
              </div>

              <div className="wl-feat">
                <div className="wl-feat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="#4f8ef7" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="wl-feat-text">
                  <span className="wl-feat-title">Task Earnings</span>
                  <span className="wl-feat-desc">Complete tasks and earn real rewards instantly</span>
                </div>
              </div>

              <div className="wl-feat">
                <div className="wl-feat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="20" x2="18" y2="10" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="12" y1="20" x2="12" y2="4"  stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="6"  y1="20" x2="6"  y2="14" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="wl-feat-text">
                  <span className="wl-feat-title">Real-time Analytics</span>
                  <span className="wl-feat-desc">Track performance and monitor your earnings live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div className="wl-right">
          <div className="wl-card">

            {/* Mobile brand */}
            <div className="wl-mobile-brand">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e9e7d6f2c135f2968907d8/b84b417d1_6296293782902737811.jpg"
                alt="WorkDen"
                style={{ height: 44, borderRadius: 10, objectFit: 'contain' }}
              />
              <span style={{ fontWeight: 800, fontSize: 20, color: '#0f172a' }}>
                Work<span style={{ color: '#4f5ef7' }}>Den</span>
              </span>
            </div>

            {/* Lock icon */}
            <div className="wl-lock-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#4f5ef7" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#4f5ef7" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1.5" fill="#4f5ef7"/>
              </svg>
            </div>

            <h2 className="wl-card-title">Welcome Back</h2>
            <p className="wl-card-sub">Login to your WorkDen account</p>

            {/* Error */}
            {error && (
              <div className="wl-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* User ID */}
              <div className="wl-field">
                <label className="wl-field-label">User ID (Mobile / Email / User ID)</label>
                <div className="wl-input-wrap">
                  <svg className="wl-field-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    className="wl-input"
                    placeholder="Enter your User ID"
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="wl-field">
                <label className="wl-field-label">Password</label>
                <div className="wl-input-wrap">
                  <svg className="wl-field-icon" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    className="wl-input"
                    style={{ paddingRight: 48 }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="wl-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword
                      ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      : <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Remember me + hint */}
              <div className="wl-row">
                <label className="wl-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <span className="wl-admin-hint">Contact admin for help</span>
              </div>

              {/* Primary login button */}
              <button
                type="submit"
                className="wl-btn-primary"
                disabled={loading || !loginId.trim() || !password.trim()}
              >
                {loading ? (
                  <>
                    <div className="wl-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                      <polyline points="10 17 15 12 10 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                    Login to Dashboard
                  </>
                )}
              </button>
            </form>

            {/* OR divider */}
            <div className="wl-or">or</div>

            {/* Support button */}
            <button
  type="button"
  className="wl-btn-secondary"
  onClick={() => {
    if (window.tidioChatApi) {
      window.tidioChatApi.open();
    } else {
      alert("Chat is loading... please try again");
    }
  }}
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
  Need Help? Contact Support
</button>
            {/* Security footer */}
            <div className="wl-security">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#b0bac8" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              Your security is our priority
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
