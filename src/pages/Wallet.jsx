import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet as WalletIcon, TrendingUp, TrendingDown, DollarSign, Eye, EyeOff, Lock, CheckCircle, AlertTriangle, Clock, ArrowDownCircle, ArrowUpCircle, KeyRound, ChevronRight, Shield, Banknote } from "lucide-react";

const INDIAN_BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Union Bank of India", "Bank of India", "Indian Bank", "Central Bank of India", "Indian Overseas Bank", "UCO Bank", "Bank of Maharashtra", "Punjab & Sind Bank", "Kotak Mahindra Bank", "Yes Bank", "IndusInd Bank", "IDFC First Bank", "Federal Bank", "RBL Bank", "South Indian Bank", "Karur Vysya Bank", "Tamilnad Mercantile Bank", "Jammu & Kashmir Bank", "DCB Bank", "City Union Bank", "Karnataka Bank", "Dhanlaxmi Bank", "Nainital Bank"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  .wallet-root * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
  .mono { font-family: 'JetBrains Mono', monospace !important; }

  .wallet-root {
    min-height: 100vh;
    background: #f5f6fa;
    padding: 0;
  }

  /* PIN GATE */
  .pin-gate {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f6fa;
    padding: 16px;
  }

  .pin-card {
    width: 100%;
    max-width: 400px;
    background: #fff;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.10);
    border: 1px solid #e8e9f0;
  }

  .pin-header {
    background: #111827;
    padding: 40px 32px 32px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .pin-header::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 160px; height: 160px;
    background: rgba(255,255,255,0.04);
    border-radius: 50%;
  }

  .pin-header::after {
    content: '';
    position: absolute;
    bottom: -20px; left: -20px;
    width: 100px; height: 100px;
    background: rgba(255,255,255,0.03);
    border-radius: 50%;
  }

  .pin-icon-wrap {
    width: 72px; height: 72px;
    background: rgba(255,255,255,0.08);
    border: 1.5px solid rgba(255,255,255,0.15);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }

  .pin-title {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 6px;
    letter-spacing: -0.3px;
  }

  .pin-subtitle {
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    margin: 0;
  }

  .pin-body {
    padding: 28px 28px 32px;
  }

  .info-box {
    background: #f8f9fc;
    border: 1px solid #e8e9f0;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    margin-bottom: 20px;
  }

  .info-box .ib-icon { margin: 0 auto 8px; display: block; }
  .info-box .ib-title { font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 4px; }
  .info-box .ib-sub { font-size: 12px; color: #6b7280; margin: 0; }

  .info-box.warn { background: #fffbeb; border-color: #fde68a; }
  .info-box.warn .ib-title { color: #92400e; }
  .info-box.warn .ib-sub { color: #b45309; }

  .pin-input-wrap { position: relative; margin-bottom: 16px; }
  .pin-input {
    width: 100%;
    height: 52px;
    border: 1.5px solid #e0e2eb;
    border-radius: 12px;
    text-align: center;
    font-size: 22px;
    letter-spacing: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    color: #111827;
    outline: none;
    padding: 0 44px 0 16px;
    transition: border-color 0.2s;
    background: #fafbfc;
  }
  .pin-input:focus { border-color: #111827; background: #fff; }
  .pin-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9ca3af; }

  .btn-primary {
    width: 100%;
    height: 48px;
    background: #111827;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background 0.2s, transform 0.1s;
    font-family: 'Sora', sans-serif;
  }
  .btn-primary:hover { background: #1f2937; }
  .btn-primary:active { transform: scale(0.99); }

  .btn-ghost {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
    height: 40px;
    border-radius: 10px;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    transition: background 0.15s;
    font-family: 'Sora', sans-serif;
  }
  .btn-ghost:hover { background: #e5e7eb; }

  /* MAIN WALLET */
  .wallet-inner { max-width: 720px; margin: 0 auto; padding: 24px 16px 80px; }

  .page-header { margin-bottom: 24px; }
  .page-header h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 2px; letter-spacing: -0.4px; }
  .page-header p { font-size: 13px; color: #6b7280; margin: 0; }
  .header-row { display: flex; align-items: flex-start; justify-content: space-between; }

  /* BALANCE CARD */
  .balance-card {
    background: #111827;
    border-radius: 20px;
    padding: 28px 24px 24px;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }
  .balance-card::before {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: rgba(255,255,255,0.03);
    border-radius: 50%;
  }
  .balance-card::after {
    content: '';
    position: absolute; bottom: -40px; left: 40px;
    width: 140px; height: 140px;
    background: rgba(255,255,255,0.02);
    border-radius: 50%;
  }

  .balance-label { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.45); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .balance-amount {
    font-size: 44px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -1.5px;
    line-height: 1;
    margin-bottom: 4px;
    font-family: 'JetBrains Mono', monospace;
  }
  .balance-amount span { font-size: 24px; font-weight: 500; opacity: 0.6; margin-right: 2px; }
  .balance-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 24px; }

  .balance-actions { display: flex; gap: 10px; }
  .btn-withdraw {
    flex: 1;
    height: 44px;
    background: #fff;
    color: #111827;
    border: none;
    border-radius: 11px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: background 0.15s, transform 0.1s;
    font-family: 'Sora', sans-serif;
  }
  .btn-withdraw:hover:not(:disabled) { background: #f3f4f6; }
  .btn-withdraw:disabled { opacity: 0.35; cursor: not-allowed; }
  .btn-withdraw:active:not(:disabled) { transform: scale(0.99); }

  .btn-icon {
    height: 44px;
    width: 44px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 11px;
    color: #fff;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .btn-icon:hover { background: rgba(255,255,255,0.15); }

  .frozen-bar {
    margin-top: 14px;
    padding: 10px 14px;
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 10px;
    font-size: 12px;
    color: #fca5a5;
    display: flex; align-items: center; gap: 6px;
  }

  .min-bar {
    margin-top: 14px;
    padding: 10px 14px;
    background: rgba(251,191,36,0.12);
    border: 1px solid rgba(251,191,36,0.25);
    border-radius: 10px;
    font-size: 12px;
    color: #fcd34d;
    display: flex; align-items: center; gap: 6px;
  }

  /* STAT CARDS */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  @media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }

  .stat-card {
    background: #fff;
    border: 1px solid #e8e9f0;
    border-radius: 14px;
    padding: 16px 14px;
  }
  .stat-icon-wrap {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 12px;
  }
  .stat-label { font-size: 11px; color: #9ca3af; font-weight: 500; margin-bottom: 4px; letter-spacing: 0.3px; }
  .stat-value { font-size: 18px; font-weight: 700; color: #111827; font-family: 'JetBrains Mono', monospace; letter-spacing: -0.5px; }
  .stat-extra { font-size: 10px; color: #f97316; font-weight: 500; margin-top: 2px; }

  /* TRUST BAR */
  .trust-bar {
    background: #fff;
    border: 1px solid #e8e9f0;
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .trust-bar .tb-icon { flex-shrink: 0; color: #10b981; }
  .trust-bar p { font-size: 12px; color: #4b5563; margin: 0; line-height: 1.5; }
  .trust-bar p + p { margin-top: 2px; }

  /* SECTION CARDS */
  .section-card {
    background: #fff;
    border: 1px solid #e8e9f0;
    border-radius: 16px;
    margin-bottom: 16px;
    overflow: hidden;
  }
  .section-head {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f1f5;
    display: flex; align-items: center; justify-content: space-between;
  }
  .section-head h3 { font-size: 14px; font-weight: 600; color: #111827; margin: 0; }
  .section-head span { font-size: 12px; color: #9ca3af; }
  .section-body { padding: 16px 20px; }

  /* TRANSACTION ITEMS */
  .txn-list { display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto; }
  .txn-list::-webkit-scrollbar { width: 4px; }
  .txn-list::-webkit-scrollbar-track { background: transparent; }
  .txn-list::-webkit-scrollbar-thumb { background: #e0e2eb; border-radius: 4px; }

  .txn-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px;
    border-radius: 11px;
    background: #fafbfc;
    border: 1px solid #f0f1f5;
    transition: background 0.12s;
  }
  .txn-item:hover { background: #f3f4f6; }

  .txn-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-right: 12px;
  }
  .txn-icon.credit { background: #ecfdf5; }
  .txn-icon.debit { background: #fef2f2; }

  .txn-info { flex: 1; min-width: 0; }
  .txn-reason { font-size: 13px; font-weight: 500; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .txn-meta { font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .txn-balance-trail { font-size: 10px; color: #c4c6d0; margin-top: 1px; font-family: 'JetBrains Mono', monospace; }

  .txn-amount-col { text-align: right; flex-shrink: 0; margin-left: 10px; }
  .txn-amount { font-size: 15px; font-weight: 700; font-family: 'JetBrains Mono', monospace; letter-spacing: -0.3px; }
  .txn-amount.credit { color: #059669; }
  .txn-amount.debit { color: #dc2626; }
  .txn-badge { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 5px; margin-top: 3px; letter-spacing: 0.3px; text-transform: uppercase; }
  .txn-badge.credit { background: #ecfdf5; color: #065f46; }
  .txn-badge.debit { background: #fef2f2; color: #991b1b; }

  /* WITHDRAWAL ITEMS */
  .wd-item {
    padding: 14px;
    border-radius: 11px;
    border: 1px solid #f0f1f5;
    background: #fafbfc;
    margin-bottom: 8px;
  }
  .wd-item:last-child { margin-bottom: 0; }
  .wd-top { display: flex; align-items: flex-start; justify-content: space-between; }
  .wd-amount { font-size: 20px; font-weight: 700; color: #111827; font-family: 'JetBrains Mono', monospace; letter-spacing: -0.5px; }
  .wd-bank { font-size: 12px; color: #374151; font-weight: 500; margin-top: 3px; }
  .wd-acc { font-size: 11px; color: #9ca3af; margin-top: 1px; }
  .wd-date { font-size: 11px; color: #c4c6d0; margin-top: 6px; }
  .wd-reject { margin-top: 10px; padding: 8px 12px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; font-size: 12px; color: #991b1b; }

  .status-pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.2px; }
  .status-pill.pending { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .status-pill.completed { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  .status-pill.rejected { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

  /* EMPTY STATE */
  .empty-state { text-align: center; padding: 40px 20px; }
  .empty-state .es-icon { color: #d1d5db; margin: 0 auto 12px; display: block; }
  .empty-state p { font-size: 13px; color: #9ca3af; margin: 0; }

  /* DIALOG OVERRIDES */
  .dialog-label { font-size: 13px; font-weight: 500; color: #374151; display: block; margin-bottom: 6px; }
  .dialog-input {
    width: 100%;
    height: 42px;
    border: 1.5px solid #e0e2eb;
    border-radius: 10px;
    padding: 0 12px;
    font-size: 14px;
    color: #111827;
    outline: none;
    background: #fafbfc;
    font-family: 'Sora', sans-serif;
    transition: border-color 0.15s;
  }
  .dialog-input:focus { border-color: #111827; background: #fff; }
  .dialog-select {
    width: 100%;
    height: 42px;
    border: 1.5px solid #e0e2eb;
    border-radius: 10px;
    padding: 0 12px;
    font-size: 14px;
    color: #111827;
    outline: none;
    background: #fafbfc;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
  }
  .dialog-select:focus { border-color: #111827; }
  .dialog-field { margin-bottom: 14px; }

  .btn-dialog-primary {
    height: 42px; padding: 0 20px;
    background: #111827; color: #fff;
    border: none; border-radius: 10px;
    font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'Sora', sans-serif;
    transition: background 0.15s;
  }
  .btn-dialog-primary:hover { background: #1f2937; }

  .btn-dialog-ghost {
    height: 42px; padding: 0 20px;
    background: #f3f4f6; color: #374151;
    border: 1px solid #e5e7eb; border-radius: 10px;
    font-size: 14px; font-weight: 500;
    cursor: pointer; font-family: 'Sora', sans-serif;
    transition: background 0.15s;
  }
  .btn-dialog-ghost:hover { background: #e5e7eb; }
`;

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [walletUnlocked, setWalletUnlocked] = useState(false);
  const [walletPassword, setWalletPassword] = useState("");
  const [withdrawalDialog, setWithdrawalDialog] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    bank_name: "",
    account_holder: "",
    account_number: "",
    ifsc_code: ""
  });

  const [setPasswordDialog, setSetPasswordDialog] = useState(false);
  const [newWalletPassword, setNewWalletPassword] = useState("");
  const [confirmWalletPassword, setConfirmWalletPassword] = useState("");

  const { data: transactions = [] } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: () => base44.entities.WalletTransaction.filter({ user_id: user?.id }),
    enabled: !!user?.id && walletUnlocked,
    initialData: [],
    refetchInterval: 10000
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: () => base44.entities.WithdrawalRequest.filter({ user_id: user?.id }),
    enabled: !!user?.id && walletUnlocked,
    initialData: [],
    refetchInterval: 10000
  });

  const { data: proofs = [] } = useQuery({
    queryKey: ['proofs', user?.id],
    queryFn: () => base44.entities.Proof.filter({ user_id: user?.id }),
    enabled: !!user?.id && walletUnlocked,
    initialData: [],
    refetchInterval: 10000
  });

  useEffect(() => {
    loadUser();
    const interval = setInterval(loadUser, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('workden_user');
    const userSource = localStorage.getItem('workden_user_source');
    if (userSource !== 'appuser' || !savedUserStr) return;
    try {
      const localUser = JSON.parse(savedUserStr);
      if (!localUser?.id) return;
      const unsubscribe = base44.entities.AppUser.subscribe((event) => {
        if (event.id === localUser.id && event.data) {
          setUser(event.data);
          localStorage.setItem('workden_user', JSON.stringify(event.data));
        }
      });
      return unsubscribe;
    } catch (_) {}
  }, []);

  const loadUser = async () => {
    const savedUserStr = localStorage.getItem('workden_user');
    const userSource = localStorage.getItem('workden_user_source');
    const savedUserId = localStorage.getItem('workden_login_id');
    
    if (userSource === 'appuser' && savedUserStr) {
      try {
        const localUser = JSON.parse(savedUserStr);
        if (!user) setUser(localUser);
        if (localUser?.id) {
          const freshUsers = await base44.entities.AppUser.filter({ id: localUser.id });
          if (freshUsers && freshUsers.length > 0) {
            const freshUser = freshUsers[0];
            setUser(freshUser);
            localStorage.setItem('workden_user', JSON.stringify(freshUser));
          }
        }
        return;
      } catch (e) {
        if (savedUserStr) { try { setUser(JSON.parse(savedUserStr)); } catch (_) {} }
        return;
      }
    }

    if (savedUserId === 'SHIVAM') {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser?.role === 'admin') setWalletUnlocked(true);
        return;
      } catch (_) {}
      if (savedUserStr) { try { const u = JSON.parse(savedUserStr); setUser(u); setWalletUnlocked(true); } catch (_) {} }
      return;
    }

    try {
      const currentUser = await base44.auth.me();
      try {
        const allUsers = await base44.entities.User.list();
        const freshUser = allUsers.find(u => u.id === currentUser.id);
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('workden_user', JSON.stringify(freshUser));
          if (freshUser?.role === 'admin') setWalletUnlocked(true);
          return;
        }
      } catch (_) {}
      setUser(currentUser);
      if (currentUser?.role === 'admin') setWalletUnlocked(true);
    } catch (error) {
      if (savedUserStr) { try { const u = JSON.parse(savedUserStr); setUser(u); } catch (_) {} }
    }
  };

  const { data: globalSettings = [] } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => base44.entities.GlobalSettings.list(),
    initialData: []
  });

  const sortedTxns = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const latestTxnBalance = sortedTxns.length > 0 ? Number(sortedTxns[0]?.new_balance || 0) : null;
  const rawBalance = Math.max(0, Number(latestTxnBalance !== null ? latestTxnBalance : (user?.wallet_balance || 0)));
  const pendingWithdrawalsTotal = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);
  const walletBalance = Math.max(0, rawBalance - pendingWithdrawalsTotal);

  const totalEarningsFromTxns = transactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const approvedProofsTotal = proofs.filter(p => p.status === 'approved').reduce((sum, p) => sum + Number(p.reward_amount || 0), 0);
  const totalEarnings = Math.max(Number(user?.total_earnings || 0), totalEarningsFromTxns, approvedProofsTotal);
  const pendingBalance = proofs.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.reward_amount || 0), 0);
  const taskEarnings = approvedProofsTotal;
  const totalWithdrawalsDisplay = withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + Number(w.amount || 0), 0);

  const minWithdrawal = parseFloat(globalSettings.find(s => s.setting_key === 'min_withdrawal_amount')?.setting_value) || 500;

  const handleWalletUnlock = () => {
    if (walletPassword === user?.wallet_password) {
      setWalletUnlocked(true);
      setWalletPassword("");
    } else {
      alert("❌ Incorrect PIN! Please try again.");
      setWalletPassword("");
    }
  };

  const handleSetWalletPassword = async () => {
    if (!newWalletPassword || newWalletPassword.length < 4) {
      alert("⚠️ PIN must be at least 4 characters");
      return;
    }
    if (newWalletPassword !== confirmWalletPassword) {
      alert("❌ PINs don't match!");
      return;
    }
    const updated = { ...user, wallet_password: newWalletPassword };
    setUser(updated);
    localStorage.setItem('workden_user', JSON.stringify(updated));

    const userSource = localStorage.getItem('workden_user_source');
    if (userSource === 'appuser') {
      try { if (user?.id) await base44.entities.AppUser.update(user.id, { wallet_password: newWalletPassword }); } catch (e) {}
    } else {
      try { await base44.auth.updateMe({ wallet_password: newWalletPassword }); } catch (e) {}
    }

    setSetPasswordDialog(false);
    setNewWalletPassword("");
    setConfirmWalletPassword("");
    alert("✅ Wallet PIN set successfully!");
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    
    if (user?.wallet_frozen) {
      alert("⚠️ Your wallet is currently frozen. Please contact admin.");
      return;
    }
    
    const amount = parseFloat(withdrawalForm.amount);
    if (!amount || amount < minWithdrawal) {
      alert(`⚠️ Minimum withdrawal: ₹${minWithdrawal}`);
      return;
    }
    if (amount > walletBalance) {
      alert("⚠️ Insufficient balance!");
      return;
    }
    if (!withdrawalForm.bank_name || !withdrawalForm.account_holder || !withdrawalForm.account_number || !withdrawalForm.ifsc_code) {
      alert("⚠️ Fill all fields");
      return;
    }

    try {
      const existingPending = withdrawals.filter(w => w.status === 'pending');
      const totalPendingAmt = existingPending.reduce((sum, w) => sum + Number(w.amount || 0), 0);
      if (totalPendingAmt + amount > rawBalance) {
        alert("⚠️ Insufficient balance! You already have pending withdrawals.");
        return;
      }

      await base44.entities.WithdrawalRequest.create({
        user_id: user.id,
        amount: amount,
        bank_name: withdrawalForm.bank_name,
        account_holder: withdrawalForm.account_holder,
        account_number: withdrawalForm.account_number,
        ifsc_code: withdrawalForm.ifsc_code,
        status: "pending"
      });

      const newLockedBalance = Math.max(0, (user?.wallet_balance || 0) - amount);
      const userSource = localStorage.getItem('workden_user_source');
      if (userSource === 'appuser') {
        await base44.entities.AppUser.update(user.id, { wallet_balance: newLockedBalance });
      } else {
        await base44.entities.User.update(user.id, { wallet_balance: newLockedBalance });
      }

      alert("✅ Withdrawal request submitted! Amount locked from balance.");
      setWithdrawalDialog(false);
      setWithdrawalForm({ amount: "", bank_name: "", account_holder: "", account_number: "", ifsc_code: "" });
      loadUser();
    } catch (error) {
      alert("❌ Failed to submit. Try again.");
    }
  };

  // ── PIN GATE ──
  if (!walletUnlocked) {
    return (
      <div className="wallet-root">
        <style>{styles}</style>
        <div className="pin-gate">
          <div className="pin-card">
            <div className="pin-header">
              <div className="pin-icon-wrap">
                <WalletIcon size={32} color="#fff" />
              </div>
              <h1 className="pin-title">My Wallet</h1>
              <p className="pin-subtitle">Secure access to your earnings</p>
            </div>

            <div className="pin-body">
              {user?.wallet_password ? (
                <>
                  <div className="info-box">
                    <KeyRound size={24} color="#6b7280" className="ib-icon" />
                    <p className="ib-title">Wallet is PIN protected</p>
                    <p className="ib-sub">Enter your PIN to continue</p>
                  </div>
                  <div className="pin-input-wrap">
                    <input
                      className="pin-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="● ● ● ●"
                      value={walletPassword}
                      onChange={(e) => setWalletPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleWalletUnlock(); }}
                      maxLength={10}
                      autoFocus
                    />
                    <button className="pin-eye" type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button className="btn-primary" onClick={handleWalletUnlock}>
                    <Lock size={16} /> Unlock Wallet
                  </button>
                </>
              ) : (
                <div>
                  <div className="info-box warn">
                    <AlertTriangle size={24} color="#d97706" className="ib-icon" />
                    <p className="ib-title">No PIN set yet</p>
                    <p className="ib-sub">Set a PIN to protect your wallet</p>
                  </div>
                  <button className="btn-primary" onClick={() => {
                    setWalletUnlocked(true);
                    setTimeout(() => setSetPasswordDialog(true), 500);
                  }}>
                    <WalletIcon size={16} /> Enter Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Dialog open={setPasswordDialog} onOpenChange={setSetPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Wallet PIN</DialogTitle>
              <DialogDescription>Protect your wallet with a PIN (min 4 digits)</DialogDescription>
            </DialogHeader>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div><label className="dialog-label">New PIN (min 4 digits)</label><input className="dialog-input" type="password" value={newWalletPassword} onChange={(e) => setNewWalletPassword(e.target.value)} placeholder="Enter new PIN" /></div>
              <div><label className="dialog-label">Confirm PIN</label><input className="dialog-input" type="password" value={confirmWalletPassword} onChange={(e) => setConfirmWalletPassword(e.target.value)} placeholder="Re-enter PIN" onKeyDown={(e) => e.key === 'Enter' && handleSetWalletPassword()} /></div>
            </div>
            <DialogFooter>
              <button className="btn-dialog-ghost" onClick={() => { setSetPasswordDialog(false); setNewWalletPassword(""); setConfirmWalletPassword(""); }}>Cancel</button>
              <button className="btn-dialog-primary" onClick={handleSetWalletPassword}>Save PIN</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── MAIN WALLET UI ──
  return (
    <div className="wallet-root">
      <style>{styles}</style>
      <div className="wallet-inner">

        {/* Page Header */}
        <div className="page-header">
          <div className="header-row">
            <div>
              <h1>My Wallet</h1>
              <p>Earnings & withdrawals</p>
            </div>
            <button className="btn-ghost" onClick={() => { setWalletUnlocked(false); setWalletPassword(""); }}>
              <Lock size={14} /> Lock
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="balance-card">
          <p className="balance-label">Available Balance</p>
          <p className="balance-amount"><span>₹</span>{Number(walletBalance || 0).toFixed(2)}</p>
          <p className="balance-sub">Updated just now · WorkDen Wallet</p>
          <div className="balance-actions">
            <button
              className="btn-withdraw"
              onClick={() => setWithdrawalDialog(true)}
              disabled={walletBalance < minWithdrawal || user?.wallet_frozen}
            >
              <ArrowDownCircle size={16} /> Withdraw Funds
            </button>
            <button className="btn-icon" onClick={() => setSetPasswordDialog(true)} title="Change PIN">
              <KeyRound size={18} />
            </button>
          </div>
          {user?.wallet_frozen ? (
            <div className="frozen-bar"><Lock size={14} /> Wallet frozen by admin. Contact support.</div>
          ) : walletBalance < minWithdrawal && (
            <div className="min-bar"><AlertTriangle size={14} /> Minimum ₹{minWithdrawal} required for withdrawal</div>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap" style={{background:'#eff6ff'}}><TrendingUp size={18} color="#3b82f6" /></div>
            <p className="stat-label">Total Earned</p>
            <p className="stat-value">₹{Number(totalEarnings || 0).toFixed(0)}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap" style={{background:'#f0fdf4'}}><CheckCircle size={18} color="#10b981" /></div>
            <p className="stat-label">Task Earnings</p>
            <p className="stat-value">₹{Number(taskEarnings || 0).toFixed(0)}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap" style={{background:'#fffbeb'}}><Clock size={18} color="#f59e0b" /></div>
            <p className="stat-label">Pending</p>
            <p className="stat-value">₹{Number(pendingBalance || 0).toFixed(0)}</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap" style={{background:'#fef2f2'}}><TrendingDown size={18} color="#ef4444" /></div>
            <p className="stat-label">Withdrawn</p>
            <p className="stat-value">₹{Number(totalWithdrawalsDisplay || 0).toFixed(0)}</p>
            {pendingWithdrawalsTotal > 0 && <p className="stat-extra">₹{Number(pendingWithdrawalsTotal || 0).toFixed(0)} pending</p>}
          </div>
        </div>

        {/* Trust Bar */}
        <div className="trust-bar">
          <Shield size={18} className="tb-icon" />
          <div>
            <p>Balance is credited only after task approval by admin. Each withdrawal is eligible for up to <strong>₹100 cashback</strong>.</p>
          </div>
        </div>

        {/* Transactions */}
        <div className="section-card">
          <div className="section-head">
            <h3>Transaction History</h3>
            <span>{transactions.length} records</span>
          </div>
          <div className="section-body">
            {transactions.length > 0 ? (
              <div className="txn-list">
                {sortedTxns.slice(0, 20).map(txn => (
                  <div key={txn.id} className="txn-item">
                    <div className={`txn-icon ${txn.transaction_type === 'credit' ? 'credit' : 'debit'}`}>
                      {txn.transaction_type === 'credit'
                        ? <ArrowUpCircle size={18} color="#059669" />
                        : <ArrowDownCircle size={18} color="#dc2626" />}
                    </div>
                    <div className="txn-info">
                      <p className="txn-reason">{txn.reason || 'Transaction'}</p>
                      <p className="txn-meta">{new Date(txn.timestamp).toLocaleString()}</p>
                      <p className="txn-balance-trail">₹{Number(txn.old_balance || 0).toFixed(2)} → ₹{Number(txn.new_balance || 0).toFixed(2)}</p>
                    </div>
                    <div className="txn-amount-col">
                      <p className={`txn-amount ${txn.transaction_type === 'credit' ? 'credit' : 'debit'}`}>
                        {txn.transaction_type === 'credit' ? '+' : '-'}₹{Number(txn.amount || 0).toFixed(2)}
                      </p>
                      <span className={`txn-badge ${txn.transaction_type === 'credit' ? 'credit' : 'debit'}`}>
                        {txn.transaction_type === 'credit' ? 'Credit' : 'Debit'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <DollarSign size={40} className="es-icon" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal Requests */}
        <div className="section-card">
          <div className="section-head">
            <h3>Withdrawal Requests</h3>
            <span>{withdrawals.length} requests</span>
          </div>
          <div className="section-body">
            {withdrawals.length > 0 ? (
              <div>
                {withdrawals.map(w => (
                  <div key={w.id} className="wd-item">
                    <div className="wd-top">
                      <div>
                        <p className="wd-amount">₹{w.amount}</p>
                        <p className="wd-bank">{w.bank_name}</p>
                        <p className="wd-acc">A/c: {w.account_number} &nbsp;·&nbsp; IFSC: {w.ifsc_code}</p>
                        <p className="wd-date">{new Date(w.created_date).toLocaleString()}</p>
                      </div>
                      <span className={`status-pill ${w.status}`}>{w.status}</span>
                    </div>
                    {w.rejection_reason && (
                      <div className="wd-reject"><strong>Reason:</strong> {w.rejection_reason}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Banknote size={40} className="es-icon" />
                <p>No withdrawal requests yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Change PIN Dialog */}
        <Dialog open={setPasswordDialog} onOpenChange={setSetPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Wallet PIN</DialogTitle>
              <DialogDescription>Set a new PIN to protect your wallet balance</DialogDescription>
            </DialogHeader>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div><label className="dialog-label">New PIN (min 4 digits)</label><input className="dialog-input" type="password" value={newWalletPassword} onChange={(e) => setNewWalletPassword(e.target.value)} placeholder="Enter new PIN" /></div>
              <div><label className="dialog-label">Confirm PIN</label><input className="dialog-input" type="password" value={confirmWalletPassword} onChange={(e) => setConfirmWalletPassword(e.target.value)} placeholder="Re-enter PIN" onKeyDown={(e) => e.key === 'Enter' && handleSetWalletPassword()} /></div>
            </div>
            <DialogFooter>
              <button className="btn-dialog-ghost" onClick={() => { setSetPasswordDialog(false); setNewWalletPassword(""); setConfirmWalletPassword(""); }}>Cancel</button>
              <button className="btn-dialog-primary" onClick={handleSetWalletPassword}>Save PIN</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Withdrawal Dialog */}
        <Dialog open={withdrawalDialog} onOpenChange={setWithdrawalDialog}>
          <DialogContent style={{maxWidth:440, maxHeight:'90vh', overflowY:'auto'}}>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
              <DialogDescription>Min ₹{minWithdrawal} · Processing: 24–48 hours</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleWithdrawalSubmit}>
              <div style={{display:'flex',flexDirection:'column',gap:0}}>
                <div className="dialog-field"><label className="dialog-label">Amount (₹)</label><input className="dialog-input" type="number" value={withdrawalForm.amount} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })} placeholder={`${minWithdrawal}`} min={minWithdrawal} required /></div>
                <div className="dialog-field"><label className="dialog-label">Bank Name</label><select className="dialog-select" value={withdrawalForm.bank_name} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, bank_name: e.target.value })} required><option value="">Select Bank</option>{INDIAN_BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}</select></div>
                <div className="dialog-field"><label className="dialog-label">Account Holder Name</label><input className="dialog-input" value={withdrawalForm.account_holder} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, account_holder: e.target.value })} required /></div>
                <div className="dialog-field"><label className="dialog-label">Account Number</label><input className="dialog-input" value={withdrawalForm.account_number} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, account_number: e.target.value })} required /></div>
                <div className="dialog-field"><label className="dialog-label">IFSC Code</label><input className="dialog-input" value={withdrawalForm.ifsc_code} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, ifsc_code: e.target.value.toUpperCase() })} required /></div>
              </div>
              <DialogFooter style={{marginTop:8}}>
                <button type="button" className="btn-dialog-ghost" onClick={() => setWithdrawalDialog(false)}>Cancel</button>
                <button type="submit" className="btn-dialog-primary">Submit Request</button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}