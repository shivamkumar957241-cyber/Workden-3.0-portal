import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Copy, CheckCircle, UserPlus, Users, Trash2, Search, X, LogOut, Shield } from "lucide-react";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --page-bg: #f5f6fa;
  --white: #ffffff;

  --indigo: #5c6ac4;
  --indigo-dark: #3c4ab5;
  --indigo-light: #eef0fb;
  --indigo-mid: rgba(92,106,196,0.13);

  --violet: #7c3aed;
  --violet-light: #f3eeff;

  --emerald: #059669;
  --emerald-light: #ecfdf5;
  --emerald-border: #a7f3d0;

  --amber: #d97706;
  --amber-light: #fffbeb;
  --amber-border: #fcd34d;

  --rose: #e11d48;
  --rose-light: #fff1f2;
  --rose-border: #fecdd3;

  --sky: #0284c7;
  --sky-light: #f0f9ff;

  --text: #111827;
  --text-mid: #4b5563;
  --text-muted: #9ca3af;
  --text-soft: #6b7280;

  --border: #e5e7eb;
  --border-mid: #d1d5db;

  --font: 'Plus Jakarta Sans', system-ui, sans-serif;
  --mono: 'JetBrains Mono', monospace;

  --r: 12px;
  --r-lg: 18px;
  --r-xl: 22px;

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05);
}

/* ───── LOGIN ───── */
.wl-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #eef0fb 0%, #f5f6fa 50%, #f0fdf4 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem;
  font-family: var(--font);
}
.wl-card {
  background: var(--white);
  border-radius: var(--r-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  width: 100%; max-width: 420px;
  overflow: hidden;
}
.wl-header {
  background: linear-gradient(135deg, #5c6ac4 0%, #7c3aed 100%);
  padding: 2.25rem 2.25rem 2rem;
  position: relative;
  overflow: hidden;
}
.wl-header::before {
  content: '';
  position: absolute; top: -40px; right: -40px;
  width: 140px; height: 140px;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
}
.wl-header::after {
  content: '';
  position: absolute; bottom: -20px; left: 20px;
  width: 80px; height: 80px;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
}
.wl-badge {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 100px;
  padding: 4px 12px;
  font-size: 10px; font-weight: 600;
  color: #fff;
  letter-spacing: 0.08em; text-transform: uppercase;
  font-family: var(--mono);
  margin-bottom: 1rem;
}
.wl-header h1 {
  font-size: 26px; font-weight: 800;
  color: #fff; line-height: 1.2; margin-bottom: 5px;
}
.wl-header p { font-size: 13px; color: rgba(255,255,255,0.72); }

.wl-body { padding: 1.75rem 2.25rem 2.25rem; display: flex; flex-direction: column; gap: 16px; }
.wl-field-lbl {
  display: block; font-size: 12px; font-weight: 600;
  color: var(--text-mid); letter-spacing: 0.03em; margin-bottom: 6px;
}
.wl-inp {
  width: 100%; padding: 11px 14px;
  border: 1.5px solid var(--border); border-radius: var(--r);
  font-size: 14px; font-family: var(--font);
  background: var(--white); color: var(--text);
  outline: none; transition: border-color .15s, box-shadow .15s;
}
.wl-inp:focus { border-color: var(--indigo); box-shadow: 0 0 0 3px var(--indigo-mid); }
.wl-inp::placeholder { color: var(--text-muted); }
.wl-err {
  background: var(--rose-light); border: 1px solid var(--rose-border);
  border-radius: var(--r); padding: 10px 14px;
  font-size: 13px; color: var(--rose);
}
.wl-submit {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, #5c6ac4 0%, #7c3aed 100%);
  color: #fff; border: none; border-radius: var(--r);
  font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: var(--font);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity .15s, transform .1s;
  box-shadow: 0 4px 14px rgba(92,106,196,0.35);
}
.wl-submit:hover { opacity: .9; transform: translateY(-1px); }
.wl-submit:active { transform: translateY(0); }

/* ───── SHELL ───── */
.ws-shell { min-height: 100vh; background: var(--page-bg); font-family: var(--font); color: var(--text); }

.ws-topbar {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  height: 60px; padding: 0 2rem;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 50;
  box-shadow: 0 1px 0 var(--border), 0 2px 8px rgba(0,0,0,0.04);
}
.ws-left { display: flex; align-items: center; gap: 14px; }
.ws-logo-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #5c6ac4, #7c3aed);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(92,106,196,0.35);
}
.ws-brand-name {
  font-size: 16px; font-weight: 800; color: var(--text);
  letter-spacing: -0.01em;
}
.ws-brand-sep { width: 1px; height: 18px; background: var(--border); }
.ws-page-label {
  font-size: 12px; font-weight: 500; color: var(--text-muted);
  background: var(--page-bg); border: 1px solid var(--border);
  border-radius: 100px; padding: 3px 12px;
}
.ws-signout {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 14px; background: var(--white);
  border: 1.5px solid var(--border); border-radius: var(--r);
  font-size: 12px; font-weight: 600; cursor: pointer;
  font-family: var(--font); color: var(--text-soft);
  transition: all .15s;
}
.ws-signout:hover { border-color: var(--rose-border); color: var(--rose); background: var(--rose-light); }

/* ───── PAGE ───── */
.ws-page { max-width: 1300px; margin: 0 auto; padding: 2.25rem 2rem 5rem; }

.ws-page-head { margin-bottom: 2rem; }
.ws-page-head h1 {
  font-size: 24px; font-weight: 800; color: var(--text);
  letter-spacing: -0.02em; margin-bottom: 4px;
}
.ws-page-head p { font-size: 13px; color: var(--text-muted); }

/* ───── STAT CARDS ───── */
.ws-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 2rem; }

.ws-stat {
  border-radius: var(--r-lg); padding: 1.375rem 1.5rem;
  position: relative; overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.ws-stat::after {
  content: '';
  position: absolute; top: -20px; right: -20px;
  width: 90px; height: 90px;
  background: rgba(255,255,255,0.12);
  border-radius: 50%;
}
.ws-stat.total {
  background: linear-gradient(135deg, #5c6ac4 0%, #4338ca 100%);
  border: 1px solid rgba(99,102,241,0.2);
}
.ws-stat.active {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border: 1px solid rgba(5,150,105,0.2);
}
.ws-stat.inactive {
  background: var(--white);
  border: 1px solid var(--border);
}
.ws-stat-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.ws-stat.total .ws-stat-icon { background: rgba(255,255,255,0.18); }
.ws-stat.active .ws-stat-icon { background: rgba(255,255,255,0.18); }
.ws-stat.inactive .ws-stat-icon { background: var(--page-bg); }
.ws-stat-lbl {
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; margin-bottom: 8px;
}
.ws-stat.total .ws-stat-lbl,
.ws-stat.active .ws-stat-lbl { color: rgba(255,255,255,0.75); }
.ws-stat.inactive .ws-stat-lbl { color: var(--text-muted); }
.ws-stat-num {
  font-size: 36px; font-weight: 800;
  line-height: 1; letter-spacing: -0.02em;
}
.ws-stat.total .ws-stat-num,
.ws-stat.active .ws-stat-num { color: #fff; }
.ws-stat.inactive .ws-stat-num { color: var(--text); }
.ws-stat-sub { font-size: 12px; margin-top: 6px; }
.ws-stat.total .ws-stat-sub,
.ws-stat.active .ws-stat-sub { color: rgba(255,255,255,0.6); }
.ws-stat.inactive .ws-stat-sub { color: var(--text-muted); }

/* ───── LAYOUT ───── */
.ws-grid { display: grid; grid-template-columns: 400px 1fr; gap: 16px; align-items: start; }

/* ───── PANEL ───── */
.ws-panel {
  background: var(--white);
  border-radius: var(--r-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.ws-panel-head {
  padding: 1.125rem 1.5rem;
  border-bottom: 2px solid var(--page-bg);
  display: flex; align-items: center; gap: 10px;
}
.ws-panel-head h2 {
  font-size: 15px; font-weight: 700; color: var(--text);
  letter-spacing: -0.01em;
}
.ws-panel-ico {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.ws-panel-ico.indigo { background: var(--indigo-light); color: var(--indigo); }
.ws-panel-ico.violet { background: var(--violet-light); color: var(--violet); }
.ws-badge-count {
  margin-left: auto;
  background: var(--indigo-light); color: var(--indigo);
  border-radius: 100px; padding: 3px 11px;
  font-family: var(--mono); font-size: 11px; font-weight: 500;
}
.ws-body { padding: 1.5rem; }

/* ───── FORM ───── */
.wf-notice {
  background: var(--amber-light); border: 1px solid var(--amber-border);
  border-radius: var(--r); padding: 10px 14px;
  font-size: 12px; color: var(--amber); font-weight: 600;
  margin-bottom: 1.25rem;
  display: flex; align-items: center; gap: 7px;
}
.wf-field { margin-bottom: 15px; }
.wf-label {
  display: block; font-size: 12px; font-weight: 600;
  color: var(--text-mid); margin-bottom: 6px;
}
.wf-req { color: var(--rose); }
.wf-hint-txt { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.wf-inp {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--border); border-radius: var(--r);
  font-size: 13.5px; font-family: var(--font);
  background: var(--white); color: var(--text);
  outline: none; transition: border-color .15s, box-shadow .15s;
}
.wf-inp:focus { border-color: var(--indigo); box-shadow: 0 0 0 3px var(--indigo-mid); }
.wf-inp::placeholder { color: var(--text-muted); }
.wf-submit {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #5c6ac4 0%, #7c3aed 100%);
  color: #fff; border: none; border-radius: var(--r);
  font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: var(--font);
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: opacity .15s, transform .1s;
  margin-top: 8px;
  box-shadow: 0 4px 14px rgba(92,106,196,0.3);
}
.wf-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.wf-submit:active:not(:disabled) { transform: translateY(0); }
.wf-submit:disabled { opacity: .45; cursor: not-allowed; transform: none; }

/* ───── SUCCESS STATE ───── */
.wf-success-banner {
  display: flex; align-items: center; gap: 10px;
  background: var(--emerald-light); border: 1px solid var(--emerald-border);
  border-radius: var(--r); padding: 12px 14px; margin-bottom: 1.125rem;
}
.wf-s-title { font-size: 13px; font-weight: 700; color: var(--emerald); }
.wf-s-sub { font-size: 11px; color: #34d399; margin-top: 1px; }

.wf-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.wf-detail-card {
  background: var(--page-bg); border: 1px solid var(--border);
  border-radius: var(--r); padding: 10px 12px;
}
.wf-detail-card.full { grid-column: 1 / -1; }
.wf-detail-lbl {
  font-size: 10px; font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px;
}
.wf-detail-val { font-size: 13px; font-weight: 600; color: var(--text); }

.wf-creds-wrap {
  background: linear-gradient(135deg, #eef0fb 0%, #f3eeff 100%);
  border: 1.5px solid rgba(92,106,196,0.2);
  border-radius: var(--r-lg); padding: 1.125rem; margin-bottom: 12px;
}
.wf-creds-label {
  font-family: var(--mono); font-size: 10px; font-weight: 500;
  color: var(--indigo); text-transform: uppercase; letter-spacing: 0.1em;
  margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
}
.wf-cred-row {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 10px; padding: 10px 12px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; margin-bottom: 7px;
}
.wf-cred-row:last-of-type { margin-bottom: 0; }
.wf-cred-lbl { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.wf-cred-val { font-family: var(--mono); font-size: 13px; font-weight: 500; color: var(--text); margin-top: 2px; word-break: break-all; }
.wf-copy-btn {
  padding: 5px 11px; background: var(--indigo-light);
  border: 1.5px solid rgba(92,106,196,0.25); border-radius: 8px;
  font-size: 11px; font-weight: 600; cursor: pointer;
  font-family: var(--font); color: var(--indigo);
  display: flex; align-items: center; gap: 4px;
  white-space: nowrap; transition: all .12s;
}
.wf-copy-btn:hover { background: var(--indigo); color: #fff; border-color: var(--indigo); }
.wf-copy-both {
  width: 100%; padding: 10px;
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: 10px; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: var(--font); color: var(--text-mid);
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .12s; margin-top: 8px;
}
.wf-copy-both:hover { border-color: var(--indigo); color: var(--indigo); background: var(--indigo-light); }
.wf-create-again {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #5c6ac4, #7c3aed);
  color: #fff; border: none; border-radius: var(--r);
  font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: var(--font);
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: opacity .15s; box-shadow: 0 4px 14px rgba(92,106,196,0.3);
}
.wf-create-again:hover { opacity: .9; }

/* ───── TABLE PANEL ───── */
.wt-search-bar { padding: 1rem 1.5rem; border-bottom: 2px solid var(--page-bg); }
.wt-search-inner {
  display: flex; align-items: center; gap: 9px;
  background: var(--page-bg); border: 1.5px solid var(--border);
  border-radius: var(--r); padding: 0 13px;
  transition: border-color .15s, box-shadow .15s;
}
.wt-search-inner:focus-within {
  border-color: var(--indigo); box-shadow: 0 0 0 3px var(--indigo-mid);
  background: var(--white);
}
.wt-search-inner input {
  flex: 1; border: none; background: transparent;
  padding: 10px 0; font-size: 13px; font-family: var(--font);
  color: var(--text); outline: none;
}
.wt-search-inner input::placeholder { color: var(--text-muted); }
.wt-clear { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; transition: color .1s; }
.wt-clear:hover { color: var(--text); }

.wt-scroll { overflow-x: auto; max-height: 580px; overflow-y: auto; }
.wt-table { width: 100%; border-collapse: collapse; }
.wt-table thead { position: sticky; top: 0; z-index: 2; }
.wt-table thead tr { background: var(--page-bg); }
.wt-table th {
  padding: 10px 16px;
  font-family: var(--mono); font-size: 10px; font-weight: 500;
  color: var(--text-muted); text-transform: uppercase;
  letter-spacing: 0.08em; text-align: left; white-space: nowrap;
  border-bottom: 2px solid var(--border);
}
.wt-table tbody tr { border-bottom: 1px solid #f3f4f7; transition: background .1s; }
.wt-table tbody tr:last-child { border-bottom: none; }
.wt-table tbody tr:hover { background: #fafafe; }
.wt-table td { padding: 13px 16px; font-size: 13px; color: var(--text); vertical-align: middle; }

.wt-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--indigo-light), var(--violet-light));
  border: 1.5px solid rgba(92,106,196,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--indigo); flex-shrink: 0;
}
.wt-user-cell { display: flex; align-items: center; gap: 10px; }
.wt-uname { font-size: 13px; font-weight: 700; color: var(--text); }
.wt-usub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

.wt-mono { font-family: var(--mono); font-size: 12px; font-weight: 500; }
.wt-mono.uid { color: var(--indigo); }
.wt-mono.pw { color: var(--text-soft); }

.wt-badge-active {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; padding: 4px 11px; border-radius: 100px;
  background: var(--emerald-light); color: var(--emerald); border: 1px solid var(--emerald-border);
  font-family: var(--mono);
}
.wt-badge-active::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--emerald); }
.wt-badge-inactive {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; padding: 4px 11px; border-radius: 100px;
  background: var(--page-bg); color: var(--text-muted); border: 1px solid var(--border);
  font-family: var(--mono);
}
.wt-badge-inactive::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--border-mid); }

.wt-copy-inline {
  padding: 3px 9px; background: var(--page-bg);
  border: 1px solid var(--border); border-radius: 6px;
  font-size: 10px; cursor: pointer;
  font-family: var(--font); color: var(--text-muted);
  display: inline-flex; align-items: center; gap: 3px;
  transition: all .12s; margin-left: 6px;
}
.wt-copy-inline:hover { border-color: var(--indigo); color: var(--indigo); background: var(--indigo-light); }
.wt-del-btn {
  padding: 6px; background: none; border: 1px solid transparent;
  border-radius: 8px; cursor: pointer; color: var(--border-mid);
  display: flex; transition: all .12s;
}
.wt-del-btn:hover { color: var(--rose); background: var(--rose-light); border-color: var(--rose-border); }

.wt-empty { padding: 4rem 2rem; text-align: center; }
.wt-empty-ico {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, var(--indigo-light), var(--violet-light));
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.wt-empty-title { font-size: 14px; font-weight: 700; color: var(--text-mid); margin-bottom: 4px; }
.wt-empty-sub { font-size: 12px; color: var(--text-muted); }
.wt-no-results { padding: 3rem 2rem; text-align: center; font-size: 13px; color: var(--text-muted); }
`;

export default function CreateUser() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", qualification: "" });
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ userId: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const handlePortalLogin = (e) => {
    e.preventDefault();
    if (loginForm.userId === "shivam" && loginForm.password === "995567") {
      setIsAuthenticated(true); setLoginError("");
    } else {
      setLoginError("Invalid credentials. Please try again.");
    }
  };

  const { data: appUsers = [] } = useQuery({
    queryKey: ['app-users'],
    queryFn: () => base44.entities.AppUser.list('-created_date', 100),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: async (userData) => await base44.entities.AppUser.create(userData),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['app-users'] });
      setCreatedCredentials({
        userId: newUser.login_user_id,
        password: newUser.login_password,
        name: newUser.full_name,
        phone: newUser.phone,
        email: newUser.email,
        city: newUser.city,
        qualification: newUser.qualification,
        badge: newUser.badge,
        status: newUser.status,
      });
      setForm({ name: "", phone: "", email: "", city: "", qualification: "" });
    },
    onError: () => alert("Failed to create user. Please try again.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AppUser.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['app-users'] })
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.city.trim()) {
      alert("Name, Phone and City are required"); return;
    }
    const existing = appUsers.find(u => u.phone === form.phone.trim());
    if (existing) {
      alert(`A user with phone ${form.phone} already exists. User ID: ${existing.login_user_id}`); return;
    }
    if (!form.email.trim()) {
      alert("Email is required (it will be used as User ID)"); return;
    }
    createMutation.mutate({
      login_user_id: form.email.trim(),
      login_password: form.phone.trim(),
      full_name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      qualification: form.qualification.trim(),
      role: "user", is_subscribed: false, status: "active",
      assigned_tasks: [], wallet_balance: 0, total_earnings: 0,
      gamification_points: 0, badge: "Bronze", last_login: null,
    });
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert("Copied!"); };

  const nonAdminUsers = appUsers.filter(u => u.role !== 'admin');
  const q = search.trim().toLowerCase();
  const filtered = q
    ? nonAdminUsers.filter(u =>
        (u.full_name||'').toLowerCase().includes(q) ||
        (u.phone||'').includes(q) ||
        (u.login_user_id||'').toLowerCase().includes(q) ||
        (u.city||'').toLowerCase().includes(q))
    : nonAdminUsers;
  const activeCount = nonAdminUsers.filter(u => u.status === 'active').length;
  const initials = (n) => n ? n.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '??';

  // ── LOGIN ──
  if (!isAuthenticated) return (
    <>
      <style>{S}</style>
      <div className="wl-bg">
        <div className="wl-card">
          <div className="wl-header">
            <div className="wl-badge"><Shield size={10}/> Recruiter Portal</div>
            <h1>Welcome back 👋</h1>
            <p>Sign in to manage WorkDen user accounts</p>
          </div>
          <div className="wl-body">
            {loginError && <div className="wl-err">{loginError}</div>}
            <div>
              <label className="wl-field-lbl">User ID</label>
              <input className="wl-inp" placeholder="Enter your user ID"
                value={loginForm.userId}
                onChange={e => setLoginForm({...loginForm, userId: e.target.value})}/>
            </div>
            <div>
              <label className="wl-field-lbl">Password</label>
              <input className="wl-inp" type="password" placeholder="Enter your password"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && handlePortalLogin(e)}/>
            </div>
            <button className="wl-submit" onClick={handlePortalLogin}>
              Sign in to Portal →
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ── MAIN ──
  return (
    <>
      <style>{S}</style>
      <div className="ws-shell">

        {/* TOPBAR */}
        <div className="ws-topbar">
          <div className="ws-left">
            <div className="ws-logo-wrap">
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="5.5" width="14" height="9.5" rx="2.2" stroke="#fff" strokeWidth="1.3"/>
                <path d="M5.5 5.5V4.5a2.5 2.5 0 015 0v1" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="ws-brand-name">WorkDen</span>
            <div className="ws-brand-sep"/>
            <span className="ws-page-label">Recruiter Portal</span>
          </div>
          <button className="ws-signout" onClick={() => setIsAuthenticated(false)}>
            <LogOut size={13}/> Sign out
          </button>
        </div>

        <div className="ws-page">

          {/* PAGE HEADER */}
          <div className="ws-page-head">
            <h1>User Management</h1>
            <p>Create new accounts and manage all registered users on WorkDen</p>
          </div>

          {/* STAT CARDS */}
          <div className="ws-stats">
            <div className="ws-stat total">
              <div className="ws-stat-icon">
                <Users size={16} color="rgba(255,255,255,0.9)"/>
              </div>
              <div className="ws-stat-lbl">Total Users</div>
              <div className="ws-stat-num">{nonAdminUsers.length}</div>
              <div className="ws-stat-sub">All time registrations</div>
            </div>
            <div className="ws-stat active">
              <div className="ws-stat-icon">
                <CheckCircle size={16} color="rgba(255,255,255,0.9)"/>
              </div>
              <div className="ws-stat-lbl">Active Accounts</div>
              <div className="ws-stat-num">{activeCount}</div>
              <div className="ws-stat-sub">Currently active</div>
            </div>
            <div className="ws-stat inactive">
              <div className="ws-stat-icon">
                <Users size={16} color="#9ca3af"/>
              </div>
              <div className="ws-stat-lbl">Inactive</div>
              <div className="ws-stat-num">{nonAdminUsers.length - activeCount}</div>
              <div className="ws-stat-sub">Inactive accounts</div>
            </div>
          </div>

          <div className="ws-grid">

            {/* FORM PANEL */}
            <div className="ws-panel">
              <div className="ws-panel-head">
                <div className="ws-panel-ico indigo"><UserPlus size={14}/></div>
                <h2>Create New Account</h2>
              </div>
              <div className="ws-body">
                {createdCredentials ? (
                  <div>
                    <div className="wf-success-banner">
                      <CheckCircle size={18} color="#059669" style={{flexShrink:0}}/>
                      <div>
                        <div className="wf-s-title">Account Created Successfully!</div>
                        <div className="wf-s-sub">User has been saved to the database</div>
                      </div>
                    </div>

                    <div className="wf-detail-grid">
                      <div className="wf-detail-card full">
                        <div className="wf-detail-lbl">Full Name</div>
                        <div className="wf-detail-val">{createdCredentials.name}</div>
                      </div>
                      <div className="wf-detail-card">
                        <div className="wf-detail-lbl">Phone</div>
                        <div className="wf-detail-val">{createdCredentials.phone}</div>
                      </div>
                      <div className="wf-detail-card">
                        <div className="wf-detail-lbl">City</div>
                        <div className="wf-detail-val">{createdCredentials.city || '—'}</div>
                      </div>
                      <div className="wf-detail-card full">
                        <div className="wf-detail-lbl">Email</div>
                        <div className="wf-detail-val">{createdCredentials.email}</div>
                      </div>
                      {createdCredentials.qualification && (
                        <div className="wf-detail-card full">
                          <div className="wf-detail-lbl">Qualification</div>
                          <div className="wf-detail-val">{createdCredentials.qualification}</div>
                        </div>
                      )}
                      <div className="wf-detail-card">
                        <div className="wf-detail-lbl">Badge</div>
                        <div className="wf-detail-val">{createdCredentials.badge || 'Bronze'}</div>
                      </div>
                      <div className="wf-detail-card">
                        <div className="wf-detail-lbl">Status</div>
                        <div className="wf-detail-val">{createdCredentials.status || 'active'}</div>
                      </div>
                    </div>

                    <div className="wf-creds-wrap">
                      <div className="wf-creds-label">
                        🔐 Login Credentials
                      </div>
                      <div className="wf-cred-row">
                        <div>
                          <div className="wf-cred-lbl">User ID (Email)</div>
                          <div className="wf-cred-val">{createdCredentials.userId}</div>
                        </div>
                        <button className="wf-copy-btn" onClick={() => copyToClipboard(createdCredentials.userId)}>
                          <Copy size={10}/> Copy
                        </button>
                      </div>
                      <div className="wf-cred-row">
                        <div>
                          <div className="wf-cred-lbl">Password (Mobile No.)</div>
                          <div className="wf-cred-val">{createdCredentials.password}</div>
                        </div>
                        <button className="wf-copy-btn" onClick={() => copyToClipboard(createdCredentials.password)}>
                          <Copy size={10}/> Copy
                        </button>
                      </div>
                      <button className="wf-copy-both"
                        onClick={() => copyToClipboard(`WorkDen Login Details\nUser ID: ${createdCredentials.userId}\nPassword: ${createdCredentials.password}`)}>
                        <Copy size={12}/> Copy Both Credentials
                      </button>
                    </div>

                    <button className="wf-create-again" onClick={() => setCreatedCredentials(null)}>
                      <UserPlus size={14}/> Create Another Account
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreate}>
                    <div className="wf-notice">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="var(--amber)" strokeWidth="1.3"/>
                        <path d="M7 6.5v3.5M7 4.5v.5" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      User ID = Email address &nbsp;·&nbsp; Password = Mobile number
                    </div>

                    {[
                      {label:"Full Name", key:"name", placeholder:"e.g. Rahul Sharma", req:true, type:"text"},
                      {label:"Phone Number", key:"phone", placeholder:"10-digit mobile number", req:true, type:"tel"},
                      {label:"Email Address", key:"email", placeholder:"user@example.com", req:true, type:"email", hint:"This will be used as the login User ID"},
                      {label:"City", key:"city", placeholder:"e.g. Patna", req:true, type:"text"},
                      {label:"Qualification", key:"qualification", placeholder:"e.g. Graduate, 12th Pass", req:false, type:"text"},
                    ].map(f => (
                      <div className="wf-field" key={f.key}>
                        <label className="wf-label">{f.label}{f.req && <span className="wf-req"> *</span>}</label>
                        <input className="wf-inp" type={f.type} placeholder={f.placeholder}
                          value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                          required={f.req}/>
                        {f.hint && <div className="wf-hint-txt">{f.hint}</div>}
                      </div>
                    ))}

                    <button className="wf-submit" type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending
                        ? <><Loader2 size={14} className="animate-spin"/> Creating Account…</>
                        : <><UserPlus size={14}/> Create User Account</>}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* TABLE PANEL */}
            <div className="ws-panel">
              <div className="ws-panel-head">
                <div className="ws-panel-ico violet"><Users size={14}/></div>
                <h2>All Registered Accounts</h2>
                <span className="ws-badge-count">{nonAdminUsers.length} users</span>
              </div>

              <div className="wt-search-bar">
                <div className="wt-search-inner">
                  <Search size={14} color="var(--text-muted)"/>
                  <input placeholder="Search by name, phone, email or city…"
                    value={search} onChange={e => setSearch(e.target.value)}/>
                  {search && (
                    <button className="wt-clear" onClick={() => setSearch("")}><X size={13}/></button>
                  )}
                </div>
              </div>

              <div className="wt-scroll">
                <table className="wt-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>User ID</th>
                      <th>Password</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && nonAdminUsers.length === 0 && (
                      <tr><td colSpan={5}>
                        <div className="wt-empty">
                          <div className="wt-empty-ico">
                            <Users size={20} color="var(--indigo)"/>
                          </div>
                          <div className="wt-empty-title">No users yet</div>
                          <div className="wt-empty-sub">Create your first user account using the form on the left</div>
                        </div>
                      </td></tr>
                    )}
                    {filtered.length === 0 && nonAdminUsers.length > 0 && (
                      <tr><td colSpan={5}>
                        <div className="wt-no-results">No results found for "{search}"</div>
                      </td></tr>
                    )}
                    {filtered.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="wt-user-cell">
                            <div className="wt-avatar">{initials(u.full_name)}</div>
                            <div>
                              <div className="wt-uname">{u.full_name}</div>
                              <div className="wt-usub">{u.phone}{u.city ? ` · ${u.city}` : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="wt-mono uid">{u.login_user_id}</span>
                          <button className="wt-copy-inline" onClick={() => copyToClipboard(u.login_user_id)}>
                            <Copy size={9}/>
                          </button>
                        </td>
                        <td>
                          <span className="wt-mono pw">{u.login_password}</span>
                          <button className="wt-copy-inline" onClick={() => copyToClipboard(u.login_password)}>
                            <Copy size={9}/>
                          </button>
                        </td>
                        <td>
                          <span className={u.status === 'active' ? 'wt-badge-active' : 'wt-badge-inactive'}>
                            {u.status === 'active' ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td>
                          <button className="wt-del-btn"
                            onClick={() => { if(confirm(`Delete ${u.full_name}?`)) deleteMutation.mutate(u.id); }}>
                            <Trash2 size={14}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}