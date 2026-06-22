import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, CheckCircle, Clock, TrendingUp, LogOut, BarChart3, UserPlus, Copy,
  Loader2, Lock, Eye, EyeOff, Filter, Trash2, XCircle, Monitor, Smartphone,
  RefreshCw, Shield, Globe, Activity, Zap, AlertTriangle, ExternalLink, X,
  TrendingDown, Award, DollarSign, Target, PieChart, List
} from "lucide-react";
import { createPageUrl } from "@/utils";

// ─── Helpers ───────────────────────────────────────────────────────────────
const isReallyOnline = (user) => {
  // FIX: Threshold reduced from 2 minutes to 45 seconds for last_heartbeat.
  // Pehle 2 min tha — user tab switch karne ke baad bhi 2 min tak "online" dikhta tha.
  // Ab 45s: agar user portal tab pe active hai toh heartbeat aa rahi hogi (har 30s),
  // tab chhoda ya portal band kiya toh 45s mein offline ho jaayega.
  if (!user.is_logged_in) return false;
  const checkTime = user.last_heartbeat || user.last_active;
  if (!checkTime) return false;
  const diffMs = Date.now() - new Date(checkTime).getTime();
  const threshold = user.last_heartbeat ? 45 * 1000 : 5 * 60 * 1000;
  return diffMs < threshold;
};

const getDeviceIcon = (deviceType) => {
  if (deviceType === 'mobile') return '📱';
  if (deviceType === 'tablet') return '📟';
  return '💻';
};

// Inline micro-chart using canvas — no external dep needed for sparklines
const MiniBar = ({ data, colors }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const max = Math.max(...data.map(d => d.value), 1);
    const bw = (W - (data.length - 1) * 4) / data.length;
    data.forEach((d, i) => {
      const bh = Math.max(2, (d.value / max) * (H - 10));
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.roundRect(i * (bw + 4), H - bh, bw, bh, 3);
      ctx.fill();
    });
  }, [data, colors]);
  return <canvas ref={canvasRef} width={120} height={50} style={{ display: 'block' }} />;
};


const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    min-height: 100vh;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    background: #0a0a0f;
    overflow: hidden;
    position: relative;
  }

  /* Left panel — visual brand side */
  .left-panel {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    overflow: hidden;
  }

  .left-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #0f1923 0%, #0d1f2d 40%, #071a2e 100%);
    z-index: 0;
  }

  .orb-1 {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 163, 255, 0.18) 0%, transparent 70%);
    top: -100px;
    left: -100px;
    animation: floatOrb 8s ease-in-out infinite;
    z-index: 0;
  }

  .orb-2 {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 229, 180, 0.12) 0%, transparent 70%);
    bottom: -80px;
    right: -80px;
    animation: floatOrb 10s ease-in-out infinite reverse;
    z-index: 0;
  }

  .grid-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    z-index: 0;
  }

  @keyframes floatOrb {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(20px, -30px) scale(1.05); }
  }

  .left-content {
    position: relative;
    z-index: 1;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #00a3ff, #00e5b4);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #fff;
    letter-spacing: 0.5px;
  }

  .brand-name span {
    color: #00e5b4;
  }

  .hero-text {
    margin-top: auto;
    padding-top: 80px;
  }

  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 229, 180, 0.1);
    border: 1px solid rgba(0, 229, 180, 0.25);
    color: #00e5b4;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 100px;
    margin-bottom: 24px;
  }

  .hero-tag::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00e5b4;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.4); }
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 3.5vw, 48px);
    line-height: 1.2;
    color: #ffffff;
    margin-bottom: 20px;
  }

  .hero-title em {
    font-style: italic;
    background: linear-gradient(90deg, #00a3ff, #00e5b4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-desc {
    font-size: 15px;
    color: rgba(255,255,255,0.45);
    line-height: 1.7;
    max-width: 380px;
    font-weight: 300;
  }

  .stats-row {
    display: flex;
    gap: 40px;
    margin-top: 48px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-number {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    color: #fff;
    font-weight: 700;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.5px;
    font-weight: 300;
  }

  .divider-line {
    width: 1px;
    background: rgba(255,255,255,0.08);
    height: 40px;
    align-self: center;
  }

  /* Right panel — login form */
  .right-panel {
    width: 480px;
    min-width: 480px;
    background: #f8f9fc;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 52px;
    position: relative;
    z-index: 1;
  }

  .right-panel::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, transparent, rgba(0,163,255,0.3), transparent);
  }

  .form-header {
    margin-bottom: 40px;
  }

  .form-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #00a3ff;
    margin-bottom: 12px;
  }

  .form-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    color: #0f1923;
    line-height: 1.2;
    margin-bottom: 10px;
  }

  .form-subtitle {
    font-size: 14px;
    color: #8a8fa8;
    font-weight: 300;
  }

  .field-group {
    margin-bottom: 22px;
  }

  .field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #3d4155;
    margin-bottom: 8px;
  }

  .field-wrapper {
    position: relative;
  }

  .field-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #b0b4c8;
    width: 16px;
    height: 16px;
    pointer-events: none;
    transition: color 0.2s;
  }

  .field-input {
    width: 100%;
    height: 50px;
    padding: 0 44px;
    background: #fff;
    border: 1.5px solid #e4e6ef;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #0f1923;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
  }

  .field-input::placeholder {
    color: #c0c4d4;
    font-weight: 300;
  }

  .field-input:focus {
    border-color: #00a3ff;
    box-shadow: 0 0 0 4px rgba(0, 163, 255, 0.1);
  }

  .field-input:focus + .field-focus-icon,
  .field-group:focus-within .field-icon {
    color: #00a3ff;
  }

  .eye-btn {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #b0b4c8;
    padding: 2px;
    transition: color 0.2s;
    display: flex;
    align-items: center;
  }

  .eye-btn:hover { color: #00a3ff; }

  .error-box {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #fff5f5;
    border: 1.5px solid #ffd0d0;
    border-radius: 10px;
    color: #d32f2f;
    font-size: 13px;
    margin-bottom: 22px;
  }

  .submit-btn {
    width: 100%;
    height: 52px;
    background: linear-gradient(135deg, #0a1628 0%, #1a2e4a 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s, box-shadow 0.3s;
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .submit-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0,229,180,0.15), transparent);
    transition: left 0.5s;
  }

  .submit-btn:hover::before { left: 100%; }
  .submit-btn:hover {
    box-shadow: 0 8px 30px rgba(10, 22, 40, 0.4);
    transform: translateY(-1px);
  }

  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .btn-shine {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .forgot-link {
    display: block;
    text-align: right;
    font-size: 12px;
    color: #8a8fa8;
    margin-top: -10px;
    margin-bottom: 6px;
    cursor: pointer;
    transition: color 0.2s;
    text-decoration: none;
  }
  .forgot-link:hover { color: #00a3ff; }

  .form-footer {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e8eaf2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    color: #b0b4c8;
  }

  .security-badge {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .left-panel { display: none; }
    .right-panel { width: 100%; min-width: unset; padding: 40px 28px; }
    .login-root { background: #f8f9fc; }
  }
`;

function RecruiterLogin({ loginForm, setLoginForm, loginError, loginLoading, showPassword, setShowPassword, onLogin }) {
  return (
    <>
      <style>{loginStyles}</style>
      <div className="login-root">
        {/* Left Brand Panel */}
        <div className="left-panel">
          <div className="grid-lines" />
          <div className="orb-1" />
          <div className="orb-2" />

          <div className="left-content brand-logo">
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="brand-name">Recruit<span>Pro</span></span>
          </div>

          <div className="left-content" style={{ marginTop: "auto" }}>
            <div className="hero-tag">Recruiter Portal</div>
            <h1 className="hero-title">
              Hire smarter,<br /><em>move faster.</em>
            </h1>
            <p className="hero-desc">
              Your intelligent recruitment command center. Manage pipelines, track candidates, and close roles — all from one place.
            </p>

            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-number">48k+</span>
                <span className="stat-label">Active Candidates</span>
              </div>
              <div className="divider-line" />
              <div className="stat-item">
                <span className="stat-number">94%</span>
                <span className="stat-label">Placement Rate</span>
              </div>
              <div className="divider-line" />
              <div className="stat-item">
                <span className="stat-number">3.2x</span>
                <span className="stat-label">Faster Hiring</span>
              </div>
            </div>
          </div>

          <div className="left-content" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>
              256-bit encrypted · SOC 2 compliant · GDPR ready
            </span>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="right-panel">
          <div className="form-header">
            <div className="form-eyebrow">Recruiter Access</div>
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to your recruiter dashboard</p>
          </div>

          <form onSubmit={onLogin}>
            {loginError && (
              <div className="error-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#d32f2f" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {loginError}
              </div>
            )}

            <div className="field-group">
              <label className="field-label">User ID</label>
              <div className="field-wrapper">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  className="field-input"
                  placeholder="Mobile / Email / Recruiter Code"
                  value={loginForm.userId}
                  onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrapper">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  className="field-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <a href="#" className="forgot-link">Forgot your password?</a>

            <button type="submit" className="submit-btn" disabled={loginLoading}>
              <div className="btn-shine" />
              {loginLoading ? (
                <>
                  <div className="spinner" />
                  Authenticating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <polyline points="10 17 15 12 10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Login to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#b0b4c8" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span>Secured with end-to-end encryption</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function RecruiterDashboard() {
  const [recruiter, setRecruiter] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", qualification: "", recruiter_name: "" });
  const [creating, setCreating] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ userId: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [withdrawals, setWithdrawals] = useState([]);
  const [subscriptionPayments, setSubscriptionPayments] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskDateStart, setTaskDateStart] = useState("");
  const [taskDateEnd, setTaskDateEnd] = useState("");
  const [perfSummaryDialog, setPerfSummaryDialog] = useState(false);
  const [viewingPerf, setViewingPerf] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [referralPartners, setReferralPartners] = useState([]);
  const [forceLogoutLoading, setForceLogoutLoading] = useState(null);
  const [deviceSearch, setDeviceSearch] = useState("");
  const [reportUser, setReportUser] = useState(null);
  const [reportDialog, setReportDialog] = useState(false);
  const [perfSearchQuery, setPerfSearchQuery] = useState("");
  const [perfMonthFilter, setPerfMonthFilter] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`);
  const [taskRecruiterFilter, setTaskRecruiterFilter] = useState("");
  const [userRecruiterFilter, setUserRecruiterFilter] = useState("all");
  const [assignRecruiterDialog, setAssignRecruiterDialog] = useState(false);
  const [assignRecruiterUser, setAssignRecruiterUser] = useState(null);
  const [assignRecruiterName, setAssignRecruiterName] = useState("");
  const [liveActivities, setLiveActivities] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [activitySearch, setActivitySearch] = useState("");
  const [lastActivityRefresh, setLastActivityRefresh] = useState(new Date());
  const [nowTick, setNowTick] = useState(Date.now());

  // ✅ FIX: Missing state variables that caused blank screen in activity tab
  const [viewingLiveActivity, setViewingLiveActivity] = useState(null);
  const [viewingHistoryActivity, setViewingHistoryActivity] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Device tracking offline filter
  const [deviceOfflineFilter, setDeviceOfflineFilter] = useState("all");

  // Analytics sub-tab
  const [analyticsTab, setAnalyticsTab] = useState("funnel");

  const assignedUsersRef = useRef([]);
  useEffect(() => { assignedUsersRef.current = assignedUsers; }, [assignedUsers]);

  // FIX: Online/Offline auto-refresh — har 20s pe fresh last_heartbeat load karo
  // Pehle: assignedUsers sirf login ya manual action pe update hote the —
  // heartbeat DB mein stale ho jaati thi lekin dashboard pe user 'online' hi dikhta tha.
  // Ab: 20s polling + 45s threshold = tab switch ke ~45s baad user offline dikhega.
  const recruiterRef = useRef(null);
  useEffect(() => { recruiterRef.current = recruiter; }, [recruiter]);
  useEffect(() => {
    if (!isLoggedIn) return;
    const pollOnlineStatus = async () => {
      const rec = recruiterRef.current;
      if (!rec) return;
      try {
        const freshUsers = await base44.entities.AppUser.list('-created_date', 1000);
        const myUsers = freshUsers.filter(u => String(u.created_by_recruiter_id) === String(rec.id));
        setAssignedUsers(myUsers);
      } catch (e) { /* silent — stale data stays until next tick */ }
    };
    const pollInterval = setInterval(pollOnlineStatus, 20000);
    return () => clearInterval(pollInterval);
  }, [isLoggedIn]);

  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeSinceStr = (dateStr) => {
    if (!dateStr) return 'N/A';
    const diff = nowTick - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const allRecruiters = await base44.entities.Recruiter.list();
      const found = allRecruiters.find(
        r => (r.recruiter_code === loginForm.userId.trim() || r.mobile === loginForm.userId.trim() || r.email === loginForm.userId.trim()) &&
             r.password === loginForm.password.trim() &&
             r.status === 'active'
      );
      if (!found) { setLoginError("❌ Invalid User ID or Password."); return; }
      localStorage.setItem('workden_recruiter_id', found.id);
      localStorage.setItem('workden_user_source', 'recruiter');
      setRecruiter(found);
      setIsLoggedIn(true);
      await loadData(found);
    } catch (err) {
      setLoginError("❌ Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem('workden_recruiter_id');
    const userSource = localStorage.getItem('workden_user_source');
    if (savedId && userSource === 'recruiter') autoLogin(savedId);
  }, []);

  const autoLogin = async (recruiterId) => {
    setLoading(true);
    try {
      const allRecruiters = await base44.entities.Recruiter.list();
      const found = allRecruiters.find(r => r.id === recruiterId && r.status === 'active');
      if (found) { setRecruiter(found); setIsLoggedIn(true); await loadData(found); }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const loadData = async (rec) => {
    try {
      const [allAppUsers, allProofs, allWithdrawals, allSubPayments, allReferralPartners] = await Promise.all([
        base44.entities.AppUser.list('-created_date', 1000),
        base44.entities.Proof.list('-created_date', 2000),
        base44.entities.WithdrawalRequest.list('-created_date', 1000),
        base44.entities.SubscriptionPayment.list('-created_date', 1000),
        base44.entities.ReferralPartner.list('-created_date', 500)
      ]);
      const myUsers = allAppUsers.filter(u => String(u.created_by_recruiter_id) === String(rec.id));
      setAssignedUsers(myUsers);
      const myUserIds = new Set(myUsers.map(u => String(u.id)));
      setProofs(allProofs.filter(p => myUserIds.has(String(p.user_id))));
      setWithdrawals(allWithdrawals.filter(w => myUserIds.has(String(w.user_id))));
      setSubscriptionPayments(allSubPayments.filter(s => myUserIds.has(String(s.user_id))));
      setReferralPartners(allReferralPartners.filter(r => myUserIds.has(String(r.user_id))));
    } catch (e) { console.error('loadData error:', e); }
  };

  const getFilteredUsers = () => {
    const now = new Date();
    return assignedUsers.filter(u => {
      const d = new Date(u.created_date);
      if (dateFilter !== "all") {
        if (dateFilter === "today") { const s = new Date(now); s.setHours(0,0,0,0); if (d < s) return false; }
        else if (dateFilter === "yesterday") { const s = new Date(now); s.setDate(s.getDate()-1); s.setHours(0,0,0,0); const e = new Date(s); e.setHours(23,59,59,999); if (d < s || d > e) return false; }
        else if (dateFilter === "last2days") { const s = new Date(now); s.setDate(s.getDate()-2); s.setHours(0,0,0,0); if (d < s) return false; }
        else if (dateFilter === "lastweek") { const s = new Date(now); s.setDate(s.getDate()-7); if (d < s) return false; }
        else if (dateFilter === "lastmonth") { const s = new Date(now); s.setMonth(s.getMonth()-1); if (d < s) return false; }
        else if (dateFilter === "custom" && customStart && customEnd) { if (d < new Date(customStart) || d > new Date(customEnd + "T23:59:59")) return false; }
      }
      if (statusFilter === "subscribed" && !u.is_subscribed) return false;
      if (statusFilter === "not_subscribed" && u.is_subscribed) return false;
      if (userSearch.trim()) {
        const s = userSearch.toLowerCase();
        if (!u.full_name?.toLowerCase().includes(s) && !u.email?.toLowerCase().includes(s) && !u.login_user_id?.toLowerCase().includes(s) && !u.phone?.toLowerCase().includes(s)) return false;
      }
      if (userRecruiterFilter !== 'all' && (u.assigned_recruiter_name || '') !== userRecruiterFilter) return false;
      return true;
    });
  };

  const getFilteredProofs = () => {
    return proofs.filter(p => {
      if (taskStatusFilter !== 'all' && p.status !== taskStatusFilter) return false;
      if (taskSearch.trim()) {
        const s = taskSearch.toLowerCase();
        const user = assignedUsers.find(u => String(u.id) === String(p.user_id));
        if (!p.user_name?.toLowerCase().includes(s) && !p.work_type?.toLowerCase().includes(s) && !user?.phone?.toLowerCase().includes(s) && !user?.email?.toLowerCase().includes(s)) return false;
      }
      if (taskDateStart && taskDateEnd) {
        const d = new Date(p.submitted_date || p.created_date);
        if (d < new Date(taskDateStart) || d > new Date(taskDateEnd + "T23:59:59")) return false;
      }
      if (taskRecruiterFilter.trim()) {
        const user = assignedUsers.find(u => String(u.id) === String(p.user_id));
        const rName = (user?.assigned_recruiter_name || recruiter?.name || '').toLowerCase();
        if (!rName.includes(taskRecruiterFilter.toLowerCase())) return false;
      }
      return true;
    });
  };

  const handleDeleteUser = async (u) => {
    try {
      await base44.entities.AppUser.delete(u.id);
      await loadData(recruiter);
      setDeleteConfirmUser(null);
      alert("✅ User deleted!");
    } catch (e) { alert("❌ Failed to delete user."); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.city.trim()) {
      alert("⚠️ Name, Phone, Email and City are required"); return;
    }
    setCreating(true);
    try {
      const enteredRecruiterName = form.recruiter_name?.trim() || "";
      const newUser = await base44.entities.AppUser.create({
        login_user_id: form.email.trim(),
        login_password: form.phone.trim(),
        full_name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        qualification: form.qualification.trim(),
        role: "user",
        is_subscribed: false,
        status: "active",
        assigned_tasks: [],
        wallet_balance: 0,
        total_earnings: 0,
        gamification_points: 0,
        badge: "Bronze",
        created_by_recruiter_id: String(recruiter.id),
        assigned_recruiter_id: String(recruiter.id),
        assigned_recruiter_name: enteredRecruiterName,
      });
      setCreatedCreds({ userId: newUser.login_user_id, password: newUser.login_password, name: newUser.full_name });
      setForm({ name: "", phone: "", email: "", city: "", qualification: "", recruiter_name: "" });
      await loadData(recruiter);
    } catch (err) { alert("❌ Failed to create user. Try again."); }
    finally { setCreating(false); }
  };

  const handleForceLogout = async (user) => {
    if (!confirm(`Force logout ${user.full_name}?\n\nThey will be logged out from their device. Data, wallet PIN and settings will NOT be affected.`)) return;
    setForceLogoutLoading(user.id);
    try {
      await base44.entities.AppUser.update(user.id, { is_logged_in: false, session_id: null });
      await loadData(recruiter);
      alert(`✅ ${user.full_name} logged out. All data is safe.`);
    } catch (e) { alert("❌ Failed to logout."); }
    finally { setForceLogoutLoading(null); }
  };

  const copyText = (text) => { navigator.clipboard.writeText(text); alert("✅ Copied!"); };

  const getUserTag = (userId) => {
    const approvedCount = proofs.filter(p => String(p.user_id) === String(userId) && p.status === 'approved').length;
    if (approvedCount >= 30) return { label: 'Platinum', color: 'bg-purple-600' };
    if (approvedCount >= 20) return { label: 'Gold', color: 'bg-yellow-500' };
    if (approvedCount >= 10) return { label: 'Silver', color: 'bg-gray-400' };
    return { label: 'Normal', color: 'bg-blue-400' };
  };

  const handleAssignRecruiter = async () => {
    if (!assignRecruiterUser || !assignRecruiterName.trim()) return;
    try {
      await base44.entities.AppUser.update(assignRecruiterUser.id, { assigned_recruiter_name: assignRecruiterName.trim() });
      await loadData(recruiter);
      setAssignRecruiterDialog(false);
      setAssignRecruiterUser(null);
      setAssignRecruiterName("");
      alert("✅ Recruiter name updated!");
    } catch (e) { alert("❌ Failed to update."); }
  };

  useEffect(() => {
    if (activeTab !== 'activity' || !recruiter) return;
    const fetchActivity = async () => {
      try {
        const currentUsers = assignedUsersRef.current;
        const myUserIds = new Set(currentUsers.map(u => String(u.id)));
        if (myUserIds.size === 0) return;
        const [live, hist] = await Promise.all([
          base44.entities.LiveActivity.list('-start_time', 200),
          base44.entities.ActivityHistory.list('-end_time', 500),
        ]);
        setLiveActivities((live || []).filter(a => myUserIds.has(String(a.user_id))));
        setActivityHistory((hist || []).filter(a => myUserIds.has(String(a.user_id))));
        setLastActivityRefresh(new Date());
      } catch(e) { console.error('Activity fetch error:', e); }
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 3000);
    return () => clearInterval(interval);
  }, [activeTab, recruiter]);

  const fmtDur = (sec) => {
    if (!sec || sec <= 0) return 'N/A';
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const handleLogout = () => {
    localStorage.removeItem('workden_recruiter_id');
    localStorage.removeItem('workden_user_source');
    setIsLoggedIn(false);
    setRecruiter(null);
    setLoginForm({ userId: "", password: "" });
  };

  const getTimeSince = (dateStr) => {
    if (!dateStr) return 'N/A';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // ─── Device offline filter helper ────────────────────────────────────────
  const getOfflineSince = (user) => {
    const t = user.last_active;
    if (!t) return Infinity;
    return Date.now() - new Date(t).getTime();
  };

  const filterByOfflineDuration = (user) => {
    if (deviceOfflineFilter === 'all') return true;
    if (isReallyOnline(user)) return false; // online users excluded from offline filters
    const diffMs = getOfflineSince(user);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (deviceOfflineFilter === '1d') return diffDays >= 1 && diffDays < 2;
    if (deviceOfflineFilter === '2d') return diffDays >= 2 && diffDays < 3;
    if (deviceOfflineFilter === '3d') return diffDays >= 3 && diffDays < 4;
    if (deviceOfflineFilter === '7d') return diffDays >= 7 && diffDays < 15;
    if (deviceOfflineFilter === '15d') return diffDays >= 15 && diffDays < 30;
    if (deviceOfflineFilter === '30d') return diffDays >= 30;
    return true;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!isLoggedIn) {
    return (
      <RecruiterLogin
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        loginError={loginError}
        loginLoading={loginLoading}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onLogin={handleLogin}
      />
    );
  }
  const filteredUsers = getFilteredUsers();
  const filteredUserIds = new Set(filteredUsers.map(u => String(u.id)));
  const filteredProofsAll = proofs.filter(p => filteredUserIds.has(String(p.user_id)));
  const approvedProofs = filteredProofsAll.filter(p => p.status === 'approved');
  const pendingProofsArr = filteredProofsAll.filter(p => p.status === 'pending');
  const rejectedProofs = filteredProofsAll.filter(p => p.status === 'rejected');
  const filteredProofsDisplay = getFilteredProofs();

  // ─── Analytics calculations ───────────────────────────────────────────────
  const totalUsers = assignedUsers.length;
  const subscribedUsers = assignedUsers.filter(u => u.is_subscribed).length;
  const activeUsers = assignedUsers.filter(u => {
    const last = u.last_active || u.last_heartbeat;
    if (!last) return false;
    return (Date.now() - new Date(last).getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const inactiveUsers = totalUsers - activeUsers;
  const totalApproved = proofs.filter(p => p.status === 'approved').length;
  const totalRejected = proofs.filter(p => p.status === 'rejected').length;
  const totalPending = proofs.filter(p => p.status === 'pending').length;
  const totalRewards = proofs.filter(p => p.status === 'approved').reduce((s, p) => s + Number(p.reward_amount || 0), 0);
  const totalWithdrawn = withdrawals.filter(w => w.status === 'completed').reduce((s, w) => s + Number(w.amount || 0), 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + Number(w.amount || 0), 0);
  const conversionRate = totalUsers > 0 ? ((subscribedUsers / totalUsers) * 100).toFixed(1) : 0;
  const retentionRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;
  const approvalRate = proofs.length > 0 ? ((totalApproved / proofs.length) * 100).toFixed(1) : 0;

  // City breakdown
  const cityMap = {};
  assignedUsers.forEach(u => { const c = u.city || 'Unknown'; cityMap[c] = (cityMap[c] || 0) + 1; });
  const cityData = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Recruiter breakdown
  const recruiterMap = {};
  assignedUsers.forEach(u => { const r = u.assigned_recruiter_name || 'Unassigned'; recruiterMap[r] = (recruiterMap[r] || 0) + 1; });
  const recruiterData = Object.entries(recruiterMap).sort((a, b) => b[1] - a[1]);

  // Task breakdown
  const taskMap = {};
  proofs.forEach(p => { taskMap[p.work_type] = (taskMap[p.work_type] || 0) + 1; });
  const taskData = Object.entries(taskMap).sort((a, b) => b[1] - a[1]);

  // Tag breakdown
  const tagCounts = { Platinum: 0, Gold: 0, Silver: 0, Normal: 0 };
  assignedUsers.forEach(u => { const tag = getUserTag(u.id); tagCounts[tag.label]++; });

  // Device breakdown
  const deviceMap = {};
  assignedUsers.forEach(u => { const d = u.device_type || 'unknown'; deviceMap[d] = (deviceMap[d] || 0) + 1; });

  // Daily submissions (last 14 days)
  const dailyMap = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    dailyMap[d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })] = 0;
  }
  proofs.forEach(p => {
    const d = new Date(p.submitted_date || p.created_date);
    const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (dailyMap[key] !== undefined) dailyMap[key]++;
  });
  const dailyLabels = Object.keys(dailyMap);
  const dailyValues = Object.values(dailyMap);

  // ─── Performance tab helpers ──────────────────────────────────────────────
  const taskCounts = {};
  proofs.forEach(p => { taskCounts[p.work_type] = (taskCounts[p.work_type] || 0) + 1; });
  const sortedTasks = Object.entries(taskCounts).sort((a, b) => b[1] - a[1]);
  const topTask = sortedTasks[0]?.[0] || '—';
  const approvedAll = proofs.filter(p => p.status === 'approved');
  const rejectedAll = proofs.filter(p => p.status === 'rejected');
  const overallApprovalRate = proofs.length > 0 ? Math.round((approvedAll.length / proofs.length) * 100) : 0;

  // ─── Analytics Funnel Section ─────────────────────────────────────────────
  const AnalyticsFunnel = () => {
    const funnelSteps = [
      { label: 'Total Created', value: totalUsers, color: '#3b82f6', pct: 100 },
      { label: 'Active (7d)', value: activeUsers, color: '#8b5cf6', pct: totalUsers > 0 ? Math.round((activeUsers/totalUsers)*100) : 0 },
      { label: 'Subscribed', value: subscribedUsers, color: '#10b981', pct: totalUsers > 0 ? Math.round((subscribedUsers/totalUsers)*100) : 0 },
      { label: 'Task Submitted', value: [...new Set(proofs.map(p => String(p.user_id)))].length, color: '#f59e0b', pct: totalUsers > 0 ? Math.round(([...new Set(proofs.map(p => String(p.user_id)))].length/totalUsers)*100) : 0 },
      { label: 'Task Approved', value: [...new Set(approvedAll.map(p => String(p.user_id)))].length, color: '#06b6d4', pct: totalUsers > 0 ? Math.round(([...new Set(approvedAll.map(p => String(p.user_id)))].length/totalUsers)*100) : 0 },
      { label: 'Withdrawn', value: [...new Set(withdrawals.filter(w=>w.status==='completed').map(w => String(w.user_id)))].length, color: '#ec4899', pct: totalUsers > 0 ? Math.round(([...new Set(withdrawals.filter(w=>w.status==='completed').map(w => String(w.user_id)))].length/totalUsers)*100) : 0 },
    ];

    return (
      <div className="space-y-6">
        {/* Metric Cards Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Users', value: totalUsers, icon: '👥', bg: 'from-blue-500 to-blue-600' },
            { label: 'Active Users', value: activeUsers, icon: '🟢', bg: 'from-purple-500 to-purple-600' },
            { label: 'Inactive Users', value: inactiveUsers, icon: '⚫', bg: 'from-gray-500 to-gray-600' },
            { label: 'Subscribed', value: subscribedUsers, icon: '✅', bg: 'from-green-500 to-emerald-600' },
          ].map(({ label, value, icon, bg }) => (
            <div key={label} className={`bg-gradient-to-br ${bg} text-white rounded-xl p-4 text-center shadow-md`}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-3xl font-black">{value}</div>
              <div className="text-xs opacity-90 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Metric Cards Row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Conversion Rate', value: conversionRate + '%', icon: '🎯', bg: 'from-cyan-500 to-cyan-600', sub: 'Created → Subscribed' },
            { label: 'Retention Rate', value: retentionRate + '%', icon: '🔄', bg: 'from-teal-500 to-teal-600', sub: 'Active in last 7d' },
            { label: 'Approval Rate', value: approvalRate + '%', icon: '📊', bg: 'from-indigo-500 to-indigo-600', sub: 'Task success rate' },
            { label: 'Revenue Generated', value: '₹' + Number(totalRewards).toFixed(0), icon: '💰', bg: 'from-yellow-500 to-orange-500', sub: 'Total approved rewards' },
          ].map(({ label, value, icon, bg, sub }) => (
            <div key={label} className={`bg-gradient-to-br ${bg} text-white rounded-xl p-4 text-center shadow-md`}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-black">{value}</div>
              <div className="text-xs font-semibold mt-1">{label}</div>
              <div className="text-xs opacity-70">{sub}</div>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-3">
            <p className="text-white font-bold text-base">📉 User Conversion Funnel — Drop Analysis</p>
            <p className="text-blue-200 text-xs mt-0.5">Track how users move from creation to withdrawal</p>
          </div>
          <div className="p-5 space-y-3">
            {funnelSteps.map((step, i) => {
              const dropPct = i > 0 ? funnelSteps[i-1].value > 0 ? (((funnelSteps[i-1].value - step.value) / funnelSteps[i-1].value) * 100).toFixed(0) : 0 : null;
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 w-4">{i + 1}</span>
                      <span className="text-sm font-semibold text-gray-800">{step.label}</span>
                      {dropPct !== null && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                          ↓ {dropPct}% drop
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black" style={{ color: step.color }}>{step.value}</span>
                      <span className="text-xs text-gray-500 w-10 text-right">{step.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-5 relative overflow-hidden">
                    <div
                      className="h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${Math.max(step.pct, 2)}%`, backgroundColor: step.color }}>
                      {step.pct > 10 && <span className="text-white text-xs font-bold">{step.pct}%</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Submissions', value: proofs.length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Approved', value: totalApproved, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
            { label: 'Rejected', value: totalRejected, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
            { label: 'Pending', value: totalPending, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border-2 p-4 text-center ${bg}`}>
              <div className={`text-3xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-gray-600 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Earnings & Withdrawal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Earnings (Approved)', value: '₹' + Number(totalRewards).toFixed(0), icon: '💵', color: 'text-green-700', bg: 'bg-green-50 border-green-300' },
            { label: 'Total Withdrawn', value: '₹' + Number(totalWithdrawn).toFixed(0), icon: '🏧', color: 'text-red-700', bg: 'bg-red-50 border-red-300' },
            { label: 'Pending Withdrawal', value: '₹' + Number(pendingWithdrawals).toFixed(0), icon: '⏳', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-300' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className={`rounded-xl border-2 p-5 ${bg}`}>
              <div className="text-3xl mb-2">{icon}</div>
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-sm text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Referral Partners */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3">
            <p className="text-white font-bold text-base">🤝 Referral Partner Summary</p>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            {[
              { label: 'Total Applied', value: referralPartners.length, color: 'text-purple-700' },
              { label: 'Approved', value: referralPartners.filter(r => r.status === 'approved').length, color: 'text-green-700' },
              { label: 'Pending', value: referralPartners.filter(r => r.status === 'pending').length, color: 'text-yellow-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`text-3xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AnalyticsCharts = () => (
    <div className="space-y-6">
      {/* User Tags breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3">
          <p className="text-white font-bold text-base">🏆 User Tag Distribution</p>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Platinum', value: tagCounts.Platinum, color: 'bg-purple-600 text-white' },
            { label: 'Gold', value: tagCounts.Gold, color: 'bg-yellow-500 text-white' },
            { label: 'Silver', value: tagCounts.Silver, color: 'bg-gray-400 text-white' },
            { label: 'Normal', value: tagCounts.Normal, color: 'bg-blue-400 text-white' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`rounded-full w-16 h-16 mx-auto flex items-center justify-center text-2xl font-black ${color} shadow`}>{value}</div>
              <div className="text-xs text-gray-600 mt-2 font-semibold">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription + Not Subscribed */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-5 py-3">
          <p className="text-white font-bold text-base">📋 Subscription Status</p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-700 font-semibold">✅ Subscribed ({subscribedUsers})</span>
                <span className="text-gray-500">{totalUsers > 0 ? Math.round((subscribedUsers/totalUsers)*100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${totalUsers > 0 ? (subscribedUsers/totalUsers)*100 : 0}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-600 font-semibold">❌ Not Subscribed ({totalUsers - subscribedUsers})</span>
                <span className="text-gray-500">{totalUsers > 0 ? Math.round(((totalUsers - subscribedUsers)/totalUsers)*100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div className="bg-red-400 h-4 rounded-full" style={{ width: `${totalUsers > 0 ? ((totalUsers-subscribedUsers)/totalUsers)*100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Tasks */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
          <p className="text-white font-bold text-base">🎯 Top Task Submissions</p>
          <p className="text-amber-100 text-xs">Most popular: {topTask}</p>
        </div>
        <div className="p-5 space-y-3">
          {taskData.slice(0, 8).map(([name, count], i) => {
            const pct = proofs.length > 0 ? Math.round((count / proofs.length) * 100) : 0;
            const approved = proofs.filter(p => p.work_type === name && p.status === 'approved').length;
            const colors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ec4899','#06b6d4','#ef4444','#6366f1'];
            return (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-800 truncate max-w-[60%]">{name}</span>
                  <span className="text-gray-500 text-xs">{count} total • ✅ {approved}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full" style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: colors[i % colors.length] }} />
                </div>
              </div>
            );
          })}
          {taskData.length === 0 && <p className="text-gray-400 text-center py-4">No submissions yet</p>}
        </div>
      </div>

      {/* City breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3">
          <p className="text-white font-bold text-base">🏙️ City-wise User Distribution</p>
        </div>
        <div className="p-5 space-y-3">
          {cityData.map(([city, count], i) => {
            const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            return (
              <div key={city} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 w-5">{i+1}</span>
                <span className="text-sm font-semibold text-gray-800 w-32 truncate">{city}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div className="bg-cyan-500 h-3 rounded-full" style={{ width: `${Math.max(pct,1)}%` }} />
                </div>
                <span className="text-sm font-bold text-cyan-700 w-8 text-right">{count}</span>
              </div>
            );
          })}
          {cityData.length === 0 && <p className="text-gray-400 text-center py-4">No city data</p>}
        </div>
      </div>

      {/* Recruiter breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-3">
          <p className="text-white font-bold text-base">👤 Recruiter-wise Users</p>
        </div>
        <div className="p-5 space-y-3">
          {recruiterData.map(([name, count], i) => {
            const pct = totalUsers > 0 ? Math.round((count/totalUsers)*100) : 0;
            const subCount = assignedUsers.filter(u => (u.assigned_recruiter_name || 'Unassigned') === name && u.is_subscribed).length;
            return (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-800">{name}</span>
                  <span className="text-gray-500 text-xs">{count} users • ✅ {subCount} subscribed</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-rose-500 h-3 rounded-full" style={{ width: `${Math.max(pct,1)}%` }} />
                </div>
              </div>
            );
          })}
          {recruiterData.length === 0 && <p className="text-gray-400 text-center py-4">No recruiter data</p>}
        </div>
      </div>

      {/* Device type */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-3">
          <p className="text-white font-bold text-base">📱 Device Tracking Summary</p>
        </div>
        <div className="p-5 grid grid-cols-3 gap-4">
          {Object.entries(deviceMap).map(([dtype, count]) => (
            <div key={dtype} className="text-center">
              <div className="text-3xl mb-1">{getDeviceIcon(dtype)}</div>
              <div className="text-2xl font-black text-gray-800">{count}</div>
              <div className="text-xs text-gray-500 capitalize">{dtype}</div>
            </div>
          ))}
          {Object.keys(deviceMap).length === 0 && (
            <div className="col-span-3 text-center text-gray-400 py-4">No device data tracked yet</div>
          )}
        </div>
        <div className="px-5 pb-5 grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-green-700">{assignedUsers.filter(u => isReallyOnline(u)).length}</div>
            <div className="text-xs text-gray-500 mt-1">🟢 Online Now</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-gray-700">{assignedUsers.filter(u => !isReallyOnline(u)).length}</div>
            <div className="text-xs text-gray-500 mt-1">⚫ Offline</div>
          </div>
        </div>
      </div>

      {/* Daily submission trend - last 14 days */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3">
          <p className="text-white font-bold text-base">📅 Daily Submissions — Last 14 Days</p>
        </div>
        <div className="p-5">
          <div className="flex items-end gap-1.5 h-28">
            {dailyValues.map((v, i) => {
              const max = Math.max(...dailyValues, 1);
              const pct = (v / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: 80 }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-sm bg-indigo-500 transition-all"
                      style={{ height: `${Math.max(pct, v > 0 ? 4 : 0)}%` }}
                      title={`${dailyLabels[i]}: ${v}`}
                    />
                  </div>
                  <span className="text-gray-400" style={{ fontSize: 8, writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }}>{dailyLabels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Force Logout & Status combined table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3">
          <p className="text-white font-bold text-base">🔒 Force Logout & Session Status</p>
          <p className="text-red-100 text-xs mt-0.5">Users currently logged in</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">User</th>
                <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                <th className="text-left p-3 font-semibold text-gray-700">Last Seen</th>
                <th className="text-left p-3 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assignedUsers.filter(u => u.is_logged_in).map(u => (
                <tr key={u.id} className={isReallyOnline(u) ? 'bg-green-50' : 'bg-orange-50'}>
                  <td className="p-3">
                    <p className="font-semibold">{u.full_name}</p>
                    <p className="text-xs text-gray-500">{u.phone}</p>
                  </td>
                  <td className="p-3">
                    <Badge className={isReallyOnline(u) ? 'bg-green-600' : 'bg-gray-400'}>
                      {isReallyOnline(u) ? '🟢 Online' : '⚫ Offline'}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-gray-600">{getTimeSince(u.last_active)}</td>
                  <td className="p-3">
                    <Button size="sm" variant="destructive" onClick={() => handleForceLogout(u)} disabled={forceLogoutLoading === u.id} className="h-7 text-xs">
                      <LogOut className="w-3 h-3 mr-1" />
                      {forceLogoutLoading === u.id ? 'Logging out...' : 'Force Logout'}
                    </Button>
                  </td>
                </tr>
              ))}
              {assignedUsers.filter(u => u.is_logged_in).length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400">No users currently logged in</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6 pb-24">
      <div className="w-full max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setCreateDialog(true); setCreatedCreds(null); }} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />Create User
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <CardContent className="p-4 text-center"><Users className="w-8 h-8 mx-auto mb-1 opacity-90" /><p className="text-xs opacity-90">My Users</p><p className="text-3xl font-bold">{assignedUsers.length}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg cursor-pointer" onClick={() => { setActiveTab('tasks'); setTaskStatusFilter('approved'); }}>
            <CardContent className="p-4 text-center"><CheckCircle className="w-8 h-8 mx-auto mb-1 opacity-90" /><p className="text-xs opacity-90">Approved</p><p className="text-3xl font-bold">{approvedProofs.length}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg cursor-pointer" onClick={() => { setActiveTab('tasks'); setTaskStatusFilter('pending'); }}>
            <CardContent className="p-4 text-center"><Clock className="w-8 h-8 mx-auto mb-1 opacity-90" /><p className="text-xs opacity-90">Pending</p><p className="text-3xl font-bold">{pendingProofsArr.length}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg cursor-pointer" onClick={() => { setActiveTab('tasks'); setTaskStatusFilter('rejected'); }}>
            <CardContent className="p-4 text-center"><XCircle className="w-8 h-8 mx-auto mb-1 opacity-90" /><p className="text-xs opacity-90">Rejected</p><p className="text-3xl font-bold">{rejectedProofs.length}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
            <CardContent className="p-4 text-center"><TrendingUp className="w-8 h-8 mx-auto mb-1 opacity-90" /><p className="text-xs opacity-90">Subscribed</p><p className="text-3xl font-bold">{assignedUsers.filter(u => u.is_subscribed).length}</p></CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 flex-wrap">
          {[
            ["users","👥 My Users"],
            ["tasks","📋 Task Submissions"],
            ["activity","📡 Live Activity"],
            ["devices","📱 Device Tracking"],
            ["performance","📈 Performance"],
            ["analytics","🔬 Analytics"],
            ["referralpartners",`🤝 Referral Partners (${referralPartners.length})`],
            ["profile","👤 My Profile"]
          ].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════ USERS TAB ════════════════════════════ */}
        {activeTab === 'users' && (
          <Card className="shadow-xl mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />My Created Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Join Date:</span>
                {["all","today","yesterday","last2days","lastweek","lastmonth","custom"].map(f => (
                  <Button key={f} size="sm" variant={dateFilter === f ? "default" : "outline"} className="h-7 text-xs" onClick={() => setDateFilter(f)}>
                    {f === "all" ? "All" : f === "today" ? "Today" : f === "yesterday" ? "Yesterday" : f === "last2days" ? "Last 2 Days" : f === "lastweek" ? "Last Week" : f === "lastmonth" ? "Last Month" : "Custom"}
                  </Button>
                ))}
              </div>
              {dateFilter === "custom" && (
                <div className="flex gap-2"><Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="max-w-xs" /><Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="max-w-xs" /></div>
              )}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-gray-700">Status:</span>
                {[["all","All"],["subscribed","Subscribed"],["not_subscribed","Not Subscribed"]].map(([val, label]) => (
                  <Button key={val} size="sm" variant={statusFilter === val ? "default" : "outline"} className="h-7 text-xs" onClick={() => setStatusFilter(val)}>{label}</Button>
                ))}
              </div>
              {(() => {
                const recruiterNames = [...new Set(assignedUsers.map(u => u.assigned_recruiter_name).filter(Boolean))];
                return recruiterNames.length > 0 ? (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-semibold text-gray-700">Recruiter:</span>
                    <select value={userRecruiterFilter} onChange={e => setUserRecruiterFilter(e.target.value)} className="px-3 py-1.5 border rounded-md text-sm bg-white">
                      <option value="all">All Recruiters</option>
                      {recruiterNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </div>
                ) : null;
              })()}
              <Input placeholder="Search by name, email, phone, user ID..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="max-w-md" />
            </CardContent>
            <CardContent className="p-0 overflow-x-auto">
              {filteredUsers.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Recruiter</th>
                      <th className="text-left p-3 font-semibold text-gray-700">User ID (Email)</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Password (Phone)</th>
                      <th className="text-left p-3 font-semibold text-gray-700">City</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Subscription</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Sub Date</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Total Tasks</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Approved</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Rejected</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Pending</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Tag</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Earnings</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Withdrawn</th>
                      <th className="text-left p-3 font-semibold text-gray-700">W. Requests</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Last Login</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map(u => {
                      const userProofs = proofs.filter(p => String(p.user_id) === String(u.id));
                      const allSubPaymentsForUser = subscriptionPayments.filter(s => String(s.user_id) === String(u.id));
                      const subPayment = allSubPaymentsForUser.find(s => s.status === 'approved');
                      const subDate = u.subscription_activation_date || u.subscription_date || subPayment?.approved_date || subPayment?.created_date;
                      const tag = getUserTag(u.id);
                      const userWithdrawals = withdrawals.filter(w => String(w.user_id) === String(u.id));
                      const totalWithdrawn = userWithdrawals.filter(w => w.status === 'completed').reduce((s, w) => s + Number(w.amount || 0), 0);
                      return (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="p-3 font-medium">{u.full_name}</td>
                          <td className="p-3 text-xs text-indigo-700 font-semibold">{u.assigned_recruiter_name || '-'}</td>
                          <td className="p-3 font-mono text-blue-600 text-xs">{u.login_user_id || '-'}</td>
                          <td className="p-3 font-mono text-sm">{u.login_password || '-'}</td>
                          <td className="p-3 text-gray-600">{u.city || '-'}</td>
                          <td className="p-3">
                            <Badge className={u.is_subscribed ? 'bg-green-600' : 'bg-gray-400'}>{u.is_subscribed ? '✓ Active' : 'Pending'}</Badge>
                          </td>
                          <td className="p-3 text-xs text-gray-600">
                            {subDate ? <span className="text-green-700 font-semibold">{new Date(subDate).toLocaleDateString('en-IN')}</span>
                              : u.is_subscribed ? <span className="text-green-600 font-semibold text-xs">Active (date N/A)</span>
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="p-3 font-bold text-blue-600">{userProofs.length}</td>
                          <td className="p-3 font-bold text-green-600">{userProofs.filter(p => p.status === 'approved').length}</td>
                          <td className="p-3 font-bold text-red-500">{userProofs.filter(p => p.status === 'rejected').length}</td>
                          <td className="p-3 font-bold text-yellow-600">{userProofs.filter(p => p.status === 'pending').length}</td>
                          <td className="p-3"><span className={`text-xs font-bold text-white px-2 py-1 rounded-full ${tag.color}`}>{tag.label}</span></td>
                          <td className="p-3 font-bold text-green-700">₹{Number(u.wallet_balance || 0).toFixed(0)}</td>
                          <td className="p-3 font-bold text-red-600">₹{Number(totalWithdrawn).toFixed(0)}</td>
                          <td className="p-3 text-center font-bold text-purple-700">{userWithdrawals.length}</td>
                          <td className="p-3 text-xs text-gray-500">{u.last_active ? new Date(u.last_active).toLocaleString() : '-'}</td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => { setAssignRecruiterUser(u); setAssignRecruiterName(u.assigned_recruiter_name || recruiter?.name || ''); setAssignRecruiterDialog(true); }}>
                                ✏️ Edit Recruiter Name
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setDeleteConfirmUser(u)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-gray-500"><Users className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No users found. Click "Create User" to add one.</p></div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════ TASK SUBMISSIONS TAB ════════════════════════════ */}
        {activeTab === 'tasks' && (
          <Card className="shadow-xl mb-6">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Task Submissions ({filteredProofsDisplay.length})</CardTitle>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-sm text-white/80">Status:</span>
                {[["all","All"],["pending","Pending"],["approved","Approved"],["rejected","Rejected"]].map(([val, label]) => (
                  <button key={val} onClick={() => setTaskStatusFilter(val)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${taskStatusFilter === val ? 'bg-white text-green-700' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Input placeholder="Search by user name, email, mobile, task..." value={taskSearch} onChange={e => setTaskSearch(e.target.value)} className="max-w-md" />
                <Input placeholder="Filter by recruiter name..." value={taskRecruiterFilter} onChange={e => setTaskRecruiterFilter(e.target.value)} className="max-w-xs" />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-gray-700">📅 Quick Filter:</span>
                {[
                  { label: "Today", fn: () => { const t = new Date().toISOString().split('T')[0]; setTaskDateStart(t); setTaskDateEnd(t); }},
                  { label: "Yesterday", fn: () => { const d = new Date(); d.setDate(d.getDate()-1); const t = d.toISOString().split('T')[0]; setTaskDateStart(t); setTaskDateEnd(t); }},
                  { label: "Last 2 Days", fn: () => { const d = new Date(); d.setDate(d.getDate()-2); setTaskDateStart(d.toISOString().split('T')[0]); setTaskDateEnd(new Date().toISOString().split('T')[0]); }},
                  { label: "Last Week", fn: () => { const d = new Date(); d.setDate(d.getDate()-7); setTaskDateStart(d.toISOString().split('T')[0]); setTaskDateEnd(new Date().toISOString().split('T')[0]); }},
                  { label: "Last Month", fn: () => { const d = new Date(); d.setMonth(d.getMonth()-1); setTaskDateStart(d.toISOString().split('T')[0]); setTaskDateEnd(new Date().toISOString().split('T')[0]); }},
                ].map(({ label, fn }) => (
                  <Button key={label} size="sm" variant="outline" className="h-7 text-xs" onClick={fn}>{label}</Button>
                ))}
                {(taskDateStart || taskDateEnd) && (
                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={() => { setTaskDateStart(""); setTaskDateEnd(""); }}>✕ Clear</Button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">Custom:</span>
                <Input type="date" value={taskDateStart} onChange={e => setTaskDateStart(e.target.value)} className="max-w-[160px] h-8 text-xs" />
                <span className="text-gray-500 text-xs">to</span>
                <Input type="date" value={taskDateEnd} onChange={e => setTaskDateEnd(e.target.value)} className="max-w-[160px] h-8 text-xs" />
              </div>
            </CardContent>
            <CardContent className="p-0 overflow-x-auto">
              {filteredProofsDisplay.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Recruiter</th>
                      <th className="text-left p-3 font-semibold text-gray-700">User Details</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Task</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Reward</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-3 font-semibold text-gray-700 min-w-[180px]">Rejection Reason</th>
                      <th className="text-left p-3 font-semibold text-gray-700 min-w-[140px]">Performance</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProofsDisplay.slice(0, 200).map(p => {
                      const user = assignedUsers.find(u => String(u.id) === String(p.user_id));
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3 text-xs text-indigo-700 font-semibold">{user?.assigned_recruiter_name || '-'}</td>
                          <td className="p-3">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-gray-900">{p.user_name}</p>
                              {user?.phone && <p className="text-xs text-gray-600">📱 {user.phone}</p>}
                              {user?.email && <p className="text-xs text-gray-500">✉️ {user.email}</p>}
                              {user?.qualification && <p className="text-xs text-gray-400">🎓 {user.qualification}</p>}
                              {user?.city && <p className="text-xs text-gray-400">📍 {user.city}</p>}
                            </div>
                          </td>
                          <td className="p-3 text-gray-700 font-medium">{p.work_type}</td>
                          <td className="p-3 font-bold text-green-600">₹{p.reward_amount || 0}</td>
                          <td className="p-3">
                            <Badge className={p.status === 'approved' ? 'bg-green-600' : p.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'}>{p.status}</Badge>
                          </td>
                          <td className="p-3" style={{ minWidth: '180px', maxWidth: '260px' }}>
                            {p.status === 'rejected' && p.rejection_reason ? (() => {
                              const urlRegex = /(https?:\/\/[^\s]+)/g;
                              const match = p.rejection_reason.match(urlRegex);
                              const link = match ? match[0] : null;
                              const cleanText = p.rejection_reason.replace(urlRegex, '').trim();
                              return (
                                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs whitespace-normal break-words">
                                  <p>{cleanText}</p>
                                  {link && <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline mt-1 inline-block">View Report</a>}
                                </div>
                              );
                            })() : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="p-3" style={{minWidth:'160px'}}>
                            <div className="flex flex-col gap-1">
                              {p.performance_summary && (
                                <button onClick={() => { setViewingPerf(p); setPerfSummaryDialog(true); }}
                                  className="px-2 py-1.5 text-xs bg-amber-50 border border-amber-300 text-amber-700 rounded hover:bg-amber-100 flex items-center gap-1 whitespace-nowrap">
                                  <BarChart3 className="w-3 h-3 flex-shrink-0" />Perf. Summary
                                </button>
                              )}
                              {p.file_url && (
                                <a href={p.file_url} target="_blank" rel="noopener noreferrer"
                                  className="px-2 py-1.5 text-xs bg-blue-50 border border-blue-300 text-blue-700 rounded hover:bg-blue-100 flex items-center gap-1 whitespace-nowrap">
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />View Submission
                                </a>
                              )}
                              {!p.performance_summary && !p.file_url && <span className="text-gray-400 text-xs">—</span>}
                            </div>
                          </td>
                          <td className="p-3 text-xs text-gray-500">{new Date(p.submitted_date || p.created_date).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-gray-500"><BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No task submissions found</p></div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════ LIVE ACTIVITY TAB ════════════════════════════ */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-base flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Live Activity — My Users
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">Real-time tracking • Auto-refreshes every 3s</p>
                  </div>
                  <span className="text-slate-400 text-xs">{lastActivityRefresh.toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="bg-white px-5 py-3 border-t border-gray-100">
                <input
                  placeholder="Search by user name..."
                  value={activitySearch}
                  onChange={e => setActivitySearch(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Active Now', value: liveActivities.filter(a => {
                    const lastSeen = a.behavior_data?.last_activity || a.start_time;
                    return lastSeen && (Date.now() - new Date(lastSeen).getTime()) / 60000 < 30;
                  }).length, bg: 'bg-green-50 border-green-200', text: 'text-green-700', dot: true },
                { label: 'Completed Today', value: activityHistory.filter(a => a.status === 'COMPLETED' && new Date(a.end_time).toDateString() === new Date().toDateString()).length, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                { label: 'Abandoned Today', value: activityHistory.filter(a => a.status === 'ABANDONED' && new Date(a.end_time).toDateString() === new Date().toDateString()).length, bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
                { label: 'Total History', value: activityHistory.length, bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
              ].map(({ label, value, bg, text, dot }) => (
                <div key={label} className={`rounded-2xl border-2 p-4 text-center ${bg}`}>
                  <div className="flex items-center justify-center gap-1.5">
                    {dot && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                    <p className={`text-3xl font-black ${text}`}>{value}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>

            {/* Currently Working */}
            <div className="rounded-2xl border-2 border-green-300 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-white" />
                <p className="text-white font-bold text-sm">Currently Working</p>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {liveActivities.filter(a => {
                    if (activitySearch && !a.user_name?.toLowerCase().includes(activitySearch.toLowerCase())) return false;
                    const lastSeen = a.behavior_data?.last_activity || a.start_time;
                    return lastSeen && (Date.now() - new Date(lastSeen).getTime()) / 60000 < 30;
                  }).length} active
                </span>
              </div>

              <div className="bg-white p-3 space-y-3">
                {(() => {
                  const filtered = liveActivities.filter(a =>
                    !activitySearch || a.user_name?.toLowerCase().includes(activitySearch.toLowerCase())
                  );
                  const isStaleItem = (a) => {
                    const lastSeen = a.behavior_data?.last_activity || a.start_time;
                    return !lastSeen || (Date.now() - new Date(lastSeen).getTime()) / 60000 >= 30;
                  };
                  const active = filtered.filter(a => !isStaleItem(a));
                  const stale = filtered.filter(a => isStaleItem(a));
                  const avatarPalette = [
                    { bg: '#E6F1FB', color: '#0C447C' }, { bg: '#EAF3DE', color: '#27500A' },
                    { bg: '#EEEDFE', color: '#3C3489' }, { bg: '#E1F5EE', color: '#085041' },
                    { bg: '#FAEEDA', color: '#633806' }, { bg: '#FBEAF0', color: '#72243E' },
                  ];
                  const getInitials = (name) => (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const getAvatar = (name) => avatarPalette[(name || '').charCodeAt(0) % avatarPalette.length];

                  const renderLiveCard = (activity, staleFlag) => {
                    const elapsedSec = Math.floor((nowTick - new Date(activity.start_time).getTime()) / 1000);
                    const b = activity.behavior_data || {};
                    const totalTyped = b.total_typed_chars || 0;
                    const totalPasted = b.total_pasted_chars || 0;
                    const pasteRatio = (totalTyped + totalPasted) > 0 ? Math.round((totalPasted / (totalTyped + totalPasted)) * 100) : 0;
                    const tabCount = b.tab_switch_count || 0;
                    const wpm = b.wpm || 0;
                    const hasFlags = pasteRatio > 50 || tabCount > 10 || wpm > 120;
                    const av = getAvatar(activity.user_name);
                    const lastSeenStr = b.last_activity ? timeSinceStr(b.last_activity) : 'N/A';

                    return (
                      <div key={activity.id} className={`p-4 rounded-2xl border-2 ${staleFlag ? 'border-gray-200 bg-gray-50 opacity-70' : hasFlags ? 'border-yellow-300 bg-yellow-50' : 'border-green-200 bg-white'}`}>
                        <div className="flex items-center gap-3">
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                            {getInitials(activity.user_name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-900 text-sm truncate">{activity.user_name}</p>
                              {staleFlag
                                ? <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">Inactive</span>
                                : <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium animate-pulse">● Live</span>}
                              {hasFlags && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 font-medium">⚠ Flagged</span>}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {activity.task_name} • {staleFlag ? `Last seen ${lastSeenStr}` : `Active ${fmtDur(elapsedSec)}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => setViewingLiveActivity(activity)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-50 transition-colors">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button onClick={() => setDeleteConfirm({ item: activity, type: 'live' })}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {[
                            { icon: '⌨️', label: 'Typed', value: totalTyped },
                            { icon: '📋', label: 'Pasted', value: totalPasted },
                            { icon: '🔄', label: 'Tabs', value: tabCount, alert: tabCount > 10 },
                            { icon: '⚡', label: 'WPM', value: wpm, alert: wpm > 120 },
                            { icon: '⏸️', label: 'Idle', value: b.idle_time_seconds ? Math.floor(b.idle_time_seconds / 60) + 'm' : '0m' },
                          ].map(({ icon, label, value, alert }) => (
                            <div key={label} className={`text-center p-2 rounded-xl ${alert ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-100'}`}>
                              <p className="text-sm">{icon}</p>
                              <p className={`text-sm font-bold ${alert ? 'text-red-700' : 'text-gray-800'}`}>{value}</p>
                              <p className="text-xs text-gray-400">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  };

                  if (filtered.length === 0) return <p className="text-center text-gray-400 py-8 text-sm">No users found</p>;

                  return (
                    <>
                      {active.map(a => renderLiveCard(a, false))}
                      {stale.length > 0 && (
                        <>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="flex-1 h-px bg-gray-200" />
                            <p className="text-xs text-gray-400 font-medium">Inactive / Stale Sessions</p>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                          {stale.map(a => renderLiveCard(a, true))}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Activity History */}
            <div className="rounded-2xl border-2 border-indigo-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                <p className="text-white font-bold text-sm">Completed Tasks History</p>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {activityHistory.filter(a => !activitySearch || a.user_name?.toLowerCase().includes(activitySearch.toLowerCase())).length} records
                </span>
              </div>
              <div className="bg-white p-3 space-y-3">
                {(() => {
                  const filtered = activityHistory.filter(a =>
                    !activitySearch || a.user_name?.toLowerCase().includes(activitySearch.toLowerCase())
                  );
                  if (filtered.length === 0) return (
                    <div className="text-center py-10">
                      <Activity className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      <p className="text-gray-400 text-sm">No history found</p>
                    </div>
                  );
                  const avatarPalette = [
                    { bg: '#E6F1FB', color: '#0C447C' }, { bg: '#EAF3DE', color: '#27500A' },
                    { bg: '#EEEDFE', color: '#3C3489' }, { bg: '#E1F5EE', color: '#085041' },
                    { bg: '#FAEEDA', color: '#633806' }, { bg: '#FBEAF0', color: '#72243E' },
                  ];
                  const getInitials = (name) => (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const getAvatar = (name) => avatarPalette[(name || '').charCodeAt(0) % avatarPalette.length];

                  return filtered.map(history => {
                    const b = history.behavior_data || {};
                    const totalTyped = b.total_typed_chars || 0;
                    const totalPasted = b.total_pasted_chars || 0;
                    const pasteRatio = (totalTyped + totalPasted) > 0 ? Math.round((totalPasted / (totalTyped + totalPasted)) * 100) : 0;
                    const tabCount = b.tab_switch_count || 0;
                    const wpm = b.wpm || 0;
                    const hasFlags = pasteRatio > 50 || tabCount > 10 || wpm > 120;
                    const isCompleted = history.status === 'COMPLETED';
                    const av = getAvatar(history.user_name);

                    return (
                      <div key={history.id} className={`p-4 rounded-2xl border-2 ${hasFlags ? 'border-yellow-300 bg-yellow-50' : isCompleted ? 'border-green-200 bg-white' : 'border-red-200 bg-white'}`}>
                        <div className="flex items-center gap-3">
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                            {getInitials(history.user_name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-900 text-sm truncate">{history.user_name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {history.status}
                              </span>
                              {hasFlags && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 font-medium">⚠ Flagged</span>}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {history.task_name} • Duration: {fmtDur(history.total_duration)} • {timeSinceStr(history.end_time)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => setViewingHistoryActivity(history)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-50 transition-colors">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button onClick={() => setDeleteConfirm({ item: history, type: 'history' })}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {[
                            { icon: '⌨️', label: 'Typed', value: totalTyped },
                            { icon: '📋', label: 'Pasted', value: totalPasted },
                            { icon: '🔄', label: 'Tabs', value: tabCount, alert: tabCount > 10 },
                            { icon: '⚡', label: 'WPM', value: wpm, alert: wpm > 120 },
                            { icon: '💾', label: 'Items', value: b.items_saved || b.entries_completed || 0 },
                          ].map(({ icon, label, value, alert }) => (
                            <div key={label} className={`text-center p-2 rounded-xl ${alert ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-100'}`}>
                              <p className="text-sm">{icon}</p>
                              <p className={`text-sm font-bold ${alert ? 'text-red-700' : 'text-gray-800'}`}>{value}</p>
                              <p className="text-xs text-gray-400">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* ── View Live Detail Dialog ── */}
            {viewingLiveActivity && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                    {(() => {
                      const av = [{ bg:'#E6F1FB',color:'#0C447C'},{bg:'#EAF3DE',color:'#27500A'},{bg:'#EEEDFE',color:'#3C3489'},{bg:'#E1F5EE',color:'#085041'},{bg:'#FAEEDA',color:'#633806'},{bg:'#FBEAF0',color:'#72243E'}][(viewingLiveActivity.user_name||'').charCodeAt(0)%6];
                      return <div style={{width:40,height:40,borderRadius:'50%',background:av.bg,color:av.color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,flexShrink:0}}>{(viewingLiveActivity.user_name||'?').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}</div>;
                    })()}
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{viewingLiveActivity.user_name}</p>
                      <p className="text-xs text-gray-500">Live Activity Details</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium animate-pulse">● Live</span>
                    <button onClick={() => setViewingLiveActivity(null)} className="ml-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Task', value: viewingLiveActivity.task_name || 'N/A', bg: 'bg-gray-50' },
                        { label: 'Active Time', value: fmtDur(Math.floor((nowTick - new Date(viewingLiveActivity.start_time).getTime()) / 1000)), bg: 'bg-blue-50' },
                        { label: 'Last Seen', value: viewingLiveActivity.behavior_data?.last_activity ? timeSinceStr(viewingLiveActivity.behavior_data.last_activity) : 'N/A', bg: 'bg-purple-50' },
                      ].map(({ label, value, bg }) => (
                        <div key={label} className={`p-3 rounded-xl border text-center ${bg}`}>
                          <p className="text-xs text-gray-500 mb-1">{label}</p>
                          <p className="text-xs font-semibold text-gray-800 truncate">{value}</p>
                        </div>
                      ))}
                    </div>
                    {(() => {
                      const b = viewingLiveActivity.behavior_data || {};
                      const t = b.total_typed_chars || 0, p = b.total_pasted_chars || 0;
                      const pr = (t+p)>0?Math.round((p/(t+p))*100):0;
                      const flags = [];
                      if ((b.tab_switch_count||0)>10) flags.push({level:'high',msg:`Excessive tab switching (${b.tab_switch_count})`});
                      else if ((b.tab_switch_count||0)>5) flags.push({level:'med',msg:`Frequent tab switching (${b.tab_switch_count})`});
                      if (pr>50&&p>50) flags.push({level:'high',msg:`High paste ratio: ${pr}%`});
                      if ((b.paste_event_count||0)>5) flags.push({level:'med',msg:`Multiple paste events: ${b.paste_event_count}`});
                      if ((b.wpm||0)>120) flags.push({level:'high',msg:`Unrealistic typing speed: ${b.wpm} WPM`});
                      if ((b.backspace_count||0)===0&&t>200) flags.push({level:'med',msg:'No backspace usage — possible copy-paste'});
                      if ((b.screen_hidden_events||0)>5) flags.push({level:'high',msg:`Screen hidden events: ${b.screen_hidden_events}`});
                      if (flags.length===0) return null;
                      return (
                        <div className="p-3 rounded-xl border-2 border-red-200 bg-red-50">
                          <p className="text-xs font-bold text-red-800 flex items-center gap-1 mb-2"><AlertTriangle className="w-3.5 h-3.5" /> Suspicious Activity</p>
                          {flags.map((f,i)=><p key={i} className={`text-xs ${f.level==='high'?'text-red-700':'text-orange-600'}`}>{f.level==='high'?'🚨':'⚠️'} {f.msg}</p>)}
                        </div>
                      );
                    })()}
                    {(() => {
                      const b = viewingLiveActivity.behavior_data || {};
                      const totalTyped = b.total_typed_chars||0, totalPasted = b.total_pasted_chars||0;
                      const typingRatio = (totalTyped+totalPasted)>0?Math.round((totalTyped/(totalTyped+totalPasted))*100):null;
                      return (
                        <div className="p-4 rounded-xl border bg-cyan-50">
                          <p className="text-xs font-bold text-cyan-800 mb-3">Typing Analysis</p>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            {[{label:'Typed',value:totalTyped},{label:'Pasted',value:totalPasted},{label:'WPM',value:b.wpm||0}].map(({label,value})=>(
                              <div key={label} className="text-center"><p className="text-xl font-black text-cyan-700">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
                            ))}
                          </div>
                          {typingRatio!==null&&(
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Typed {typingRatio}%</span><span>Pasted {100-typingRatio}%</span></div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${typingRatio<50?'bg-red-500':typingRatio<70?'bg-yellow-400':'bg-green-500'}`} style={{width:`${typingRatio}%`}}/></div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {(() => {
                      const b = viewingLiveActivity.behavior_data || {};
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-xl border bg-indigo-50">
                            <p className="text-xs font-bold text-indigo-800 mb-3">Tab & Focus</p>
                            <div className="grid grid-cols-2 gap-2">
                              {[{label:'Tab Switches',value:b.tab_switch_count||0},{label:'Paste Events',value:b.paste_event_count||0},{label:'Backspaces',value:b.backspace_count||0},{label:'Idle',value:b.idle_time_seconds?Math.floor(b.idle_time_seconds/60)+'m':'0m'}].map(({label,value})=>(
                                <div key={label} className="text-center"><p className="text-lg font-black text-indigo-700">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl border bg-gray-50">
                            <p className="text-xs font-bold text-gray-700 mb-3">Screen Behavior</p>
                            <div className="grid grid-cols-2 gap-2">
                              {[{label:'Min Count',value:b.window_minimized_count||0},{label:'Min Duration',value:(b.window_minimized_seconds||0)+'s'},{label:'Hidden Events',value:b.screen_hidden_events||0},{label:'Last Paste Len',value:b.paste_event_last_length||b.last_paste_length||0}].map(({label,value})=>(
                                <div key={label} className="text-center"><p className="text-lg font-black text-gray-700">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="p-3 rounded-xl border bg-gray-50 text-xs text-gray-500">
                      <p>Session: <span className="font-mono text-gray-700">{viewingLiveActivity.session_id}</span></p>
                      <p>Started: {viewingLiveActivity.start_time ? new Date(viewingLiveActivity.start_time).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── View History Detail Dialog ── */}
            {viewingHistoryActivity && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                    {(() => {
                      const av = [{ bg:'#E6F1FB',color:'#0C447C'},{bg:'#EAF3DE',color:'#27500A'},{bg:'#EEEDFE',color:'#3C3489'},{bg:'#E1F5EE',color:'#085041'},{bg:'#FAEEDA',color:'#633806'},{bg:'#FBEAF0',color:'#72243E'}][(viewingHistoryActivity.user_name||'').charCodeAt(0)%6];
                      return <div style={{width:40,height:40,borderRadius:'50%',background:av.bg,color:av.color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,flexShrink:0}}>{(viewingHistoryActivity.user_name||'?').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}</div>;
                    })()}
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{viewingHistoryActivity.user_name}</p>
                      <p className="text-xs text-gray-500">Completed Task Details</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${viewingHistoryActivity.status==='COMPLETED'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{viewingHistoryActivity.status}</span>
                    <button onClick={() => setViewingHistoryActivity(null)} className="ml-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label:'Task', value: viewingHistoryActivity.task_name||'N/A', bg:'bg-gray-50' },
                        { label:'Start', value: viewingHistoryActivity.start_time?new Date(viewingHistoryActivity.start_time).toLocaleTimeString():'N/A', bg:'bg-blue-50' },
                        { label:'End', value: viewingHistoryActivity.end_time?new Date(viewingHistoryActivity.end_time).toLocaleTimeString():'N/A', bg:'bg-purple-50' },
                        { label:'Duration', value: fmtDur(viewingHistoryActivity.total_duration), bg:'bg-green-50' },
                      ].map(({label,value,bg})=>(
                        <div key={label} className={`p-3 rounded-xl border text-center ${bg}`}>
                          <p className="text-xs text-gray-500 mb-1">{label}</p>
                          <p className="text-xs font-semibold text-gray-800 truncate">{value}</p>
                        </div>
                      ))}
                    </div>
                    {(() => {
                      const b = viewingHistoryActivity.behavior_data || {};
                      const t = b.total_typed_chars||0, p = b.total_pasted_chars||0;
                      const pr = (t+p)>0?Math.round((p/(t+p))*100):0;
                      const flags = [];
                      if ((b.tab_switch_count||0)>10) flags.push({level:'high',msg:`Excessive tab switching (${b.tab_switch_count})`});
                      if (pr>50&&p>50) flags.push({level:'high',msg:`High paste ratio: ${pr}%`});
                      if ((b.wpm||0)>120) flags.push({level:'high',msg:`Unrealistic typing speed: ${b.wpm} WPM`});
                      if ((b.backspace_count||0)===0&&t>200) flags.push({level:'med',msg:'No backspace usage'});
                      if (flags.length===0) return null;
                      return (
                        <div className="p-3 rounded-xl border-2 border-red-200 bg-red-50">
                          <p className="text-xs font-bold text-red-800 flex items-center gap-1 mb-2"><AlertTriangle className="w-3.5 h-3.5" /> Suspicious Activity</p>
                          {flags.map((f,i)=><p key={i} className={`text-xs ${f.level==='high'?'text-red-700':'text-orange-600'}`}>{f.level==='high'?'🚨':'⚠️'} {f.msg}</p>)}
                        </div>
                      );
                    })()}
                    {(() => {
                      const b = viewingHistoryActivity.behavior_data || {};
                      const totalTyped = b.total_typed_chars||0, totalPasted = b.total_pasted_chars||0;
                      const typingRatio = (totalTyped+totalPasted)>0?Math.round((totalTyped/(totalTyped+totalPasted))*100):null;
                      return (
                        <div className="p-4 rounded-xl border bg-cyan-50">
                          <p className="text-xs font-bold text-cyan-800 mb-3">Typing Analysis</p>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            {[{label:'Typed',value:totalTyped},{label:'Pasted',value:totalPasted},{label:'WPM',value:b.wpm||0}].map(({label,value})=>(
                              <div key={label} className="text-center"><p className="text-xl font-black text-cyan-700">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
                            ))}
                          </div>
                          {typingRatio!==null&&(
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Typed {typingRatio}%</span><span>Pasted {100-typingRatio}%</span></div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${typingRatio<50?'bg-red-500':typingRatio<70?'bg-yellow-400':'bg-green-500'}`} style={{width:`${typingRatio}%`}}/></div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {(() => {
                      const b = viewingHistoryActivity.behavior_data || {};
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-xl border bg-indigo-50">
                            <p className="text-xs font-bold text-indigo-800 mb-3">Tab & Focus</p>
                            <div className="grid grid-cols-2 gap-2">
                              {[{label:'Tab Switches',value:b.tab_switch_count||0},{label:'Paste Events',value:b.paste_event_count||0},{label:'Backspaces',value:b.backspace_count||0},{label:'Idle',value:b.idle_time_seconds?Math.floor(b.idle_time_seconds/60)+'m':'0m'}].map(({label,value})=>(
                                <div key={label} className="text-center"><p className="text-lg font-black text-indigo-700">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl border bg-gray-50">
                            <p className="text-xs font-bold text-gray-700 mb-3">Screen & Items</p>
                            <div className="grid grid-cols-2 gap-2">
                              {[{label:'Min Duration',value:(b.window_minimized_seconds||0)+'s'},{label:'Hidden Events',value:b.screen_hidden_events||0},{label:'Active Time',value:fmtDur(b.active_seconds)},{label:'Items Saved',value:b.items_saved||b.entries_completed||0}].map(({label,value})=>(
                                <div key={label} className="text-center"><p className="text-lg font-black text-gray-700">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="p-3 rounded-xl border bg-gray-50 text-xs text-gray-500">
                      <p>Session: <span className="font-mono text-gray-700">{viewingHistoryActivity.session_id}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <p className="font-bold text-gray-900 text-base">Delete Activity</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Are you sure you want to remove <span className="font-bold text-gray-900">{deleteConfirm.item?.user_name}</span>'s {deleteConfirm.type === 'live' ? 'live session' : 'history record'} from the tracker?
                  </p>
                  <p className="text-xs text-gray-400 mb-5">User account will not be affected.</p>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
                    <button
                      onClick={async () => {
                        try {
                          if (deleteConfirm.type === 'live') {
                            await base44.entities.LiveActivity.delete(deleteConfirm.item.id);
                            setLiveActivities(prev => prev.filter(a => a.id !== deleteConfirm.item.id));
                          } else {
                            await base44.entities.ActivityHistory.delete(deleteConfirm.item.id);
                            setActivityHistory(prev => prev.filter(a => a.id !== deleteConfirm.item.id));
                          }
                        } catch(e) { console.error('Delete error:', e); }
                        setDeleteConfirm(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════ DEVICE TRACKING TAB ════════════════════════════ */}
        {activeTab === 'devices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="p-4 text-center"><Monitor className="w-8 h-8 mx-auto mb-1" /><p className="text-3xl font-bold">{assignedUsers.filter(u => isReallyOnline(u)).length}</p><p className="text-xs font-semibold">🟢 Online Users</p></CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                <CardContent className="p-4 text-center"><Smartphone className="w-8 h-8 mx-auto mb-1" /><p className="text-3xl font-bold">{assignedUsers.filter(u => !isReallyOnline(u)).length}</p><p className="text-xs font-semibold">⚫ Offline Users</p></CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4 text-center"><Shield className="w-8 h-8 mx-auto mb-1" /><p className="text-3xl font-bold">{assignedUsers.length}</p><p className="text-xs">Total Users</p></CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
                <CardContent className="p-4 text-center"><LogOut className="w-8 h-8 mx-auto mb-1" /><p className="text-3xl font-bold">{assignedUsers.filter(u => !u.is_logged_in).length}</p><p className="text-xs">Logged Out</p></CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />All My Users — Login Status</CardTitle>
                  <Button size="sm" onClick={() => loadData(recruiter)} className="bg-white/20 hover:bg-white/30">
                    <RefreshCw className="w-4 h-4 mr-1" />Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pb-0 space-y-3">
                <Input placeholder="Search by user name, phone, email..." value={deviceSearch} onChange={e => setDeviceSearch(e.target.value)} className="max-w-md" />

                {/* ✅ NEW: Offline duration filter */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-semibold text-gray-700">📵 Offline Filter:</span>
                  {[
                    { val: 'all', label: 'All Users' },
                    { val: '1d', label: 'Offline 1 Day' },
                    { val: '2d', label: 'Offline 2 Days' },
                    { val: '3d', label: 'Offline 3 Days' },
                    { val: '7d', label: 'Offline 7 Days' },
                    { val: '15d', label: 'Offline 15 Days' },
                    { val: '30d', label: 'Offline 30+ Days' },
                  ].map(({ val, label }) => (
                    <Button
                      key={val}
                      size="sm"
                      variant={deviceOfflineFilter === val ? "default" : "outline"}
                      className={`h-7 text-xs ${deviceOfflineFilter === val ? 'bg-red-600 hover:bg-red-700' : ''}`}
                      onClick={() => setDeviceOfflineFilter(val)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                {deviceOfflineFilter !== 'all' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-semibold">
                      📵 Showing users offline for {deviceOfflineFilter === '1d' ? '1 day' : deviceOfflineFilter === '2d' ? '2 days' : deviceOfflineFilter === '3d' ? '3 days' : deviceOfflineFilter === '7d' ? '7 days' : deviceOfflineFilter === '15d' ? '15 days' : '30+ days'} — 
                      {' '}{assignedUsers.filter(u => {
                        if (!filterByOfflineDuration(u)) return false;
                        if (deviceSearch.trim()) {
                          const s = deviceSearch.toLowerCase();
                          return u.full_name?.toLowerCase().includes(s) || u.phone?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.login_user_id?.toLowerCase().includes(s);
                        }
                        return true;
                      }).length} users found
                    </p>
                  </div>
                )}
              </CardContent>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">User</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Login ID</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Contact</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Device</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Last Active</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assignedUsers
                      .filter(u => {
                        if (!filterByOfflineDuration(u)) return false;
                        if (!deviceSearch.trim()) return true;
                        const s = deviceSearch.toLowerCase();
                        return (u.full_name?.toLowerCase().includes(s) || u.phone?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.login_user_id?.toLowerCase().includes(s));
                      })
                      .sort((a, b) => (isReallyOnline(b) ? 1 : 0) - (isReallyOnline(a) ? 1 : 0))
                      .map(user => {
                        const online = isReallyOnline(user);
                      
                        return (
                          <tr key={user.id} className={online ? 'bg-green-50' : ''}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                <div>
                                  <p className="font-semibold text-sm">{user.full_name}</p>
                                  <p className="text-xs text-gray-500">{user.city || '—'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="font-mono text-blue-700 text-sm">{user.login_user_id}</p>
                              <p className="font-mono text-xs text-gray-500">{user.login_password}</p>
                            </td>
                            <td className="p-3 text-xs"><p>{user.phone || '—'}</p><p className="text-gray-500">{user.email || '—'}</p></td>
                            <td className="p-3">
                              <Badge className={online ? 'bg-green-600' : 'bg-gray-400'}>
                               {online ? '🟢 Online' : '⚫ Offline'}
                              </Badge>
                              
                            </td>
                            <td className="p-3">
                              {user.device_name || user.device_type || user.browser ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-medium text-gray-700">{getDeviceIcon(user.device_type)} {user.device_name || user.device_type || 'Unknown'}</span>
                                  {user.browser && <span className="text-xs text-gray-400">{user.browser}</span>}
                                  {user.os && <span className="text-xs text-gray-400">{user.os}</span>}
                                  {user.ip_address && <span className="text-xs text-gray-400">IP: {user.ip_address}</span>}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-gray-400">
                                  {user.session_id ? (<><Smartphone className="w-3 h-3 text-green-600" /><span className="text-xs font-mono">{user.session_id.substring(0, 10)}...</span></>) : (<span className="text-xs">No session</span>)}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-xs text-gray-600">
                              <p className="font-semibold">{getTimeSince(user.last_heartbeat || user.last_active)}</p>
                              <p className="text-gray-400">
                                {user.last_heartbeat ? new Date(user.last_heartbeat).toLocaleString() : user.last_active ? new Date(user.last_active).toLocaleString() : 'Never'}
                              </p>
                            </td>
                            <td className="p-3">
                              {user.is_logged_in && (
                                <Button size="sm" variant="destructive" onClick={() => handleForceLogout(user)} disabled={forceLogoutLoading === user.id} className="h-7 text-xs">
                                  <LogOut className="w-3 h-3 mr-1" />
                                  {forceLogoutLoading === user.id ? 'Logging out...' : 'Force Logout'}
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {assignedUsers.length === 0 && (
                  <div className="text-center py-12 text-gray-500"><Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No users created yet</p></div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ════════════════════════════ PERFORMANCE TAB ════════════════════════════ */}
        {activeTab === 'performance' && (() => {
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4 text-center"><p className="text-3xl font-bold">{proofs.length}</p><p className="text-xs">Total Submissions</p></CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <CardContent className="p-4 text-center"><p className="text-3xl font-bold">{approvedAll.length}</p><p className="text-xs">Total Approved</p></CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
                  <CardContent className="p-4 text-center"><p className="text-3xl font-bold">{rejectedAll.length}</p><p className="text-xs">Total Rejected</p></CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <CardContent className="p-4 text-center"><p className="text-3xl font-bold">{overallApprovalRate}%</p><p className="text-xs">Approval Rate</p></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <CardTitle className="text-base">📊 Task Popularity Trends</CardTitle>
                  <p className="text-indigo-200 text-sm">Most submitted: <strong>{topTask}</strong></p>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {sortedTasks.map(([taskName, count]) => {
                    const pct = proofs.length > 0 ? Math.round((count / proofs.length) * 100) : 0;
                    const approved = proofs.filter(p => p.work_type === taskName && p.status === 'approved').length;
                    return (
                      <div key={taskName}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-semibold text-gray-800">{taskName}</span>
                          <span className="text-gray-500">{count} submissions ({pct}%) • ✅ {approved} approved</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                  {sortedTasks.length === 0 && <p className="text-gray-500 text-center py-4">No submissions yet</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                  <CardTitle className="text-base">👤 User-wise Performance</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <input placeholder="Search by name, phone, email..." value={perfSearchQuery} onChange={e => setPerfSearchQuery(e.target.value)}
                      className="flex-1 min-w-[200px] px-3 py-1.5 rounded-md bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm" />
                    <input type="month" value={perfMonthFilter} onChange={e => setPerfMonthFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-md bg-white/20 border border-white/30 text-white text-sm" />
                    <button onClick={() => setPerfMonthFilter('')} className="px-3 py-1.5 rounded-md bg-white/20 border border-white/30 text-white text-xs hover:bg-white/30">All Time</button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 font-semibold text-gray-700">User Details</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Tag</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Total</th>
                        <th className="text-center p-3 font-semibold text-green-700">Approved</th>
                        <th className="text-center p-3 font-semibold text-red-600">Rejected</th>
                        <th className="text-center p-3 font-semibold text-yellow-600">Pending</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Rate</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Top Task</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {assignedUsers
                        .filter(u => {
                          if (!perfSearchQuery.trim()) return true;
                          const s = perfSearchQuery.toLowerCase();
                          return u.full_name?.toLowerCase().includes(s) || u.phone?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.login_user_id?.toLowerCase().includes(s);
                        })
                        .map(u => {
                          let up = proofs.filter(p => String(p.user_id) === String(u.id));
                          if (perfMonthFilter) {
                            const [yr, mo] = perfMonthFilter.split('-').map(Number);
                            const start = new Date(yr, mo-1, 1), end = new Date(yr, mo, 0, 23, 59, 59);
                            up = up.filter(p => { const d = new Date(p.submitted_date || p.created_date); return d >= start && d <= end; });
                          }
                          const ua = up.filter(p => p.status === 'approved').length;
                          const ur = up.filter(p => p.status === 'rejected').length;
                          const upend = up.filter(p => p.status === 'pending').length;
                          const rate = up.length > 0 ? Math.round((ua / up.length) * 100) : 0;
                          const uTaskCounts = {};
                          up.forEach(p => { uTaskCounts[p.work_type] = (uTaskCounts[p.work_type] || 0) + 1; });
                          const uTopTask = Object.entries(uTaskCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
                          return (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="p-3">
                                <div>
                                  <p className="font-semibold text-gray-900">{u.full_name}</p>
                                  {u.phone && <p className="text-xs text-gray-600">📱 {u.phone}</p>}
                                  {u.email && <p className="text-xs text-gray-500">✉️ {u.email}</p>}
                                </div>
                              </td>
                              <td className="p-3">{(() => { const tag = getUserTag(u.id); return <span className={`text-xs font-bold text-white px-2 py-1 rounded-full ${tag.color}`}>{tag.label}</span>; })()}</td>
                              <td className="p-3 text-center font-bold text-blue-600">{up.length}</td>
                              <td className="p-3 text-center font-bold text-green-600">{ua}</td>
                              <td className="p-3 text-center font-bold text-red-500">{ur}</td>
                              <td className="p-3 text-center font-bold text-yellow-600">{upend}</td>
                              <td className="p-3 text-center">
                                <span className={`font-bold ${rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>{rate}%</span>
                              </td>
                              <td className="p-3 text-xs text-gray-600">{uTopTask}</td>
                              <td className="p-3 text-center">
                                <button onClick={() => { setReportUser({ user: u, userProofs: proofs.filter(p => String(p.user_id) === String(u.id)) }); setReportDialog(true); }}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold">
                                  View Report
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {assignedUsers.length === 0 && <p className="text-center text-gray-500 py-8">No users yet</p>}
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* ════════════════════════════ ANALYTICS TAB ════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow">
              <div className="bg-gradient-to-r from-slate-700 to-gray-800 px-5 py-4">
                <p className="text-white font-bold text-lg">🔬 Analytics Dashboard</p>
                <p className="text-gray-400 text-xs mt-0.5">Complete insights — funnel, charts, trends & drop analysis</p>
              </div>
              <div className="px-5 pt-4 pb-0 flex gap-2 flex-wrap">
                {[
                  { key: 'funnel', label: '📉 Funnel & KPIs' },
                  { key: 'charts', label: '📊 Charts & Trends' },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setAnalyticsTab(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${analyticsTab === key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {analyticsTab === 'funnel' ? <AnalyticsFunnel /> : <AnalyticsCharts />}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════ REFERRAL PARTNERS TAB ════════════════════════════ */}
        {activeTab === 'referralpartners' && (
          <Card className="shadow-xl mb-6">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2">🤝 Referral Partner Applications ({referralPartners.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {referralPartners.length === 0 ? (
                <div className="text-center py-12 text-gray-500"><p className="text-lg">No referral partner applications from your users yet</p></div>
              ) : (
                referralPartners.map(partner => {
                  const user = assignedUsers.find(u => String(u.id) === String(partner.user_id));
                  return (
                    <div key={partner.id} className={`p-4 rounded-xl border-2 ${partner.status === 'approved' ? 'bg-green-50 border-green-300' : partner.status === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-gray-900">{partner.full_name}</p>
                          <p className="text-sm text-gray-600">📱 {partner.phone} • ✉️ {partner.email || '—'}</p>
                          {partner.city && <p className="text-xs text-gray-500">📍 {partner.city}</p>}
                          {user && <p className="text-xs text-blue-600 mt-1">User: {user.login_user_id}</p>}
                          <p className="text-xs text-gray-400 mt-1">Applied: {new Date(partner.created_date).toLocaleDateString()}</p>
                        </div>
                        <Badge className={partner.status === 'approved' ? 'bg-green-600' : partner.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'}>
                          {partner.status === 'approved' ? '✓ Approved' : partner.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════ PROFILE TAB ════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/40 text-4xl font-black">
                  {recruiter?.name?.[0]?.toUpperCase() || 'R'}
                </div>
                <h2 className="text-2xl font-black mb-1">{recruiter?.name}</h2>
                <p className="text-indigo-200 text-sm">Recruiter</p>
                <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <span className="text-sm font-bold font-mono">{recruiter?.recruiter_code}</span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-lg">📱</div>
                    <div><p className="text-xs text-gray-500">Mobile Number</p><p className="text-base font-bold text-green-800">{recruiter?.mobile || '—'}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-lg">✉️</div>
                    <div><p className="text-xs text-gray-500">Email Address</p><p className="text-base font-bold text-blue-800 break-all">{recruiter?.email || '—'}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-lg">✅</div>
                    <div><p className="text-xs text-gray-500">Account Status</p><p className="text-base font-bold text-emerald-800 capitalize">{recruiter?.status || 'active'}</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: assignedUsers.length, color: 'from-blue-500 to-blue-600', icon: '👥' },
                { label: 'Subscribed', value: assignedUsers.filter(u => u.is_subscribed).length, color: 'from-green-500 to-emerald-600', icon: '✅' },
                { label: 'Approved Tasks', value: proofs.filter(p => p.status === 'approved').length, color: 'from-purple-500 to-pink-600', icon: '🏆' },
                { label: 'Approval Rate', value: proofs.length > 0 ? Math.round((proofs.filter(p=>p.status==='approved').length/proofs.length)*100)+'%' : '—', color: 'from-teal-500 to-cyan-600', icon: '📊' },
              ].map(({ label, value, color, icon }) => (
                <Card key={label} className={`bg-gradient-to-br ${color} text-white shadow-lg`}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl mb-1">{icon}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs opacity-90">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════ DIALOGS ════════════════════════════ */}

        {/* User Report Dialog */}
        <Dialog open={reportDialog} onOpenChange={setReportDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-600" />Detailed Report — {reportUser?.user?.full_name}</DialogTitle>
              {reportUser && (
                <div className="text-sm text-gray-600 space-y-0.5">
                  {reportUser.user.phone && <p>📱 {reportUser.user.phone}</p>}
                  {reportUser.user.email && <p>✉️ {reportUser.user.email}</p>}
                </div>
              )}
            </DialogHeader>
            {reportUser && (() => {
              const up = reportUser.userProofs;
              const dateMap = {};
              up.forEach(p => {
                const date = new Date(p.submitted_date || p.created_date).toLocaleDateString('en-IN');
                if (!dateMap[date]) dateMap[date] = { total: 0, approved: 0, rejected: 0, pending: 0, duration: 0 };
                dateMap[date].total++;
                dateMap[date][p.status]++;
                dateMap[date].duration += p.duration_seconds || 0;
              });
              const sortedDates = Object.entries(dateMap).sort((a, b) => new Date(b[0]) - new Date(a[0]));
              const activeDays = sortedDates.length;
              const allDatesRaw = up.map(p => new Date(p.submitted_date || p.created_date));
              const firstDate = allDatesRaw.length > 0 ? new Date(Math.min(...allDatesRaw)) : null;
              const lastDate = allDatesRaw.length > 0 ? new Date(Math.max(...allDatesRaw)) : null;
              const totalDays = firstDate && lastDate ? Math.ceil((lastDate - firstDate) / 86400000) + 1 : 0;
              const inactiveDays = Math.max(0, totalDays - activeDays);
              const totalSeconds = up.reduce((s, p) => s + Number(p.duration_seconds || 0), 0);
              const totalHours = (totalSeconds / 3600).toFixed(1);
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center"><p className="text-2xl font-bold text-green-700">{activeDays}</p><p className="text-xs text-gray-500">Active Days</p></div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center"><p className="text-2xl font-bold text-red-600">{inactiveDays}</p><p className="text-xs text-gray-500">Inactive Days</p></div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center"><p className="text-2xl font-bold text-blue-700">{totalHours}h</p><p className="text-xs text-gray-500">Total Active Hours</p></div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center"><p className="text-2xl font-bold text-purple-700">{up.length}</p><p className="text-xs text-gray-500">Total Tasks</p></div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 mb-2">📅 Date-wise Activity</p>
                    {sortedDates.length === 0 ? (
                      <p className="text-gray-500 text-center py-6">No submissions yet</p>
                    ) : (
                      <table className="w-full text-sm border rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-2 font-semibold text-gray-700">Date</th>
                            <th className="text-center p-2 font-semibold text-gray-700">Tasks</th>
                            <th className="text-center p-2 font-semibold text-green-700">✅ Approved</th>
                            <th className="text-center p-2 font-semibold text-red-600">❌ Rejected</th>
                            <th className="text-center p-2 font-semibold text-yellow-600">⏳ Pending</th>
                            <th className="text-center p-2 font-semibold text-blue-700">⏱ Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {sortedDates.map(([date, data]) => {
                            const hrs = Math.floor(data.duration / 3600), mins = Math.floor((data.duration % 3600) / 60);
                            const durStr = data.duration > 0 ? `${hrs > 0 ? hrs + 'h ' : ''}${mins}m` : '—';
                            return (
                              <tr key={date} className="hover:bg-gray-50">
                                <td className="p-2 font-medium text-gray-800">{date}</td>
                                <td className="p-2 text-center font-bold text-blue-600">{data.total}</td>
                                <td className="p-2 text-center font-bold text-green-600">{data.approved}</td>
                                <td className="p-2 text-center font-bold text-red-500">{data.rejected}</td>
                                <td className="p-2 text-center font-bold text-yellow-600">{data.pending}</td>
                                <td className="p-2 text-center text-gray-600">{durStr}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Performance Summary Dialog */}
        <Dialog open={perfSummaryDialog} onOpenChange={setPerfSummaryDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-amber-600" />Performance Summary</DialogTitle>
              {viewingPerf && <p className="text-sm text-gray-500">{viewingPerf.user_name} • {viewingPerf.work_type}</p>}
            </DialogHeader>
            {viewingPerf?.performance_summary ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-amber-900 mb-3">📊 Task Performance Analysis</p>
                  <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed bg-white rounded-lg p-4 border border-amber-200">{viewingPerf.performance_summary}</div>
                </div>
                {viewingPerf.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{viewingPerf.rejection_reason}</p>
                  </div>
                )}
              </div>
            ) : <p className="text-gray-500 text-center py-8">No performance summary</p>}
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={!!deleteConfirmUser} onOpenChange={() => setDeleteConfirmUser(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
            <p className="text-gray-700">Are you sure you want to delete <strong>{deleteConfirmUser?.full_name}</strong>? This cannot be undone.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmUser(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleDeleteUser(deleteConfirmUser)}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Recruiter Dialog */}
        <Dialog open={assignRecruiterDialog} onOpenChange={setAssignRecruiterDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>✏️ Edit Recruiter Name</DialogTitle></DialogHeader>
            <div className="p-3 bg-gray-50 rounded-lg mb-2">
              <p className="text-xs text-gray-500">User</p>
              <p className="font-bold text-gray-900">{assignRecruiterUser?.full_name}</p>
              <p className="text-xs text-gray-500 mt-1">Current Recruiter: <span className="font-semibold text-indigo-700">{assignRecruiterUser?.assigned_recruiter_name || '—'}</span></p>
            </div>
            <div className="space-y-2">
              <Label>New Recruiter Name</Label>
              <Input value={assignRecruiterName} onChange={e => setAssignRecruiterName(e.target.value)} placeholder="Enter recruiter name" autoFocus />
              <p className="text-xs text-gray-400">This name will appear under the user's recruiter column.</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setAssignRecruiterDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleAssignRecruiter}>✅ Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-600" />Create New User</DialogTitle></DialogHeader>
            {createdCreds ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl text-center">
                  <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                  <p className="font-bold text-green-800">✅ User Created: {createdCreds.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div><p className="text-xs text-gray-500">User ID (Email)</p><p className="font-mono font-bold text-blue-700 text-sm">{createdCreds.userId}</p></div>
                    <Button size="sm" variant="outline" onClick={() => copyText(createdCreds.userId)}><Copy className="w-3 h-3" /></Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div><p className="text-xs text-gray-500">Password (Phone)</p><p className="font-mono font-bold text-purple-700 text-lg">{createdCreds.password}</p></div>
                    <Button size="sm" variant="outline" onClick={() => copyText(createdCreds.password)}><Copy className="w-3 h-3" /></Button>
                  </div>
                  <Button className="w-full bg-blue-600" onClick={() => copyText(`WorkDen Login:\nUser ID: ${createdCreds.userId}\nPassword: ${createdCreds.password}`)}>
                    <Copy className="w-4 h-4 mr-2" />Copy Both
                  </Button>
                </div>
                <Button onClick={() => setCreatedCreds(null)} className="w-full bg-green-600">Create Another User</Button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div><Label>Recruiter Name (Enter name to assign to this user)</Label><Input placeholder="Enter recruiter name for this user" value={form.recruiter_name || ""} onChange={e => setForm({ ...form, recruiter_name: e.target.value })} /></div>
                <div><Label>User Full Name *</Label><Input placeholder="Enter full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div><Label>Phone Number * (Used as Password)</Label><Input placeholder="Enter mobile number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
                <div><Label>Email * (Used as User ID)</Label><Input type="email" placeholder="Enter email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                <div><Label>City *</Label><Input placeholder="Enter city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required /></div>
                <div><Label>Qualification (Optional)</Label><Input placeholder="e.g., Graduate, 12th Pass" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} /></div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">🔐 <strong>User ID = Email</strong> • <strong>Password = Mobile Number</strong></p>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
                  <Button type="submit" disabled={creating} className="bg-blue-600">
                    {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <><UserPlus className="w-4 h-4 mr-2" />Create User</>}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}