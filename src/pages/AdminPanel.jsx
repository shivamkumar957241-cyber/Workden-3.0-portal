import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, CheckCircle, XCircle, DollarSign, Bell, Plus, Trash2, Edit, Shield, Eye, Wallet, Image, ArrowLeft, Search, Clock, CreditCard, UserCheck, UserPlus, Play, BarChart3, GraduationCap, FileText, Download, Ticket, MessageSquare, Star, Copy, RefreshCw, Link2, Gift, Calendar, Video, Phone, Monitor } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RecruiterDashboardDialog from "@/components/admin/RecruiterDashboardDialog"; import InvoicesTab from "@/components/admin/InvoicesTab"; import FeedbacksTab from "@/components/admin/FeedbacksTab"; import HolidaysTab from "@/components/admin/HolidaysTab"; import SupportQueriesTab from "@/components/admin/SupportQueriesTab"; import SettingsTab from "@/components/admin/SettingsTab"; import SignatureSubmissionsTab from "@/components/admin/SignatureSubmissionsTab"; import DeviceTrackingTab from "@/components/admin/DeviceTrackingTab"; import ActivityTab from "@/components/admin/ActivityTab"; import BannersTab from "@/components/admin/BannersTab"; import SendNotificationDialog from "@/components/admin/SendNotificationDialog"; import WithdrawalsTab from "@/components/admin/WithdrawalsTab";
const generateTxnId = () => 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");
  const [taskDialog, setTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [idVerificationSearch, setIdVerificationSearch] = useState("");
  const queryClient = useQueryClient();
  const [walletSearchQuery, setWalletSearchQuery] = useState("");
  const [selectedProofs, setSelectedProofs] = useState([]);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [newUsersFilter, setNewUsersFilter] = useState('last7days');
  const [usersFilter, setUsersFilter] = useState('all');
  const [proofsSearchQuery, setProofsSearchQuery] = useState("");
  const [proofsDateFilter, setProofsDateFilter] = useState("all");
  const [customProofsDateRange, setCustomProofsDateRange] = useState({ start: "", end: "" });
  const [loginAttemptsSearch, setLoginAttemptsSearch] = useState("");
  const [loginAttemptsFilter, setLoginAttemptsFilter] = useState("all");
  const [customLoginDateRange, setCustomLoginDateRange] = useState({ start: "", end: "" });
  const [taskForm, setTaskForm] = useState({ name: "", description: "", reward: 0, page_route: "" });
  const [notificationForm, setNotificationForm] = useState({ title: "", message: "" });
  const [editUserForm, setEditUserForm] = useState({ full_name: "", email: "", phone: "" });
  const [walletAdjustForm, setWalletAdjustForm] = useState({ user_id: "", amount: 0, reason: "", operation: "add" });
  const [recruiterDialog, setRecruiterDialog] = useState(false);
  const [recruiterForm, setRecruiterForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [editingRecruiter, setEditingRecruiter] = useState(null);
  const [adminFileLink, setAdminFileLink] = useState("");
  const [userTaskViewSearch, setUserTaskViewSearch] = useState("");
  const [userTaskViewDateFilter, setUserTaskViewDateFilter] = useState("all");
  const [selectedUserTasks, setSelectedUserTasks] = useState(null);
  const [userTasksDialog, setUserTasksDialog] = useState(false);
  const [taskViewType, setTaskViewType] = useState("approved");
  const [filePreviewDialog, setFilePreviewDialog] = useState(false); const [previewFile, setPreviewFile] = useState(null);
  const [recruiterUsersDialog, setRecruiterUsersDialog] = useState(false);
  const [selectedRecruiterUsers, setSelectedRecruiterUsers] = useState(null);
  const [idVerificationFilter, setIdVerificationFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [customSubscriptionDateRange, setCustomSubscriptionDateRange] = useState({ start: "", end: "" });
  const [newUsersSearch, setNewUsersSearch] = useState("");
  const [userHistorySearch, setUserHistorySearch] = useState(""); const [userHistoryData, setUserHistoryData] = useState(null);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityDateFilter, setActivityDateFilter] = useState("all");
  const [activityTaskType, setActivityTaskType] = useState("all");
  const [activityStatus, setActivityStatus] = useState("all");
  const [recruiterLoginDialog, setRecruiterLoginDialog] = useState(false); const [selectedRecruiterForLogin, setSelectedRecruiterForLogin] = useState(null);
  const [recruiterDashboardFilter, setRecruiterDashboardFilter] = useState("all"); const [recruiterCustomDateRange, setRecruiterCustomDateRange] = useState({ start: "", end: "" });
  const [selectedMonth, setSelectedMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`);
  const [holidayDialog, setHolidayDialog] = useState(false); const [holidayForm, setHolidayForm] = useState({ holiday_name: "", holiday_date: "", message: "", emoji: "🎉" }); const [editingHoliday, setEditingHoliday] = useState(null);
  const [validationDetailDialog, setValidationDetailDialog] = useState(false); const [selectedValidationReport, setSelectedValidationReport] = useState(null); const [userHistoryDialog, setUserHistoryDialog] = useState(false);

  const { data: users = [] } = useQuery({ queryKey: ['all-users'], queryFn: () => base44.entities.User.list(), placeholderData: [], refetchInterval: 10000 });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list(), placeholderData: [] });
  const { data: proofs = [] } = useQuery({ queryKey: ['all-proofs'], queryFn: () => base44.entities.Proof.list('-created_date'), placeholderData: [], refetchInterval: 5000 });
  const { data: withdrawals = [] } = useQuery({ queryKey: ['withdrawals'], queryFn: () => base44.entities.WithdrawalRequest.list('-requested_date'), placeholderData: [], refetchInterval: 10000 });
  const { data: notifications = [] } = useQuery({ queryKey: ['all-notifications'], queryFn: () => base44.entities.Notification.list('-created_date'), placeholderData: [] });
  const { data: walletTransactions = [] } = useQuery({ queryKey: ['wallet-transactions'], queryFn: () => base44.entities.WalletTransaction.list('-timestamp'), placeholderData: [], refetchInterval: 15000 });
  const { data: globalSettings = [] } = useQuery({ queryKey: ['global-settings'], queryFn: () => base44.entities.GlobalSettings.list(), placeholderData: [] });
  const { data: subscriptionPayments = [] } = useQuery({ queryKey: ['subscription-payments'], queryFn: () => base44.entities.SubscriptionPayment.list('-created_date'), placeholderData: [], refetchInterval: 10000 });
  const { data: trainingVideos = [] } = useQuery({ queryKey: ['training-videos'], queryFn: () => base44.entities.TrainingVideo.list(), placeholderData: [] });
  const { data: recruiters = [] } = useQuery({ queryKey: ['recruiters'], queryFn: () => base44.entities.Recruiter.list(), placeholderData: [], refetchInterval: 10000 });
  const { data: appUsers = [] } = useQuery({ queryKey: ['all-app-users'], queryFn: () => base44.entities.AppUser.list('-created_date', 200), placeholderData: [], refetchInterval: 10000 });
  const { data: taskActivityLogs = [] } = useQuery({ queryKey: ['task-activity'], queryFn: () => base44.entities.TaskActivityLog.list('-start_time'), placeholderData: [], refetchInterval: 8000 });
  const { data: loginAttempts = [] } = useQuery({ queryKey: ['login-attempts'], queryFn: () => base44.entities.LoginAttempt.list('-login_time'), placeholderData: [], refetchInterval: 5000 });
  const { data: savedReplies = [] } = useQuery({ queryKey: ['saved-replies'], queryFn: () => base44.entities.SavedRejectionReply.list('order'), placeholderData: [] });
  const { data: helpTickets = [] } = useQuery({ queryKey: ['help-tickets'], queryFn: () => base44.entities.HelpTicket.list('-created_date'), placeholderData: [], refetchInterval: 10000 });
  const { data: userFeedbacks = [] } = useQuery({ queryKey: ['user-feedbacks'], queryFn: () => base44.entities.UserFeedback.list('-created_date'), placeholderData: [], refetchInterval: 15000 });
  const { data: appreciationBonuses = [] } = useQuery({ queryKey: ['appreciation-bonuses'], queryFn: () => base44.entities.AppreciationBonus.list('-created_date'), placeholderData: [], refetchInterval: 10000 });
  const { data: holidays = [] } = useQuery({ queryKey: ['holidays'], queryFn: () => base44.entities.Holiday.list('holiday_date'), placeholderData: [] });
  const { data: referralPartners = [] } = useQuery({ queryKey: ['referral-partners'], queryFn: () => base44.entities.ReferralPartner.list('-created_date'), placeholderData: [], refetchInterval: 10000 });
  const { data: callRequests = [] } = useQuery({ queryKey: ['call-requests'], queryFn: () => base44.entities.CallRequest.list('-created_date'), placeholderData: [], refetchInterval: 10000 });
  useEffect(() => {
    const existingAdminFileSetting = globalSettings.find(s => s.setting_key === 'admin_files');
    if (existingAdminFileSetting) setAdminFileLink(existingAdminFileSetting.setting_value);
  }, [globalSettings]);

  const createTaskMutation = useMutation({ mutationFn: (data) => base44.entities.Task.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setTaskDialog(false); setTaskForm({ name: "", description: "", reward: 0, page_route: "" }); alert("✅ Created!"); } });
  const updateTaskMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Task.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setTaskDialog(false); setEditingTask(null); alert("✅ Updated!"); } });
  const deleteTaskMutation = useMutation({ mutationFn: (id) => base44.entities.Task.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); alert("✅ Deleted!"); } });
  const updateUserMutation = useMutation({ mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['all-users'] }); setEditUserDialog(false); setEditingUser(null); alert("✅ Updated!"); } });
  const deleteUserMutation = useMutation({ mutationFn: (userId) => base44.entities.User.delete(userId), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['all-users'] }); setDeleteUserDialog(false); setUserToDelete(null); alert("✅ Deleted!"); } });
  
  const approveProofMutation = useMutation({
    mutationFn: async ({ proofId, proof }) => {
      if (proof.status === 'approved') return; // already approved, no-op
      await base44.entities.Proof.update(proofId, { status: "approved" });
      const rewardAmount = proof.reward_amount || 0;
      // Find in AppUser first (admin-created), then platform User
      let foundUser = null; let isAppUser = false;
      const allAppUsers = await base44.entities.AppUser.list('-created_date', 500);
      const appUserMatch = allAppUsers.find(u => u.id === proof.user_id);
      if (appUserMatch) { foundUser = appUserMatch; isAppUser = true; }
      else { const all = await base44.entities.User.list(); foundUser = all.find(u => u.id === proof.user_id); }
      if (foundUser && rewardAmount > 0) {
        const oldBalance = foundUser.wallet_balance || 0;
        const newBalance = oldBalance + rewardAmount;
        if (isAppUser) { await base44.entities.AppUser.update(foundUser.id, { wallet_balance: newBalance, total_earnings: (foundUser.total_earnings || 0) + rewardAmount }); }
        else { await base44.entities.User.update(foundUser.id, { wallet_balance: newBalance, total_earnings: (foundUser.total_earnings || 0) + rewardAmount, tasks_completed: (foundUser.tasks_completed || 0) + 1 }); }
        await base44.entities.WalletTransaction.create({ txn_id: generateTxnId(), admin_id: 'admin', admin_name: 'Admin', user_id: foundUser.id, user_name: foundUser.full_name || foundUser.email, transaction_type: 'credit', amount: rewardAmount, old_balance: oldBalance, new_balance: newBalance, reason: `Task approved: ${proof.work_type}`, timestamp: new Date().toISOString() });
        await base44.entities.Notification.create({ user_id: foundUser.id, title: "✅ Task Approved!", message: `${proof.work_type} approved! ₹${rewardAmount} credited to your wallet.`, type: "approval" });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['all-proofs', 'all-users', 'wallet-transactions'] }); setSelectedProofs([]); }
  });

  const bulkApproveProofsMutation = useMutation({
    mutationFn: async (proofIds) => {
      for (const proofId of proofIds) {
        const proof = proofs.find(p => p.id === proofId);
        if (proof) await approveProofMutation.mutateAsync({ proofId: proof.id, proof });
      }
    },
    onSuccess: () => { alert(`✅ ${selectedProofs.length} approved!`); setSelectedProofs([]); setBulkActionDialog(false); queryClient.invalidateQueries({ queryKey: ['all-proofs', 'all-users'] }); }
  });

  const bulkRejectProofsMutation = useMutation({
    mutationFn: async ({ proofIds, reason }) => {
      for (const proofId of proofIds) {
        const proof = proofs.find(p => p.id === proofId);
        if (proof) {
          await base44.entities.Proof.update(proof.id, { status: "rejected", rejection_reason: reason });
          await base44.entities.Notification.create({ user_id: proof.user_id, title: "❌ Rejected", message: `"${proof.work_type}" rejected. Reason: ${reason}`, created_date: new Date().toISOString() });
        }
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['all-proofs'] }); alert(`❌ ${selectedProofs.length} rejected!`); setSelectedProofs([]); setBulkActionDialog(false); }
  });
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingProof, setRejectingProof] = useState(null);
  const [customRejectionReason, setCustomRejectionReason] = useState("");
  const [performanceSummary, setPerformanceSummary] = useState("");
  const [perfSummaryViewDialog, setPerfSummaryViewDialog] = useState(false);
  const [viewingPerfSummary, setViewingPerfSummary] = useState(null);
  
  const rejectProofMutation = useMutation({ 
    mutationFn: async ({ proofId, reason, summary, proof }) => {
      await base44.entities.Proof.update(proofId, { 
        status: "rejected", 
        rejection_reason: reason,
        performance_summary: summary || ""
      });
      await base44.entities.Notification.create({ 
        user_id: proof.user_id, 
        title: "❌ Task Rejected", 
        message: `"${proof.work_type}" rejected. Reason: ${reason}`, 
        type: "rejection",
        created_date: new Date().toISOString() 
      });
    }, 
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['all-proofs'] }); 
      setSelectedProofs([]); 
      setRejectDialogOpen(false); 
      setRejectingProof(null); 
      setCustomRejectionReason(""); 
      setPerformanceSummary("");
    } 
  });
  
  const approveWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, withdrawal }) => {
  await base44.entities.WithdrawalRequest.update(withdrawalId, { status: "completed" });
  // Balance already deducted at submission time — sirf total_withdrawals update karo
  const allUsers = await base44.entities.User.list();
  const appUsersList = await base44.entities.AppUser.list('-created_date', 500);
  const user = allUsers.find(u => u.id === withdrawal.user_id) || 
               appUsersList.find(u => u.id === withdrawal.user_id);
  const isAppUser = appUsersList.some(u => u.id === withdrawal.user_id);
  if (user) {
    if (isAppUser) {
      await base44.entities.AppUser.update(user.id, { 
        total_withdrawals: (user.total_withdrawals || 0) + withdrawal.amount 
      });
    } else {
      await base44.entities.User.update(user.id, { 
        total_withdrawals: (user.total_withdrawals || 0) + withdrawal.amount 
      });
    }
  }
},
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['withdrawals', 'all-users'] }); alert("✅ Done!"); }
  });
  
  const rejectWithdrawalMutation = useMutation({mutationFn: async ({ id, reason, withdrawal }) => {
  await base44.entities.WithdrawalRequest.update(id, { 
    status: "rejected", rejection_reason: reason 
  });
  // Balance wapas karo kyunki submission par deduct hua tha
  const allUsers = await base44.entities.User.list();
  const appUsersList = await base44.entities.AppUser.list('-created_date', 500);
  const user = allUsers.find(u => u.id === withdrawal.user_id) || 
               appUsersList.find(u => u.id === withdrawal.user_id);
  const isAppUser = appUsersList.some(u => u.id === withdrawal.user_id);
  if (user) {
    const restoredBalance = (user.wallet_balance || 0) + (withdrawal.amount || 0);
    if (isAppUser) {
      await base44.entities.AppUser.update(user.id, { wallet_balance: restoredBalance });
    } else {
      await base44.entities.User.update(user.id, { wallet_balance: restoredBalance });
    }
  }
},
 onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['withdrawals'] }); alert("❌ Rejected!"); } });
  const createNotificationMutation = useMutation({ mutationFn: (data) => base44.entities.Notification.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['all-notifications'] }); setNotificationDialog(false); setNotificationForm({ title: "", message: "" }); alert("✅ Sent!"); } });
  const deleteNotificationMutation = useMutation({ mutationFn: (id) => base44.entities.Notification.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['all-notifications'] }); alert("🗑️ Deleted!"); } });
  
  const verifyIdCardMutation = useMutation({
    mutationFn: async ({ userId, status }) => {
      const updates = { id_verification_status: status };
      if (status === 'verified') updates.status = 'active';
      return await base44.entities.User.update(userId, updates);
    },
    onSuccess: (data, variables) => { queryClient.invalidateQueries({ queryKey: ['all-users'] }); alert(variables.status === 'verified' ? '✅ Verified!' : '❌ Rejected'); }
  });
  
  const adjustWalletMutation = useMutation({
    mutationFn: async ({ userId, amount, operation, reason, adminUser }) => {
      // Try AppUser first, then platform User
      let user = null; let isAppUser = false;
      const allAppUsers = await base44.entities.AppUser.list('-created_date', 500);
      const appUserMatch = allAppUsers.find(u => u.id === userId);
      if (appUserMatch) { user = appUserMatch; isAppUser = true; }
      else { const allUsers = await base44.entities.User.list(); user = allUsers.find(u => u.id === userId); }
      if (!user) throw new Error(`User not found`);
      const currentBalance = user.wallet_balance || 0;
      const currentTotalEarnings = user.total_earnings || 0;
      const amountNum = parseFloat(amount);
      const newBalance = operation === 'add' ? currentBalance + amountNum : Math.max(0, currentBalance - amountNum);
      const newTotalEarnings = operation === 'add' ? currentTotalEarnings + amountNum : currentTotalEarnings;
      if (isAppUser) { await base44.entities.AppUser.update(userId, { wallet_balance: newBalance, total_earnings: newTotalEarnings }); }
      else { await base44.entities.User.update(userId, { wallet_balance: newBalance, total_earnings: newTotalEarnings }); }
      await base44.entities.WalletTransaction.create({
        txn_id: generateTxnId(),
        admin_id: adminUser.id,
        admin_name: adminUser.full_name || adminUser.email,
        user_id: userId,
        user_name: user.full_name || user.email,
        transaction_type: operation === 'add' ? 'credit' : 'debit',
        amount: amountNum,
        old_balance: currentBalance,
        new_balance: newBalance,
        reason: reason || 'Admin adjustment',
        timestamp: new Date().toISOString()
      });
      // Notify user specifically about wallet change
      await base44.entities.Notification.create({
        user_id: userId,
        title: operation === 'add' ? `💰 ₹${amountNum} Added to Wallet` : `💸 ₹${amountNum} Deducted from Wallet`,
        message: `${reason || 'Admin wallet adjustment'}. New Balance: ₹${newBalance.toFixed(2)}`,
        type: operation === 'add' ? 'bonus' : 'info',
      });
      return { newBalance, userName: user.full_name || user.email };
    },
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['all-users', 'wallet-transactions'] }); setWalletAdjustForm({ user_id: "", amount: 0, reason: "", operation: "add" }); alert(`✅ ${data.userName}: ₹${data.newBalance.toFixed(2)}`); }
  });

  const pendingProofs = proofs.filter(p => p.status === 'pending').length; const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  
  const getFilteredNewUsers = () => {
    const now = new Date();
    let cutoffDate = new Date();
    if (newUsersFilter === 'today') {
      cutoffDate.setHours(0, 0, 0, 0);
    } else if (newUsersFilter === 'yesterday') {
      cutoffDate.setDate(cutoffDate.getDate() - 1);
      cutoffDate.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(cutoffDate);
      endOfYesterday.setHours(23, 59, 59, 999);
      return users.filter(u => {
        const createdDate = new Date(u.created_date);
        return createdDate >= cutoffDate && createdDate <= endOfYesterday && u.role !== 'admin';
      });
    } else if (newUsersFilter === 'last7days') {
      cutoffDate.setDate(cutoffDate.getDate() - 7);
    }
    return users.filter(u => new Date(u.created_date) >= cutoffDate && u.role !== 'admin');
  };
  
  const newUsers = getFilteredNewUsers();
  const idVerificationUsers = users.filter(u => u.id_card_url && u.role !== 'admin');
  const pendingIdVerifications = idVerificationUsers.filter(u => !u.id_verification_status || u.id_verification_status === 'pending').length;
  
  const getFilteredIdVerifications = () => {
    const now = new Date();
    return idVerificationUsers.filter(u => {
      const userDate = new Date(u.created_date);
      if (idVerificationFilter === 'all') return true;
      if (idVerificationFilter === 'last_hour') {
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        return userDate >= oneHourAgo;
      }
      if (idVerificationFilter === 'last_5_hours') {
        const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
        return userDate >= fiveHoursAgo;
      }
      if (idVerificationFilter === 'today') {
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        return userDate >= todayStart;
      }
      if (idVerificationFilter === 'yesterday') {
        const yesterdayStart = new Date(now);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return userDate >= yesterdayStart && userDate <= yesterdayEnd;
      }
      return true;
    });
  };
  
  const getFilteredSubscriptions = () => {
    const now = new Date();
    return subscriptionPayments.filter(payment => {
      const searchLower = subscriptionSearch.toLowerCase();
      const matchesSearch = !subscriptionSearch || 
        payment.user_name?.toString().toLowerCase().includes(searchLower) || 
        payment.mobile?.toString().toLowerCase().includes(searchLower) ||
        payment.transaction_id?.toString().toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
      
      const paymentDate = new Date(payment.created_date);
      if (subscriptionFilter === 'all') return true;
      if (subscriptionFilter === 'last_hour') {
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        return paymentDate >= oneHourAgo;
      }
      if (subscriptionFilter === 'today') {
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        return paymentDate >= todayStart;
      }
      if (subscriptionFilter === 'yesterday') {
        const yesterdayStart = new Date(now);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return paymentDate >= yesterdayStart && paymentDate <= yesterdayEnd;
      }
      if (subscriptionFilter === 'custom' && customSubscriptionDateRange.start && customSubscriptionDateRange.end) {
        const startDate = new Date(customSubscriptionDateRange.start);
        const endDate = new Date(customSubscriptionDateRange.end);
        return paymentDate >= startDate && paymentDate <= endDate;
      }
      return true;
    });
  };
  
  const filteredNewUsers = newUsers.filter(u => {
    const searchLower = newUsersSearch.toLowerCase();
    return !newUsersSearch || 
      u.full_name?.toString().toLowerCase().includes(searchLower) || 
      u.email?.toString().toLowerCase().includes(searchLower) || 
      u.user_id?.toString().toLowerCase().includes(searchLower);
  });
  
  const handleUserHistorySearch = async () => {
    if (!userHistorySearch.trim()) {
      alert("Enter User ID or Password");
      return;
    }
    
    const searchValue=userHistorySearch.trim();
    const allSearchUsers=[...users,...appUsers.filter(au=>!users.some(u=>u.login_user_id===au.login_user_id))];
    const foundUser=allSearchUsers.find(u=>u.login_user_id===searchValue||u.login_password===searchValue||u.user_id===searchValue||u.email===searchValue||u.phone===searchValue);
    
    if (!foundUser) {
      alert("User not found!");
      return;
    }
    
    const userProofs = proofs.filter(p => p.user_id === foundUser.id);
    const userWithdrawals = withdrawals.filter(w => w.user_id === foundUser.id);
    const userTransactions = walletTransactions.filter(t => t.user_id === foundUser.id);
    const userActivities = taskActivityLogs.filter(l => l.user_id === foundUser.id);
    
    setUserHistoryData({
      user: foundUser,
      proofs: userProofs,
      withdrawals: userWithdrawals,
      transactions: userTransactions,
      activities: userActivities
    });
    
    setUserHistoryDialog(true);
  };
  
  const filteredUsers = users.filter(u => {
    const searchLower = userSearch.toLowerCase();
    const matchesSearch = u.full_name?.toString().toLowerCase().includes(searchLower) || u.email?.toString().toLowerCase().includes(searchLower) || u.user_id?.toString().toLowerCase().includes(searchLower);
    if (usersFilter === 'all') return matchesSearch;
    const now = new Date();
    const userDate = new Date(u.last_active || u.created_date);
    if (usersFilter === 'last_hour') {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      return matchesSearch && userDate >= oneHourAgo;
    }
    if (usersFilter === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      return matchesSearch && userDate >= todayStart;
    }
    if (usersFilter === 'yesterday') {
      const yesterdayStart = new Date(now);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(yesterdayStart);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return matchesSearch && userDate >= yesterdayStart && userDate <= yesterdayEnd;
    }
    return matchesSearch;
  });
  
  const filteredIdVerificationUsers = getFilteredIdVerifications().filter(u => {
    const searchLower = idVerificationSearch.toLowerCase();
    return u.full_name?.toString().toLowerCase().includes(searchLower) || u.email?.toString().toLowerCase().includes(searchLower) || u.user_id?.toString().toLowerCase().includes(searchLower);
  });
  
  const filteredSubscriptionPayments = getFilteredSubscriptions();
  
  // Combine platform users + admin-created AppUsers for wallet management
  const allWalletUsers = [
    ...users.filter(u => u.role !== 'admin'),
    ...appUsers.filter(au => au.role !== 'admin' && !users.some(u => u.login_user_id === au.login_user_id))
  ];
  const filteredWalletUsers = allWalletUsers.filter(u => u.full_name?.toString().toLowerCase().includes(walletSearchQuery.toLowerCase()) || u.email?.toString().toLowerCase().includes(walletSearchQuery.toLowerCase()) || u.login_user_id?.toString().toLowerCase().includes(walletSearchQuery.toLowerCase()));
  const getFilteredProofs = () => {
    const now = new Date();
    return proofs.filter(p => {
      const proofDate = new Date(p.submitted_date || p.created_date);

      if (proofsDateFilter === 'all') return true;

      if (proofsDateFilter === 'last_hour') {
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        return proofDate >= oneHourAgo;
      }

      if (proofsDateFilter === 'today') {
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        return proofDate >= todayStart;
      }

      if (proofsDateFilter === 'yesterday') {
        const yesterdayStart = new Date(now);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return proofDate >= yesterdayStart && proofDate <= yesterdayEnd;
      }

      if (proofsDateFilter === 'before_7pm') {
        const today7pm = new Date(now);
        today7pm.setHours(19, 0, 0, 0);
        return proofDate < today7pm;
      }

      if (proofsDateFilter === 'custom' && customProofsDateRange.start && customProofsDateRange.end) {
        const startDate = new Date(customProofsDateRange.start);
        const endDate = new Date(customProofsDateRange.end);
        return proofDate >= startDate && proofDate <= endDate;
      }

      return true;
    });
  };

  const filteredProofsList = getFilteredProofs();
  const pendingProofsList = filteredProofsList.filter(p => p.status === 'pending');
  const pendingSubscriptions = subscriptionPayments.filter(s => s.status === 'pending').length;

  const handleTaskSubmit = () => { if (!taskForm.name || !taskForm.reward) { alert("Fill all"); return; } editingTask ? updateTaskMutation.mutate({ id: editingTask.id, data: taskForm }) : createTaskMutation.mutate(taskForm); };
  const handleEditUser = (user) => { setEditingUser(user); setEditUserForm({ full_name: user.full_name || "", email: user.email || "", phone: user.phone || "" }); setEditUserDialog(true); };
  
  const handleWalletAdjust = async () => {
    if (!walletAdjustForm.user_id || !walletAdjustForm.amount || !walletAdjustForm.reason.trim()) { alert("⚠️ Fill all fields (user, amount, reason)"); return; }
    let adminUser = { id: 'admin', full_name: 'Admin', email: 'admin' };
    try {
      const savedUser = localStorage.getItem('workden_3_user');
      if (savedUser) { const u = JSON.parse(savedUser); adminUser = { id: u.id || 'admin', full_name: u.full_name || 'Admin', email: u.email || 'admin' }; }
    } catch (e) {}
    try { const me = await base44.auth.me(); if (me) adminUser = me; } catch (e) {}
    adjustWalletMutation.mutate({ userId: walletAdjustForm.user_id, amount: walletAdjustForm.amount, operation: walletAdjustForm.operation, reason: walletAdjustForm.reason, adminUser });
  };

  const handleBulkAction = (action) => {
    if (selectedProofs.length === 0) { alert("⚠️ Select proofs"); return; }
    setBulkAction(action);
    setBulkActionDialog(true);
  };

  const executeBulkAction = () => {
    if (bulkAction === 'approve') {
      bulkApproveProofsMutation.mutate(selectedProofs);
    } else if (bulkAction === 'reject') {
      const reason = prompt("Reason:");
      if (reason) bulkRejectProofsMutation.mutate({ proofIds: selectedProofs, reason });
      else setBulkActionDialog(false);
    }
  };

  const toggleProofSelection = (proofId) => { setSelectedProofs(prev => prev.includes(proofId) ? prev.filter(id => id !== proofId) : [...prev, proofId]); };
  const toggleSelectAll = () => { setSelectedProofs(selectedProofs.length === pendingProofsList.length ? [] : pendingProofsList.map(p => p.id)); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-24">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}><Button variant="outline" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div><h1 className="text-3xl font-bold">Admin Panel</h1></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white"><CardContent className="p-4"><Users className="w-8 h-8 mb-2" /><p className="text-xs">Users</p><p className="text-2xl font-bold">{[...users.filter(u=>u.role!=='admin'),...appUsers.filter(au=>au.role!=='admin'&&!users.some(u=>u.login_user_id===au.login_user_id))].length}</p></CardContent></Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white"><CardContent className="p-4"><CheckCircle className="w-8 h-8 mb-2" /><p className="text-xs">Subscribed</p><p className="text-2xl font-bold">{[...users.filter(u=>u.is_subscribed&&u.role!=='admin'),...appUsers.filter(au=>au.is_subscribed&&au.role!=='admin'&&!users.some(u=>u.login_user_id===au.login_user_id))].length}</p></CardContent></Card>
          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white"><CardContent className="p-4"><Users className="w-8 h-8 mb-2" /><p className="text-xs">New</p><p className="text-2xl font-bold">{newUsers.length}</p></CardContent></Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white"><CardContent className="p-4"><CheckCircle className="w-8 h-8 mb-2" /><p className="text-xs">Pending</p><p className="text-2xl font-bold">{pendingProofs}</p></CardContent></Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white"><CardContent className="p-4"><Image className="w-8 h-8 mb-2" /><p className="text-xs">ID</p><p className="text-2xl font-bold">{pendingIdVerifications}</p></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-max">
              <TabsTrigger value="loginattempts"><UserCheck className="w-4 h-4 mr-1" />Login Attempts</TabsTrigger>
              <TabsTrigger value="usertaskview"><CheckCircle className="w-4 h-4 mr-1" />User Task View</TabsTrigger>
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" />Users</TabsTrigger>
              <TabsTrigger value="recruiters"><UserPlus className="w-4 h-4 mr-1" />Recruiters</TabsTrigger>
              <TabsTrigger value="newusers"><Users className="w-4 h-4 mr-1" />New ({newUsers.length})</TabsTrigger>
              <TabsTrigger value="idverification"><Image className="w-4 h-4 mr-1" />ID ({pendingIdVerifications})</TabsTrigger>
              <TabsTrigger value="tasks"><Briefcase className="w-4 h-4 mr-1" />Tasks</TabsTrigger>
              <TabsTrigger value="proofs"><CheckCircle className="w-4 h-4 mr-1" />Proofs ({pendingProofs})</TabsTrigger>
              <TabsTrigger value="withdrawals"><DollarSign className="w-4 h-4 mr-1" />Withdraw</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1" />Notify</TabsTrigger>
              <TabsTrigger value="wallet"><Wallet className="w-4 h-4 mr-1" />Wallet</TabsTrigger>
              <TabsTrigger value="subscriptions"><CreditCard className="w-4 h-4 mr-1" />Subs ({pendingSubscriptions})</TabsTrigger>
              <TabsTrigger value="settings"><Shield className="w-4 h-4 mr-1" />Settings</TabsTrigger>

              <TabsTrigger value="taskactivity"><Clock className="w-4 h-4 mr-1" />Activity</TabsTrigger>
              <TabsTrigger value="trainingvideos"><GraduationCap className="w-4 h-4 mr-1" />Training Videos</TabsTrigger>
              <TabsTrigger value="userhistory"><Search className="w-4 h-4 mr-1" />User History</TabsTrigger>
              <TabsTrigger value="helptickets"><Ticket className="w-4 h-4 mr-1" />Tickets ({helpTickets.filter(t => t.status === 'open').length})</TabsTrigger>
              <TabsTrigger value="feedbacks"><Star className="w-4 h-4 mr-1" />Feedbacks ({userFeedbacks.length})</TabsTrigger>
              <TabsTrigger value="signatures"><FileText className="w-4 h-4 mr-1" />Signatures</TabsTrigger>
              <TabsTrigger value="holidays"><Calendar className="w-4 h-4 mr-1" />Holidays</TabsTrigger>
              <TabsTrigger value="savedreplies"><MessageSquare className="w-4 h-4 mr-1" />Saved Replies</TabsTrigger>
              <TabsTrigger value="monthlyanalytics"><BarChart3 className="w-4 h-4 mr-1" />Monthly Analytics</TabsTrigger>
              <TabsTrigger value="referralpartners"><Users className="w-4 h-4 mr-1" />Referral Partners ({referralPartners.filter(r => r.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="supportqueries"><MessageSquare className="w-4 h-4 mr-1" />Support & Calls</TabsTrigger>
              <TabsTrigger value="invoices"><FileText className="w-4 h-4 mr-1" />Upload Invoice</TabsTrigger>
              <TabsTrigger value="devicetracking"><Monitor className="w-4 h-4 mr-1" />Device Tracking ({appUsers.filter(u => u.role !== 'admin' && u.is_logged_in).length} active)</TabsTrigger>
              <TabsTrigger value="banners"><Bell className="w-4 h-4 mr-1" />Banners & Alerts</TabsTrigger>
              </TabsList>
          </div>

          <TabsContent value="loginattempts" className="mt-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardTitle>🔐 All Users & Login Details • Real-time</CardTitle>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" variant={loginAttemptsFilter === 'all' ? 'default' : 'outline'} className="bg-white/20 hover:bg-white/30" onClick={() => setLoginAttemptsFilter('all')}>All</Button>
                  <Button size="sm" variant={loginAttemptsFilter === 'last_hour' ? 'default' : 'outline'} className="bg-white/20 hover:bg-white/30" onClick={() => setLoginAttemptsFilter('last_hour')}>Last Hour</Button>
                  <Button size="sm" variant={loginAttemptsFilter === 'today' ? 'default' : 'outline'} className="bg-white/20 hover:bg-white/30" onClick={() => setLoginAttemptsFilter('today')}>Today</Button>
                  <Button size="sm" variant={loginAttemptsFilter === 'yesterday' ? 'default' : 'outline'} className="bg-white/20 hover:bg-white/30" onClick={() => setLoginAttemptsFilter('yesterday')}>Yesterday</Button>
                  <Button size="sm" variant={loginAttemptsFilter === 'custom' ? 'default' : 'outline'} className="bg-white/20 hover:bg-white/30" onClick={() => setLoginAttemptsFilter('custom')}>Custom</Button>
                </div>
                {loginAttemptsFilter === 'custom' && (
                  <div className="flex gap-2 mt-2">
                    <Input type="datetime-local" value={customLoginDateRange.start} onChange={(e) => setCustomLoginDateRange({...customLoginDateRange, start: e.target.value})} className="max-w-xs" />
                    <Input type="datetime-local" value={customLoginDateRange.end} onChange={(e) => setCustomLoginDateRange({...customLoginDateRange, end: e.target.value})} className="max-w-xs" />
                  </div>
                )}
                <Input placeholder="Search by name, email, user ID..." value={loginAttemptsSearch} onChange={(e) => setLoginAttemptsSearch(e.target.value)} className="max-w-md mt-2" />
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Details</TableHead>
                      <TableHead>Login Credentials</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Free Unlock</TableHead>
                      <TableHead>Task Lock</TableHead>
                      <TableHead>Training</TableHead>
                      <TableHead>Recruiter</TableHead>
                      <TableHead>Recruiter Menu</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Combine platform users + admin-created AppUsers
                      const platformUsers = users.filter(u => u.role !== 'admin');
                      const appUserIds = new Set(appUsers.map(au => au.id));
                      // AppUsers not already in platform users
                      const adminCreatedUsers = appUsers.filter(au => au.role !== 'admin');

                      // Merge: use appUsers as primary for admin-created, platform users for rest
                      const allDisplayUsers = [
                        ...platformUsers,
                        ...adminCreatedUsers.filter(au => !platformUsers.some(pu => pu.login_user_id === au.login_user_id))
                      ].sort((a, b) => {
                        const dateA = new Date(a.created_date || a.timestamp || 0).getTime();
                        const dateB = new Date(b.created_date || b.timestamp || 0).getTime();
                        return dateB - dateA;
                      });

                      return allDisplayUsers.filter(u => {
                        const searchLower = loginAttemptsSearch.toLowerCase();
                        const matchesSearch = !loginAttemptsSearch || 
                          u.full_name?.toString().toLowerCase().includes(searchLower) || 
                          u.email?.toString().toLowerCase().includes(searchLower) || 
                          u.login_user_id?.toString().toLowerCase().includes(searchLower) ||
                          u.user_id?.toString().toLowerCase().includes(searchLower);
                        if (!matchesSearch) return false;
                        if (loginAttemptsFilter === 'all') return true;
                        const loginAttempt = loginAttempts.find(l => l.user_id === u.id);
                        if (!loginAttempt) return false;
                        const loginDate = new Date(loginAttempt.login_time);
                        const now = new Date();
                        if (loginAttemptsFilter === 'last_hour') return loginDate >= new Date(now.getTime() - 60*60*1000);
                        if (loginAttemptsFilter === 'today') { const s = new Date(); s.setHours(0,0,0,0); return loginDate >= s; }
                        if (loginAttemptsFilter === 'yesterday') { const s = new Date(now); s.setDate(s.getDate()-1); s.setHours(0,0,0,0); const e = new Date(s); e.setHours(23,59,59,999); return loginDate >= s && loginDate <= e; }
                        if (loginAttemptsFilter === 'custom' && customLoginDateRange.start && customLoginDateRange.end) return loginDate >= new Date(customLoginDateRange.start) && loginDate <= new Date(customLoginDateRange.end);
                        return true;
                      }).map(user => {
                        const isAppUser = appUserIds.has(user.id);
                        const loginAttempt = loginAttempts.find(l => l.user_id === user.id);
                        return (
                          <TableRow key={user.id} className={user.is_subscribed ? 'bg-green-50' : ''}>
                            <TableCell>
                              <div>
                                <p className="font-bold text-sm">{user.full_name || user.email}</p>
                                <p className="text-xs text-gray-500">{user.login_user_id || user.user_id || user.id?.substring(0, 8)}</p>
                                {isAppUser && <Badge className="bg-blue-500 text-white mt-1 text-xs">Admin Created</Badge>}
                                {user.is_subscribed && <Badge className="bg-green-600 text-white mt-1 text-xs ml-1">✓ Subscribed</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-mono font-bold text-blue-600 text-sm">ID: {user.login_user_id || '-'}</p>
                                <p className="font-mono text-gray-700 text-sm">PW: {user.login_password || '-'}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">
                              <p>{user.phone || '-'}</p>
                              <p className="text-gray-500">{user.email || '-'}</p>
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant={user.is_subscribed ? "default" : "outline"}
                                className={user.is_subscribed ? "bg-green-600 h-7 text-xs" : "h-7 text-xs"}
                                onClick={async () => {
                                  const newStatus = !user.is_subscribed;
                                  const now = new Date();
                                  const expiry = new Date(now);
                                  expiry.setFullYear(expiry.getFullYear() + 1);
                                  const subData = newStatus
                                    ? { is_subscribed: true, subscription_activation_date: now.toISOString(), subscription_expiry_date: expiry.toISOString() }
                                    : { is_subscribed: false, is_logged_in: false, session_id: null };
                                  if (isAppUser) {
                                    await base44.entities.AppUser.update(user.id, subData);
                                  } else {
                                    await base44.entities.User.update(user.id, subData);
                                  }
                                  if (loginAttempt) await base44.entities.LoginAttempt.update(loginAttempt.id, { is_subscribed: newStatus });
                                  queryClient.invalidateQueries({ queryKey: ['all-users', 'all-app-users', 'login-attempts'] });
                                  alert(newStatus ? `✅ Subscribed!\nStart: ${now.toLocaleDateString()}\nExpiry: ${expiry.toLocaleDateString()}` : '❌ Unsubscribed!');
                                }}
                              >
                                {user.is_subscribed ? '✓ Active' : 'Activate'}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant={user.free_unlock ? "default" : "outline"} className={user.free_unlock ? "bg-purple-600 text-white h-7 text-xs" : "h-7 text-xs"} onClick={async () => {
                                const newValue = !user.free_unlock;
                                const updateData = { free_unlock: newValue, is_subscribed: newValue ? true : user.is_subscribed, training_access: newValue ? true : user.training_access };
                                if (isAppUser) { await base44.entities.AppUser.update(user.id, updateData); }
                                else { await base44.entities.User.update(user.id, updateData); }
                                queryClient.invalidateQueries({ queryKey: ['all-users', 'all-app-users'] });
                                alert(newValue ? '✅ Free Unlock + Subscription + Training activated!' : '❌ Disabled');
                              }}>{user.free_unlock ? 'ON' : 'OFF'}</Button>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant={user.task_lock_enabled !== false ? "default" : "outline"} className={user.task_lock_enabled !== false ? "bg-green-600 text-white h-7 text-xs" : "h-7 text-xs"} onClick={async () => {
                                if (isAppUser) { await base44.entities.AppUser.update(user.id, { task_lock_enabled: user.task_lock_enabled === false }); }
                                else { await base44.entities.User.update(user.id, { task_lock_enabled: user.task_lock_enabled === false }); }
                                queryClient.invalidateQueries({ queryKey: ['all-users', 'all-app-users'] });
                              }}>{user.task_lock_enabled !== false ? 'ON' : 'OFF'}</Button>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant={user.training_access ? "default" : "outline"} className={user.training_access ? "bg-amber-600 text-white h-7 text-xs" : "h-7 text-xs"} onClick={async () => {
                                if (isAppUser) { await base44.entities.AppUser.update(user.id, { training_access: !user.training_access }); }
                                else { await base44.entities.User.update(user.id, { training_access: !user.training_access }); }
                                queryClient.invalidateQueries({ queryKey: ['all-users', 'all-app-users'] });
                              }}>{user.training_access ? 'ON' : 'OFF'}</Button>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={user.assigned_recruiter_id || ""} 
                                onValueChange={async (recruiterId) => {
                                  const recruiter = recruiters.find(r => r.id === recruiterId);
                                  if (isAppUser) { await base44.entities.AppUser.update(user.id, { assigned_recruiter_id: recruiterId, assigned_recruiter_name: recruiter?.name || '' }); }
                                  else { await base44.entities.User.update(user.id, { assigned_recruiter_id: recruiterId, assigned_recruiter_name: recruiter?.name || '' }); }
                                  if (loginAttempt) await base44.entities.LoginAttempt.update(loginAttempt.id, { assigned_recruiter_id: recruiterId, assigned_recruiter_name: recruiter?.name || '' });
                                  queryClient.invalidateQueries();
                                  alert(`✅ ${user.full_name} assigned to ${recruiter?.name}`);
                                }}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                  {recruiters.filter(r => r.status === 'active').map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell><Button size="sm" variant={user.recruiter_menu_enabled ? "default" : "outline"} className={user.recruiter_menu_enabled ? "bg-teal-600 text-white h-7 text-xs" : "h-7 text-xs"} onClick={async () => { if (isAppUser) { await base44.entities.AppUser.update(user.id, { recruiter_menu_enabled: !user.recruiter_menu_enabled }); } else { await base44.entities.User.update(user.id, { recruiter_menu_enabled: !user.recruiter_menu_enabled }); } queryClient.invalidateQueries({ queryKey: ['all-users', 'all-app-users'] }); }}>{user.recruiter_menu_enabled ? 'ON' : 'OFF'}</Button></TableCell>
                            <TableCell>
                              <p className="text-xs">{loginAttempt ? new Date(loginAttempt.login_time).toLocaleString() : 'Not logged in'}</p>
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                    </TableBody>
                    </Table>
                    {appUsers.filter(au => au.role !== 'admin').length === 0 && users.filter(u => u.role !== 'admin').length === 0 && (
                    <p className="text-center text-gray-500 py-12">No users yet</p>
                    )}
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="users" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant={usersFilter === 'all' ? 'default' : 'outline'} onClick={() => setUsersFilter('all')}>All</Button>
                  <Button size="sm" variant={usersFilter === 'last_hour' ? 'default' : 'outline'} onClick={() => setUsersFilter('last_hour')}>Hour</Button>
                  <Button size="sm" variant={usersFilter === 'today' ? 'default' : 'outline'} onClick={() => setUsersFilter('today')}>Today</Button>
                  <Button size="sm" variant={usersFilter === 'yesterday' ? 'default' : 'outline'} onClick={() => setUsersFilter('yesterday')}>Yesterday</Button>
                </div>
                <Input placeholder="Search..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="max-w-sm mt-2" />
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Login</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {[...filteredUsers.filter(u => u.role !== 'admin'), ...appUsers.filter(au => au.role !== 'admin' && !filteredUsers.some(u => u.login_user_id === au.login_user_id))].map(u => (
                      <TableRow key={u.id}>
                        <TableCell><div><p className="font-medium text-sm">{u.full_name}</p><p className="text-xs text-gray-500">{u.login_user_id || u.user_id}</p>{u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}{u.city && <p className="text-xs text-gray-400">{u.city}</p>}</div></TableCell>
                        <TableCell className="text-sm">{u.email || '-'}</TableCell>
                        <TableCell className="text-xs"><p className="font-mono text-blue-600">{u.login_user_id || '-'}</p><p className="font-mono">{u.login_password || '-'}</p><Badge className={u.is_subscribed ? 'bg-green-600 text-xs mt-1' : 'bg-gray-400 text-xs mt-1'}>{u.is_subscribed ? '✓ Sub' : 'Not Sub'}</Badge></TableCell>
                        <TableCell><div className="flex gap-1">{!appUsers.some(au=>au.id===u.id)&&<Button size="sm" variant="outline" onClick={()=>handleEditUser(u)}><Edit className="w-3 h-3"/></Button>}<Button size="sm" variant="destructive" onClick={async()=>{if(!confirm(`Delete ${u.full_name}?`))return;if(appUsers.some(au=>au.id===u.id)){await base44.entities.AppUser.delete(u.id);queryClient.invalidateQueries({queryKey:['all-app-users']})}else{setUserToDelete(u);setDeleteUserDialog(true)}}}><Trash2 className="w-3 h-3"/></Button></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recruiters" className="mt-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Recruiters ({recruiters.length})</CardTitle>
                <Button onClick={() => { setEditingRecruiter(null); setRecruiterForm({ name: "", email: "", mobile: "", password: "" }); setRecruiterDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add</Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Recruiter</TableHead><TableHead>Contact</TableHead><TableHead>Code</TableHead><TableHead>Users</TableHead><TableHead>Tasks</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {recruiters.map(r => {
                    const recruiterUsers = [
                      ...users.filter(u => String(u.assigned_recruiter_id) === String(r.id) || String(u.created_by_recruiter_id) === String(r.id)),
                      ...appUsers.filter(au => (String(au.assigned_recruiter_id) === String(r.id) || String(au.created_by_recruiter_id) === String(r.id)) && !users.some(u => u.login_user_id === au.login_user_id))
                    ];
                    const approvedTasks = proofs.filter(p => p.status === 'approved' && recruiterUsers.some(u => String(u.id) === String(p.user_id))).length;
                     return (
                       <TableRow key={r.id}>
                         <TableCell><div><p className="font-semibold">{r.name}</p><p className="text-xs">{r.email}</p></div></TableCell>
                         <TableCell className="text-xs"><p>{r.mobile}</p><p>Pass: {r.password}</p></TableCell>
                         <TableCell><Badge variant="outline" className="font-mono">{r.recruiter_code}</Badge></TableCell>
                         <TableCell>
                           <Button size="sm" variant="outline" onClick={() => { setSelectedRecruiterUsers({ recruiter: r, users: recruiterUsers }); setRecruiterUsersDialog(true); }} className="text-xl font-bold text-blue-600 h-auto p-2">
                             {recruiterUsers.length}
                           </Button>
                         </TableCell>
                          <TableCell><p className="text-xl font-bold text-green-600">{approvedTasks}</p></TableCell>
                          <TableCell><Badge variant={r.status === 'active' ? 'default' : 'secondary'}>{r.status}</Badge></TableCell>
                          <TableCell>
                           <div className="flex flex-col gap-1">
                             <div className="flex gap-1">
                               <Button size="sm" variant="outline" className="h-7 bg-teal-50 hover:bg-teal-100 text-teal-700" onClick={() => { 
                                 console.log("🔍 Admin viewing recruiter:", r.name, "ID:", String(r.id));
                                 setSelectedRecruiterForLogin(r); 
                                 setRecruiterLoginDialog(true); 
                               }}>
                                <Eye className="w-3 h-3 mr-1" />View
                               </Button>
                               <Button size="sm" variant="outline" className="h-7" onClick={() => { setEditingRecruiter(r); setRecruiterForm({ name: r.name, email: r.email || '', mobile: r.mobile, password: r.password }); setRecruiterDialog(true); }}><Edit className="w-3 h-3" /></Button>
                               <Button size="sm" variant={r.status === 'active' ? 'secondary' : 'default'} className="h-7 text-xs" onClick={async () => {
                                 await base44.entities.Recruiter.update(r.id, { status: r.status === 'active' ? 'inactive' : 'active' });
                                 queryClient.invalidateQueries({ queryKey: ['recruiters'] });
                               }}>{r.status === 'active' ? 'Off' : 'On'}</Button>
                               <Button size="sm" variant="destructive" className="h-7" onClick={async () => {
                                 if (confirm(`Delete ${r.name}?`)) {
                                   await base44.entities.Recruiter.delete(r.id);
                                   queryClient.invalidateQueries({ queryKey: ['recruiters'] });
                                 }
                               }}><Trash2 className="w-3 h-3" /></Button>
                             </div>

                           </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newusers" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <CardTitle>New Users ({filteredNewUsers.length})</CardTitle>
                  <Select value={newUsersFilter} onValueChange={setNewUsersFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Search by name, email, user ID..." value={newUsersSearch} onChange={(e) => setNewUsersSearch(e.target.value)} className="max-w-md" />
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                   {[...filteredNewUsers,...appUsers.filter(au=>au.role!=='admin'&&!filteredNewUsers.some(u=>u.login_user_id===au.login_user_id)&&(()=>{const now=new Date();let cutoff=new Date();if(newUsersFilter==='today'){cutoff.setHours(0,0,0,0);}else if(newUsersFilter==='last7days'){cutoff.setDate(cutoff.getDate()-7);}else{cutoff.setDate(cutoff.getDate()-1);cutoff.setHours(0,0,0,0);}return new Date(au.created_date)>=cutoff;})())].map(u => (
                                       <TableRow key={u.id}>
                                         <TableCell><div><p className="font-medium">{u.full_name}</p><p className="text-xs text-gray-500">{u.login_user_id||u.user_id}</p></div></TableCell>
                        <TableCell className="text-xs">{new Date(u.created_date).toLocaleString()}</TableCell>
                        <TableCell><Badge variant={u.is_subscribed ? "default" : "secondary"}>{u.is_subscribed ? '✓ Sub' : 'Not Sub'}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="idverification" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>ID Verification ({pendingIdVerifications})</CardTitle>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" variant={idVerificationFilter === 'all' ? 'default' : 'outline'} onClick={() => setIdVerificationFilter('all')}>All</Button>
                  <Button size="sm" variant={idVerificationFilter === 'last_hour' ? 'default' : 'outline'} onClick={() => setIdVerificationFilter('last_hour')}>Last Hour</Button>
                  <Button size="sm" variant={idVerificationFilter === 'last_5_hours' ? 'default' : 'outline'} onClick={() => setIdVerificationFilter('last_5_hours')}>Last 5 Hours</Button>
                  <Button size="sm" variant={idVerificationFilter === 'today' ? 'default' : 'outline'} onClick={() => setIdVerificationFilter('today')}>Today</Button>
                  <Button size="sm" variant={idVerificationFilter === 'yesterday' ? 'default' : 'outline'} onClick={() => setIdVerificationFilter('yesterday')}>Yesterday</Button>
                </div>
                <Input placeholder="Search..." value={idVerificationSearch} onChange={(e) => setIdVerificationSearch(e.target.value)} className="max-w-md mt-2" />
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>User</TableHead><TableHead>ID Card</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredIdVerificationUsers.map(u => (
                      <TableRow key={u.id}>
                        <TableCell><div><p className="font-medium">{u.full_name}</p><p className="text-xs">{u.user_id}</p></div></TableCell>
                        <TableCell><a href={u.id_card_url} target="_blank" className="text-blue-600 text-sm">View</a></TableCell>
                        <TableCell><Badge variant={u.id_verification_status === 'verified' ? 'default' : u.id_verification_status === 'rejected' ? 'destructive' : 'secondary'}>{u.id_verification_status === 'verified' ? '✓' : u.id_verification_status === 'rejected' ? '✗' : '⏳'}</Badge></TableCell>
                        <TableCell>
                          {(!u.id_verification_status || u.id_verification_status === 'pending') && (
                            <div className="flex gap-1">
                              <Button size="sm" className="bg-green-600 h-7" onClick={() => verifyIdCardMutation.mutate({ userId: u.id, status: 'verified' })}>✓</Button>
                              <Button size="sm" variant="destructive" className="h-7" onClick={() => verifyIdCardMutation.mutate({ userId: u.id, status: 'rejected' })}>✗</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Button onClick={() => { setEditingTask(null); setTaskForm({ name: "", description: "", reward: 0, page_route: "" }); setTaskDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add</Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Reward</TableHead><TableHead>Route</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {tasks.map((t, i) => (
                      <TableRow key={t.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="font-bold text-green-600">₹{t.reward}</TableCell>
                        <TableCell className="text-sm">{t.page_route}</TableCell>
                        <TableCell><div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => { setEditingTask(t); setTaskForm({ name: t.name, description: t.description || "", reward: t.reward, page_route: t.page_route || "" }); setTaskDialog(true); }}><Edit className="w-3 h-3" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteTaskMutation.mutate(t.id); }}><Trash2 className="w-3 h-3" /></Button>
                        </div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proofs" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle>Proofs ({pendingProofs})</CardTitle>
                    {selectedProofs.length > 0 && (
                      <div className="flex gap-2">
                        <Badge>{selectedProofs.length} sel</Badge>
                        <Button size="sm" className="bg-green-600 h-7" onClick={() => handleBulkAction('approve')}>✓ All</Button>
                        <Button size="sm" variant="destructive" className="h-7" onClick={() => handleBulkAction('reject')}>✗ All</Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button size="sm" variant={proofsDateFilter === 'all' ? 'default' : 'outline'} onClick={() => setProofsDateFilter('all')}>All</Button>
                    <Button size="sm" variant={proofsDateFilter === 'last_hour' ? 'default' : 'outline'} onClick={() => setProofsDateFilter('last_hour')}>Last Hour</Button>
                    <Button size="sm" variant={proofsDateFilter === 'today' ? 'default' : 'outline'} onClick={() => setProofsDateFilter('today')}>Today</Button>
                    <Button size="sm" variant={proofsDateFilter === 'yesterday' ? 'default' : 'outline'} onClick={() => setProofsDateFilter('yesterday')}>Yesterday</Button>
                    <Button size="sm" variant={proofsDateFilter === 'before_7pm' ? 'default' : 'outline'} onClick={() => setProofsDateFilter('before_7pm')}>Before 7 PM</Button>
                    <Button size="sm" variant={proofsDateFilter === 'custom' ? 'default' : 'outline'} onClick={() => setProofsDateFilter('custom')}>Custom Date</Button>
                  </div>

                  {proofsDateFilter === 'custom' && (
                    <div className="flex gap-2 mb-3">
                      <Input type="datetime-local" value={customProofsDateRange.start} onChange={(e) => setCustomProofsDateRange({...customProofsDateRange, start: e.target.value})} placeholder="Start" />
                      <Input type="datetime-local" value={customProofsDateRange.end} onChange={(e) => setCustomProofsDateRange({...customProofsDateRange, end: e.target.value})} placeholder="End" />
                    </div>
                  )}

                  <Input placeholder="Search..." value={proofsSearchQuery} onChange={(e) => setProofsSearchQuery(e.target.value)} className="max-w-md" />
                </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="w-12">{pendingProofsList.length > 0 && <Checkbox checked={selectedProofs.length === pendingProofsList.length} onCheckedChange={toggleSelectAll} />}</TableHead><TableHead>User</TableHead><TableHead>Work</TableHead><TableHead>File</TableHead><TableHead>Date & Time</TableHead><TableHead>Reward</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredProofsList.filter(p => !proofsSearchQuery || p.user_name?.toString().toLowerCase().includes(proofsSearchQuery.toLowerCase()) || p.work_type?.toString().toLowerCase().includes(proofsSearchQuery.toLowerCase())).map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{p.status === 'pending' && <Checkbox checked={selectedProofs.includes(p.id)} onCheckedChange={() => toggleProofSelection(p.id)} />}</TableCell>
                        <TableCell><div><p className="font-medium text-sm">{p.user_name}</p><p className="text-xs">{p.user_id_number}</p></div></TableCell>
                        <TableCell className="font-semibold text-sm">{p.work_type}</TableCell>
                        <TableCell>{p.file_url && <a href={p.file_url} target="_blank" className="text-blue-600 text-xs">View</a>}</TableCell>
                        <TableCell className="text-xs">
                          <p className="font-semibold">{new Date(p.submitted_date || p.created_date).toLocaleDateString()}</p>
                          <p className="text-gray-600">{new Date(p.submitted_date || p.created_date).toLocaleTimeString()}</p>
                        </TableCell>
                        <TableCell className="font-bold text-green-600">₹{p.reward_amount || 0}</TableCell>
                        <TableCell><Badge variant={p.status === 'approved' ? 'default' : p.status === 'rejected' ? 'destructive' : 'secondary'}>{p.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {p.status === 'pending' && (
                             <div className="flex gap-1">
                               <Button size="sm" className="bg-green-600 h-7" onClick={() => approveProofMutation.mutate({ proofId: p.id, proof: p })}>✓</Button>
                               <Button size="sm" variant="destructive" className="h-7" onClick={() => { setRejectingProof(p); setRejectDialogOpen(true); }}>✗</Button>
                             </div>
                            )}
                            {p.status === 'approved' && (
                              <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { setRejectingProof(p); setCustomRejectionReason(p.rejection_reason || ''); setPerformanceSummary(p.performance_summary || ''); setRejectDialogOpen(true); }}>
                                ✗ Reject
                              </Button>
                            )}
                            {p.status === 'rejected' && (
                              <div className="flex flex-col gap-1">
                                <Button size="sm" className="bg-green-600 h-7 text-xs" onClick={() => approveProofMutation.mutate({ proofId: p.id, proof: p })}>
                                  ✓ Approve
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-orange-300 text-orange-700" onClick={() => { setRejectingProof(p); setCustomRejectionReason(p.rejection_reason || ''); setPerformanceSummary(p.performance_summary || ''); setRejectDialogOpen(true); }}>
                                  ✏ Edit Reason
                                </Button>
                              </div>
                            )}
                            {p.performance_summary && (
                              <Button size="sm" variant="outline" className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => { setViewingPerfSummary(p); setPerfSummaryViewDialog(true); }}>
                                <BarChart3 className="w-3 h-3 mr-1" />Perf. Summary
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usertaskview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>User Task View</CardTitle>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant={userTaskViewDateFilter === 'all' ? 'default' : 'outline'} onClick={() => setUserTaskViewDateFilter('all')}>All</Button>
                  <Button size="sm" variant={userTaskViewDateFilter === 'today' ? 'default' : 'outline'} onClick={() => setUserTaskViewDateFilter('today')}>Today</Button>
                  <Button size="sm" variant={userTaskViewDateFilter === 'yesterday' ? 'default' : 'outline'} onClick={() => setUserTaskViewDateFilter('yesterday')}>Yesterday</Button>
                </div>
                <Input placeholder="Search user..." value={userTaskViewSearch} onChange={(e) => setUserTaskViewSearch(e.target.value)} className="max-w-md mt-2" />
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>User</TableHead><TableHead>Total Tasks</TableHead><TableHead>Approved</TableHead><TableHead>Rejected</TableHead><TableHead>Pending</TableHead><TableHead>Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...users.filter(u=>u.role!=='admin'),...appUsers.filter(au=>au.role!=='admin'&&!users.some(u=>u.login_user_id===au.login_user_id))].filter(u => {
                     const searchLower = userTaskViewSearch.toLowerCase();
                     return !userTaskViewSearch || u.full_name?.toString().toLowerCase().includes(searchLower) || u.email?.toString().toLowerCase().includes(searchLower) || u.user_id?.toString().toLowerCase().includes(searchLower) || u.login_user_id?.toString().toLowerCase().includes(searchLower);
                    }).map(u => {
                      const userProofs = proofs.filter(p => {
                        if (p.user_id !== u.id) return false;
                        if (userTaskViewDateFilter === 'all') return true;
                        const proofDate = new Date(p.created_date);
                        const now = new Date();
                        if (userTaskViewDateFilter === 'today') {
                          const todayStart = new Date(now.setHours(0, 0, 0, 0));
                          return proofDate >= todayStart;
                        }
                        if (userTaskViewDateFilter === 'yesterday') {
                          const yesterdayStart = new Date(now);
                          yesterdayStart.setDate(yesterdayStart.getDate() - 1);
                          yesterdayStart.setHours(0, 0, 0, 0);
                          const yesterdayEnd = new Date(yesterdayStart);
                          yesterdayEnd.setHours(23, 59, 59, 999);
                          return proofDate >= yesterdayStart && proofDate <= yesterdayEnd;
                        }
                        return true;
                      });
                      
                      const approved = userProofs.filter(p => p.status === 'approved').length;
                      const rejected = userProofs.filter(p => p.status === 'rejected').length;
                      const pending = userProofs.filter(p => p.status === 'pending').length;
                      
                      if (userProofs.length === 0 && userTaskViewDateFilter !== 'all') return null;
                      
                      return (
                        <TableRow key={u.id}>
                          <TableCell><div><p className="font-medium">{u.full_name}</p><p className="text-xs text-gray-500">{u.user_id}</p></div></TableCell>
                          <TableCell><p className="text-xl font-bold text-blue-600">{userProofs.length}</p></TableCell>
                          <TableCell>
                            <Button size="sm" className="bg-green-600 h-8 px-3" onClick={() => { setSelectedUserTasks({ user: u, proofs: userProofs.filter(p => p.status === 'approved') }); setTaskViewType('approved'); setUserTasksDialog(true); }}>
                              <CheckCircle className="w-3 h-3 mr-1" />{approved}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="destructive" className="h-8 px-3" onClick={() => { setSelectedUserTasks({ user: u, proofs: userProofs.filter(p => p.status === 'rejected') }); setTaskViewType('rejected'); setUserTasksDialog(true); }}>
                              <XCircle className="w-3 h-3 mr-1" />{rejected}
                            </Button>
                          </TableCell>
                          <TableCell><Badge variant="secondary">{pending}</Badge></TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedUserTasks({ user: u, proofs: userProofs }); setTaskViewType('all'); setUserTasksDialog(true); }}>
                              View All
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }).filter(Boolean)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <WithdrawalsTab
              withdrawals={withdrawals}
              users={users}
              appUsers={appUsers}
              pendingWithdrawals={pendingWithdrawals}
              approveWithdrawalMutation={approveWithdrawalMutation}
              rejectWithdrawalMutation={rejectWithdrawalMutation}
              globalSettings={globalSettings}
            />
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                <Button onClick={() => setNotificationDialog(true)}><Plus className="w-4 h-4 mr-2" />Send</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map(n => (
                  <Card key={n.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between">
                        <div><CardTitle className="text-lg">{n.title}</CardTitle><p className="text-xs text-gray-500">{new Date(n.created_date).toLocaleString()}</p></div>
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) deleteNotificationMutation.mutate(n.id); }}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent><p className="text-sm">{n.message}</p></CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white">
                  <CardTitle className="flex items-center gap-2"><Wallet className="w-6 h-6" />Wallet Management</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Input placeholder="Search user..." value={walletSearchQuery} onChange={(e) => setWalletSearchQuery(e.target.value)} className="border-2 border-purple-200" />
                  <Select value={walletAdjustForm.user_id} onValueChange={(value) => setWalletAdjustForm({ ...walletAdjustForm, user_id: value })}>
                    <SelectTrigger className="border-2 border-purple-200"><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent className="max-h-60">{filteredWalletUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.login_user_id} — ₹{Number(u.wallet_balance || 0).toFixed(2)} {u.login_user_id ? `(${u.login_user_id})` : ''}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={walletAdjustForm.operation} onValueChange={(value) => setWalletAdjustForm({ ...walletAdjustForm, operation: value })}>
                    <SelectTrigger className="border-2 border-purple-200"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="add">➕ Add Money</SelectItem><SelectItem value="deduct">➖ Deduct Money</SelectItem></SelectContent>
                  </Select>
                  <Input type="number" placeholder="Amount (₹)" value={walletAdjustForm.amount || ""} onChange={(e) => setWalletAdjustForm({ ...walletAdjustForm, amount: parseFloat(e.target.value) || 0 })} className="border-2 border-purple-200" />
                  <Textarea placeholder="Reason for transaction..." value={walletAdjustForm.reason} onChange={(e) => setWalletAdjustForm({ ...walletAdjustForm, reason: e.target.value })} rows={2} className="border-2 border-purple-200" />
                  <Button onClick={handleWalletAdjust} className={`w-full h-12 font-bold ${walletAdjustForm.operation === 'add' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'}`}>
                    {walletAdjustForm.operation === 'add' ? '💰 Add Money' : '💸 Deduct Money'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {walletTransactions.slice(0, 30).map(txn => (
                      <div key={txn.id} className={`p-3 rounded-xl border-2 ${txn.transaction_type === 'credit' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-sm">{txn.user_name}</p>
                            <p className="text-xs text-gray-600">{txn.reason}</p>
                          </div>
                          <Badge variant={txn.transaction_type === 'credit' ? 'default' : 'destructive'} className={`${txn.transaction_type === 'credit' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                            {txn.transaction_type === 'credit' ? '+' : '-'}₹{txn.amount}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>By: {txn.admin_name}</span>
                          <span>{new Date(txn.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">New Balance: ₹{Number(txn.new_balance || 0).toFixed(2)}</p>
                      </div>
                    ))}
                    {walletTransactions.length === 0 && (
                      <p className="text-center text-gray-500 py-12">No transactions yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions ({pendingSubscriptions})</CardTitle>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" variant={subscriptionFilter === 'all' ? 'default' : 'outline'} onClick={() => setSubscriptionFilter('all')}>All</Button>
                  <Button size="sm" variant={subscriptionFilter === 'last_hour' ? 'default' : 'outline'} onClick={() => setSubscriptionFilter('last_hour')}>Last Hour</Button>
                  <Button size="sm" variant={subscriptionFilter === 'today' ? 'default' : 'outline'} onClick={() => setSubscriptionFilter('today')}>Today</Button>
                  <Button size="sm" variant={subscriptionFilter === 'yesterday' ? 'default' : 'outline'} onClick={() => setSubscriptionFilter('yesterday')}>Yesterday</Button>
                  <Button size="sm" variant={subscriptionFilter === 'custom' ? 'default' : 'outline'} onClick={() => setSubscriptionFilter('custom')}>Custom</Button>
                </div>
                {subscriptionFilter === 'custom' && (
                  <div className="flex gap-2 mt-2">
                    <Input type="datetime-local" value={customSubscriptionDateRange.start} onChange={(e) => setCustomSubscriptionDateRange({...customSubscriptionDateRange, start: e.target.value})} placeholder="Start" />
                    <Input type="datetime-local" value={customSubscriptionDateRange.end} onChange={(e) => setCustomSubscriptionDateRange({...customSubscriptionDateRange, end: e.target.value})} placeholder="End" />
                  </div>
                )}
                <Input placeholder="Search by name, mobile, transaction ID..." value={subscriptionSearch} onChange={(e) => setSubscriptionSearch(e.target.value)} className="max-w-md mt-2" />
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Mobile</TableHead><TableHead>Txn ID</TableHead><TableHead>Screenshot</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                   {filteredSubscriptionPayments.map(payment => {
                      const user = users.find(u => u.id === payment.user_id);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.user_name}</p>
                              <p className="text-xs">{user?.user_id}</p>
                              <p className="text-xs text-gray-600">City: {payment.city || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                           <p>{payment.mobile}</p>
                           <p className="text-gray-600">{payment.payment_method || 'N/A'}</p>
                          </TableCell>
                          <TableCell>
                           <p className="font-mono text-sm">{payment.transaction_id}</p>
                           <p className="text-xs text-gray-600 mt-1">Paid by: {payment.paid_name || 'N/A'}</p>
                          </TableCell>
                          <TableCell>{payment.screenshot_url ? <a href={payment.screenshot_url} target="_blank" className="text-blue-600 text-xs">View</a> : '-'}</TableCell>
                          <TableCell className="font-bold text-green-600">₹{payment.amount}</TableCell>
                          <TableCell><Badge variant={payment.status === 'approved' ? 'default' : payment.status === 'rejected' ? 'destructive' : 'secondary'}>{payment.status}</Badge></TableCell>
                          <TableCell>
                           {payment.status === 'pending' && (
                             <div className="flex gap-1">
                               <Button size="sm" className="bg-green-600 h-7" onClick={async () => {
                                 const activationDate = new Date().toISOString();
                                 const expiryDate = new Date(); expiryDate.setFullYear(expiryDate.getFullYear()+1);
                                 await base44.entities.SubscriptionPayment.update(payment.id, { status: 'approved', approved_date: activationDate });
                                 const appUserMatch = appUsers.find(au => au.id === payment.user_id);
                                 const subData = { is_subscribed: true, subscription_date: activationDate, subscription_activation_date: activationDate, subscription_expiry_date: expiryDate.toISOString() };
                                 if (appUserMatch) { await base44.entities.AppUser.update(appUserMatch.id, subData); }
                                 else if (user) { await base44.entities.User.update(user.id, subData); await base44.entities.Notification.create({ user_id: user.id, title: "🎉 Active!", message: "Subscription activated!", type: "success" }); }
                                 queryClient.invalidateQueries({ queryKey: ['subscription-payments', 'all-users', 'all-app-users'] });
                               }}>✓</Button>
                               <Button size="sm" variant="destructive" className="h-7" onClick={async () => {
                                 const reason = prompt("Reason:");
                                 if (!reason) return;
                                 await base44.entities.SubscriptionPayment.update(payment.id, { status: 'rejected', rejection_reason: reason });
                                 queryClient.invalidateQueries({ queryKey: ['subscription-payments'] });
                               }}>✗</Button>
                             </div>
                           )}
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="h-7 text-red-600 hover:bg-red-50 border-red-300 ml-1"
                             onClick={async () => {
                               if (confirm(`Delete this subscription record?\n\nUser: ${payment.user_name}\nTransaction ID: ${payment.transaction_id}`)) {
                                 await base44.entities.SubscriptionPayment.delete(payment.id);
                                 queryClient.invalidateQueries({ queryKey: ['subscription-payments'] });
                                 alert('✅ Subscription deleted!');
                               }
                             }}
                           >
                             <Trash2 className="w-3 h-3" />
                           </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <SettingsTab globalSettings={globalSettings} tasks={tasks} trainingVideos={trainingVideos} />
          </TabsContent>

          <TabsContent value="trainingvideos" className="mt-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6" />
                    Training Videos Management
                  </CardTitle>
                  <Button onClick={() => {
                    const taskName = prompt("Enter task name or topic (e.g., Data Entry, General Training):");
                    if (!taskName) return;
                    const videoTitle = prompt("Enter video title:");
                    if (!videoTitle) return;
                    const videoUrl = prompt("Enter video URL (YouTube, Google Drive):");
                    if (!videoUrl) return;
                    base44.entities.TrainingVideo.create({
                      task_name: taskName,
                      video_title: videoTitle,
                      video_url: videoUrl
                    }).then(() => {
                      queryClient.invalidateQueries({ queryKey: ['training-videos'] });
                      alert('✅ Video added!');
                    });
                  }} className="bg-white/20 hover:bg-white/30">
                    <Plus className="w-4 h-4 mr-2" />Add Video
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {trainingVideos.length > 0 ? (
                  <div className="space-y-3">
                    {trainingVideos.map(video => (
                      <Card key={video.id} className="border-2 border-amber-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-amber-600">{video.task_name}</Badge>
                              </div>
                              <p className="font-semibold text-lg">{video.video_title}</p>
                              <a href={video.video_url} target="_blank" className="text-sm text-blue-600 hover:underline break-all">{video.video_url}</a>
                            </div>
                            <Button size="sm" variant="destructive" onClick={async () => {
                              if (confirm('Delete this video?')) {
                                await base44.entities.TrainingVideo.delete(video.id);
                                queryClient.invalidateQueries({ queryKey: ['training-videos'] });
                              }
                            }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No training videos added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taskactivity" className="mt-4">
            <ActivityTab
              taskActivityLogs={taskActivityLogs}
              proofs={proofs}
              tasks={tasks}
              activityDateFilter={activityDateFilter}
              setActivityDateFilter={setActivityDateFilter}
              activityTaskType={activityTaskType}
              setActivityTaskType={setActivityTaskType}
              activityStatus={activityStatus}
              setActivityStatus={setActivityStatus}
              activitySearch={activitySearch}
              setActivitySearch={setActivitySearch}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ['all-proofs'] });
                queryClient.invalidateQueries({ queryKey: ['task-activity'] });
              }}
            />
          </TabsContent>

          <TabsContent value="userhistory" className="mt-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2"><Search className="w-6 h-6" />User Account History Viewer</CardTitle>
                <p className="text-sm text-indigo-100 mt-1">Search by User ID or Password to view complete account history</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-3 mb-6">
                  <Input placeholder="Enter User ID or Password..." value={userHistorySearch} onChange={(e) => setUserHistorySearch(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleUserHistorySearch()} className="flex-1" />
                  <Button onClick={handleUserHistorySearch} className="bg-indigo-600"><Search className="w-4 h-4 mr-2" />Search</Button>
                </div>
                {!userHistoryData ? (
                  <div className="text-center py-12 text-gray-500"><Search className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-xl font-semibold">Search User Account</p></div>
                ) : (
                  <div className="space-y-4">
                    <Card className="border-2 border-indigo-200 bg-indigo-50"><CardContent className="p-4 grid md:grid-cols-3 gap-3 text-sm">
                      <div><p className="text-gray-500">Name</p><p className="font-bold">{userHistoryData.user.full_name}</p></div>
                      <div><p className="text-gray-500">Login ID</p><p className="font-mono font-bold text-blue-600">{userHistoryData.user.login_user_id}</p></div>
                      <div><p className="text-gray-500">Password</p><p className="font-mono font-bold">{userHistoryData.user.login_password}</p></div>
                      <div><p className="text-gray-500">Wallet</p><p className="text-xl font-bold text-green-600">₹{Number(userHistoryData.user.wallet_balance||0).toFixed(2)}</p></div>
                      <div><p className="text-gray-500">Total Earnings</p><p className="text-xl font-bold text-blue-600">₹{Number(userHistoryData.user.total_earnings||0).toFixed(2)}</p></div>
                      <div><p className="text-gray-500">Joined</p><p>{new Date(userHistoryData.user.created_date).toLocaleDateString()}</p></div>
                    </CardContent></Card>
                    <div className="grid grid-cols-4 gap-3">
                      <Card className="bg-green-50"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{userHistoryData.proofs.filter(p=>p.status==='approved').length}</p><p className="text-xs">Approved</p></CardContent></Card>
                      <Card className="bg-yellow-50"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-yellow-600">{userHistoryData.proofs.filter(p=>p.status==='pending').length}</p><p className="text-xs">Pending</p></CardContent></Card>
                      <Card className="bg-red-50"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-red-600">{userHistoryData.proofs.filter(p=>p.status==='rejected').length}</p><p className="text-xs">Rejected</p></CardContent></Card>
                      <Card className="bg-purple-50"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-purple-600">{userHistoryData.transactions.length}</p><p className="text-xs">Transactions</p></CardContent></Card>
                    </div>
                    <Card><CardHeader className="bg-blue-500 text-white py-3"><CardTitle className="text-base">Tasks ({userHistoryData.proofs.length})</CardTitle></CardHeader>
                      <CardContent className="p-0 max-h-80 overflow-y-auto">
                        <Table><TableHeader><TableRow><TableHead>Work</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Reward</TableHead></TableRow></TableHeader>
                          <TableBody>{userHistoryData.proofs.map(p=><TableRow key={p.id} className={p.status==='approved'?'bg-green-50':p.status==='rejected'?'bg-red-50':'bg-yellow-50'}>
                            <TableCell className="font-semibold text-sm">{p.work_type}</TableCell>
                            <TableCell className="text-xs">{new Date(p.submitted_date||p.created_date).toLocaleDateString()}</TableCell>
                            <TableCell><Badge className={p.status==='approved'?'bg-green-600':p.status==='rejected'?'bg-red-600':'bg-yellow-600'}>{p.status}</Badge></TableCell>
                            <TableCell className="font-bold text-green-600">₹{p.reward_amount||0}</TableCell>
                          </TableRow>)}</TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="helptickets" className="mt-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-6 h-6" />
                  Help Tickets ({helpTickets.filter(t => t.status === 'open').length} Open)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {helpTickets.length > 0 ? (
                  helpTickets.map(ticket => (
                    <Card key={ticket.id} className={`border-l-4 ${ticket.status === 'resolved' ? 'border-l-green-500 bg-green-50' : ticket.status === 'in_progress' ? 'border-l-blue-500 bg-blue-50' : 'border-l-yellow-500 bg-yellow-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-lg">{ticket.subject}</p>
                            <p className="text-sm text-gray-600">By: {ticket.user_name}</p>
                            <p className="text-xs text-gray-500">{new Date(ticket.created_date).toLocaleString()}</p>
                          </div>
                          <Badge className={ticket.status === 'resolved' ? 'bg-green-600' : ticket.status === 'in_progress' ? 'bg-blue-600' : 'bg-yellow-600'}>{ticket.status}</Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{ticket.description}</p>
                        {ticket.image_url && (
                          <a href={ticket.image_url} target="_blank" className="text-blue-600 text-sm">View Image</a>
                        )}
                        {ticket.status !== 'resolved' && (
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" onClick={async () => {
                              const reply = prompt("Enter admin reply:");
                              if (reply) {
                                await base44.entities.HelpTicket.update(ticket.id, { admin_reply: reply, status: 'resolved' });
                                queryClient.invalidateQueries({ queryKey: ['help-tickets'] });
                                alert('✅ Ticket resolved!');
                              }
                            }}>Resolve</Button>
                            <Button size="sm" variant="outline" onClick={async () => {
                              await base44.entities.HelpTicket.update(ticket.id, { status: 'in_progress' });
                              queryClient.invalidateQueries({ queryKey: ['help-tickets'] });
                            }}>Mark In Progress</Button>
                          </div>
                        )}
                        {ticket.admin_reply && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm font-semibold text-blue-800">Admin Reply:</p>
                            <p className="text-sm text-blue-700">{ticket.admin_reply}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-12">No tickets yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedbacks" className="mt-4">
            <FeedbacksTab userFeedbacks={userFeedbacks} />
          </TabsContent>

          <TabsContent value="signatures" className="mt-4">
            <SignatureSubmissionsTab />
          </TabsContent>

          <TabsContent value="holidays" className="mt-4">
            <HolidaysTab
              holidays={holidays}
              globalSettings={globalSettings}
              onAddHoliday={() => { setEditingHoliday(null); setHolidayForm({ holiday_name: "", holiday_date: "", message: "", emoji: "🎉" }); setHolidayDialog(true); }}
              onEditHoliday={(h) => { setEditingHoliday(h); setHolidayForm({ holiday_name: h.holiday_name, holiday_date: h.holiday_date, message: h.message, emoji: h.emoji || '🎉' }); setHolidayDialog(true); }}
            />
          </TabsContent>

          <TabsContent value="savedreplies" className="mt-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Saved Rejection Replies</CardTitle>
                <Button onClick={async () => {
                  const reply = prompt("Enter new saved reply:");
                  if (reply) {
                    await base44.entities.SavedRejectionReply.create({ reply_text: reply, order: savedReplies.length + 1 });
                    queryClient.invalidateQueries({ queryKey: ['saved-replies'] });
                    alert('✅ Added!');
                  }
                }}><Plus className="w-4 h-4 mr-2" />Add</Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {savedReplies.map(reply => (
                  <div key={reply.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <p className="text-sm flex-1">{reply.reply_text}</p>
                    <Button size="sm" variant="destructive" onClick={async () => {
                      if (confirm('Delete this reply?')) {
                        await base44.entities.SavedRejectionReply.delete(reply.id);
                        queryClient.invalidateQueries({ queryKey: ['saved-replies'] });
                      }
                    }}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                ))}
                {savedReplies.length === 0 && <p className="text-center text-gray-500 py-8">No saved replies</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthlyanalytics" className="mt-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"><CardTitle>Monthly Task Analytics</CardTitle></CardHeader>
              <CardContent className="p-6">
                <div className="mb-6"><Label className="text-sm font-semibold mb-2 block">Select Month</Label><Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="max-w-xs" /></div>
                {(() => {
                  const [year, month] = selectedMonth.split('-');
                  const monthStart = new Date(parseInt(year), parseInt(month)-1, 1);
                  const monthEnd = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
                  const mp = proofs.filter(p => { const d = new Date(p.submitted_date||p.created_date); return d>=monthStart&&d<=monthEnd; });
                  const total=mp.length, approved=mp.filter(p=>p.status==='approved').length, rejected=mp.filter(p=>p.status==='rejected').length, pending=mp.filter(p=>p.status==='pending').length;
                  const name=monthStart.toLocaleDateString('en-US',{month:'long',year:'numeric'});
                  return (<div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Card className="bg-blue-500 text-white"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{total}</p><p className="text-xs">Total</p></CardContent></Card>
                      <Card className="bg-green-500 text-white"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{approved}</p><p className="text-xs">Approved</p></CardContent></Card>
                      <Card className="bg-red-500 text-white"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{rejected}</p><p className="text-xs">Rejected</p></CardContent></Card>
                      <Card className="bg-yellow-500 text-white"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{pending}</p><p className="text-xs">Pending</p></CardContent></Card>
                    </div>
                    <p className="text-sm text-gray-600">Approval Rate: <strong>{total>0?((approved/total)*100).toFixed(1):0}%</strong> • {name}</p>
                    <Button onClick={()=>{const csv=`Month,Submitted,Approved,Rejected,Pending\n${name},${total},${approved},${rejected},${pending}`;const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));l.download=`Report_${selectedMonth}.csv`;l.click();}} className="bg-green-600"><Download className="w-4 h-4 mr-2"/>Export CSV</Button>
                  </div>);
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referralpartners" className="mt-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"><CardTitle>Referral Partners ({referralPartners.filter(r=>r.status==='pending').length} Pending)</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                {referralPartners.map(partner => (
                  <Card key={partner.id} className={`border-l-4 ${partner.status==='approved'?'border-l-green-500 bg-green-50':partner.status==='rejected'?'border-l-red-500 bg-red-50':'border-l-yellow-500 bg-yellow-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div><p className="font-bold">{partner.full_name}</p><p className="text-sm text-gray-600">{partner.phone} • {partner.email||'N/A'}</p></div>
                        <Badge className={partner.status==='approved'?'bg-green-600':partner.status==='rejected'?'bg-red-600':'bg-yellow-600'}>{partner.status}</Badge>
                      </div>
                      {partner.status==='pending'&&<div className="flex gap-2 mt-2">
                        <Button size="sm" className="bg-green-600 flex-1" onClick={async()=>{await base44.entities.ReferralPartner.update(partner.id,{status:'approved'});await base44.entities.Notification.create({user_id:partner.user_id,title:"🎉 Approved!",message:"Your referral partner application has been approved!",type:"success"});queryClient.invalidateQueries({queryKey:['referral-partners']});alert('✅ Approved!');}}>✓ Approve</Button>
                        <Button size="sm" variant="destructive" className="flex-1" onClick={async()=>{await base44.entities.ReferralPartner.update(partner.id,{status:'rejected'});queryClient.invalidateQueries({queryKey:['referral-partners']});alert('❌ Rejected');}}>✗ Reject</Button>
                      </div>}
                    </CardContent>
                  </Card>
                ))}
                {referralPartners.length===0&&<p className="text-center text-gray-500 py-12">No applications yet</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supportqueries" className="mt-4">
            <SupportQueriesTab helpTickets={helpTickets} callRequests={callRequests} />
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <InvoicesTab users={users} appUsers={appUsers} />
          </TabsContent>

          <TabsContent value="devicetracking" className="mt-4">
            <DeviceTrackingTab appUsers={appUsers} loginAttempts={loginAttempts} />
          </TabsContent>

          <TabsContent value="banners" className="mt-4">
            <BannersTab globalSettings={globalSettings} />
          </TabsContent>
        </Tabs>
        
        {/* Reject Proof Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Reject Work Submission</DialogTitle><DialogDescription>Select a saved reply or write custom reason, and optionally add a Performance Summary</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Saved Replies (Click to use)</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedReplies.map(reply => (
                    <button key={reply.id} type="button" onClick={() => setCustomRejectionReason(reply.reply_text)} className="w-full p-3 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors"><p className="text-sm">{reply.reply_text}</p></button>
                  ))}
                </div>
              </div>
              <div><Label className="text-sm font-semibold">Rejection Reason *</Label><Textarea value={customRejectionReason} onChange={(e) => setCustomRejectionReason(e.target.value)} placeholder="Enter reason..." rows={3} className="mt-1" /></div>
              <div className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50 space-y-2">
                <Label className="text-sm font-bold text-amber-900">📊 Performance Summary (Optional)</Label>
                <p className="text-xs text-amber-700">Write a detailed performance summary for the user. This will be shown in their Task History.</p>
                <Textarea value={performanceSummary} onChange={(e) => setPerformanceSummary(e.target.value)} placeholder="e.g. Out of 65 entries, 40 were correct. Common mistakes: incorrect email formats, missing pin codes. Accuracy: 61.5%..." rows={5} className="bg-white border-amber-300" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setRejectDialogOpen(false); setRejectingProof(null); setCustomRejectionReason(""); setPerformanceSummary(""); }} className="flex-1">Cancel</Button>
                <Button onClick={() => { if (!customRejectionReason.trim()) { alert("Please enter rejection reason"); return; } rejectProofMutation.mutate({ proofId: rejectingProof.id, reason: customRejectionReason, summary: performanceSummary, proof: rejectingProof }); }} className="flex-1 bg-red-600 hover:bg-red-700">Reject Work</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Performance Summary View Dialog */}
        <Dialog open={perfSummaryViewDialog} onOpenChange={setPerfSummaryViewDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-amber-600" />Performance Summary</DialogTitle>
              {viewingPerfSummary && <p className="text-sm text-gray-500">{viewingPerfSummary.user_name} • {viewingPerfSummary.work_type} • {new Date(viewingPerfSummary.submitted_date || viewingPerfSummary.created_date).toLocaleDateString()}</p>}
            </DialogHeader>
            {viewingPerfSummary?.performance_summary ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Task Performance Analysis</p>
                  <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed bg-white rounded-lg p-4 border border-amber-200">{viewingPerfSummary.performance_summary}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{viewingPerfSummary.rejection_reason}</p>
                </div>
              </div>
            ) : <p className="text-gray-500 text-center py-8">No performance summary available</p>}
          </DialogContent>
        </Dialog>

        {/* Recruiter Users Dialog */}
        <Dialog open={recruiterUsersDialog} onOpenChange={setRecruiterUsersDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRecruiterUsers?.recruiter?.name} - Users List ({selectedRecruiterUsers?.users?.length || 0})</DialogTitle>
            </DialogHeader>
            {selectedRecruiterUsers && (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Tasks</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRecruiterUsers.users.map(user => {
                    const userProofs = proofs.filter(p => p.user_id === user.id);
                    const approvedCount = userProofs.filter(p => p.status === 'approved').length;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{user.full_name}</p>
                            <p className="text-xs text-gray-500">{user.user_id}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell className="text-sm">{user.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={user.is_subscribed ? "bg-green-600" : "bg-gray-500"}>
                            {user.is_subscribed ? '✓ Sub' : 'Not Sub'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge className="bg-blue-600">{userProofs.length} Total</Badge>
                            <Badge className="bg-green-600">{approvedCount} ✓</Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingTask ? "Edit" : "Create"} Task</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
              <div><Label>Reward</Label><Input type="number" value={taskForm.reward} onChange={(e) => setTaskForm({ ...taskForm, reward: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Route</Label><Input value={taskForm.page_route} onChange={(e) => setTaskForm({ ...taskForm, page_route: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTaskDialog(false)}>Cancel</Button>
              <Button onClick={handleTaskSubmit}>{editingTask ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <SendNotificationDialog
          open={notificationDialog}
          onClose={() => setNotificationDialog(false)}
          users={users}
          appUsers={appUsers}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['all-notifications'] })}
        />

        <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={editUserForm.full_name} onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={editUserForm.email} onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={editUserForm.phone} onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUserDialog(false)}>Cancel</Button>
              <Button onClick={() => updateUserMutation.mutate({ userId: editingUser.id, data: editUserForm })}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={recruiterDialog} onOpenChange={setRecruiterDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingRecruiter ? "Edit" : "Add"} Recruiter</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={recruiterForm.name} onChange={(e) => setRecruiterForm({ ...recruiterForm, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={recruiterForm.email} onChange={(e) => setRecruiterForm({ ...recruiterForm, email: e.target.value })} /></div>
              <div><Label>Mobile *</Label><Input value={recruiterForm.mobile} onChange={(e) => setRecruiterForm({ ...recruiterForm, mobile: e.target.value })} /></div>
              <div><Label>Password *</Label><Input value={recruiterForm.password} onChange={(e) => setRecruiterForm({ ...recruiterForm, password: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRecruiterDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!recruiterForm.name || !recruiterForm.mobile || !recruiterForm.password) { alert("⚠️ Fill all"); return; }
                if (editingRecruiter) {
                  await base44.entities.Recruiter.update(editingRecruiter.id, recruiterForm);
                } else {
                  const recruiterCode = 'REC' + Math.random().toString(36).substr(2, 6).toUpperCase();
                  await base44.entities.Recruiter.create({ ...recruiterForm, recruiter_code: recruiterCode, status: 'active' });
                }
                queryClient.invalidateQueries({ queryKey: ['recruiters'] });
                setRecruiterDialog(false);
                setRecruiterForm({ name: "", email: "", mobile: "", password: "" });
                alert('✅ Done!');
              }}>{editingRecruiter ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recruiter Access Dialog */}
        <Dialog open={holidayDialog} onOpenChange={setHolidayDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHoliday ? 'Edit' : 'Add'} Holiday</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Holiday Name *</label>
                <Input value={holidayForm.holiday_name} onChange={(e) => setHolidayForm({ ...holidayForm, holiday_name: e.target.value })} placeholder="e.g., Diwali, New Year" />
              </div>
              <div>
                <label className="text-sm font-medium">Date *</label>
                <Input type="date" value={holidayForm.holiday_date} onChange={(e) => setHolidayForm({ ...holidayForm, holiday_date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Emoji</label>
                <Input value={holidayForm.emoji} onChange={(e) => setHolidayForm({ ...holidayForm, emoji: e.target.value })} placeholder="🎉" />
              </div>
              <div>
                <label className="text-sm font-medium">Holiday Message</label>
                <Textarea value={holidayForm.message} onChange={(e) => setHolidayForm({ ...holidayForm, message: e.target.value })} placeholder="Happy Diwali! Platform closed today." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setHolidayDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!holidayForm.holiday_name || !holidayForm.holiday_date) { alert('Fill all required fields'); return; }
                if (editingHoliday) {
                  await base44.entities.Holiday.update(editingHoliday.id, holidayForm);
                } else {
                  await base44.entities.Holiday.create({ ...holidayForm, is_active: true });
                }
                queryClient.invalidateQueries({ queryKey: ['holidays'] });
                setHolidayDialog(false);
                alert(editingHoliday ? '✅ Updated!' : '✅ Added!');
              }}>
                {editingHoliday ? 'Update' : 'Add'} Holiday
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <RecruiterDashboardDialog
          open={recruiterLoginDialog}
          onClose={() => { setRecruiterLoginDialog(false); setRecruiterDashboardFilter("all"); setRecruiterCustomDateRange({ start: "", end: "" }); }}
          recruiter={selectedRecruiterForLogin}
          proofs={proofs}
          users={[...users, ...appUsers.filter(au => !users.some(u => u.login_user_id === au.login_user_id))]}
          filter={recruiterDashboardFilter}
          onFilterChange={setRecruiterDashboardFilter}
          customDateRange={recruiterCustomDateRange}
          onDateRangeChange={setRecruiterCustomDateRange}
        />
        <AlertDialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle><AlertDialogDescription>Delete {userToDelete?.full_name}?</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteUserMutation.mutate(userToDelete.id)} className="bg-red-600">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={bulkActionDialog} onOpenChange={setBulkActionDialog}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>{bulkAction === 'approve' ? 'Approve?' : 'Reject?'}</AlertDialogTitle><AlertDialogDescription>{selectedProofs.length} proofs</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={executeBulkAction}>{bulkAction === 'approve' ? 'Approve' : 'Reject'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={userTasksDialog} onOpenChange={setUserTasksDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedUserTasks?.user?.full_name} - {taskViewType === 'approved' ? 'Approved Tasks' : taskViewType === 'rejected' ? 'Rejected Tasks' : 'All Tasks'}
              </DialogTitle>
            </DialogHeader>
            {selectedUserTasks && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{selectedUserTasks.proofs.length}</p><p className="text-xs">Showing</p></CardContent></Card>
                  <Card className="bg-green-50 border-green-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{selectedUserTasks.proofs.filter(p => p.status === 'approved').length}</p><p className="text-xs">Approved</p></CardContent></Card>
                  <Card className="bg-red-50 border-red-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{selectedUserTasks.proofs.filter(p => p.status === 'rejected').length}</p><p className="text-xs">Rejected</p></CardContent></Card>
                </div>
                
                <Table>
                <TableHeader>
                 <TableRow><TableHead>Task ID</TableHead><TableHead>Work Type</TableHead><TableHead>Submit Date</TableHead><TableHead>Status</TableHead><TableHead>Reason</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                 {selectedUserTasks.proofs.map(proof => (
                   <TableRow key={proof.id} className={proof.status === 'approved' ? 'bg-green-50' : proof.status === 'rejected' ? 'bg-red-50' : ''}>
                     <TableCell className="font-mono text-xs">{proof.id.substring(0, 8)}</TableCell>
                     <TableCell className="font-semibold">{proof.work_type}</TableCell>
                     <TableCell className="text-sm">{new Date(proof.submitted_date || proof.created_date).toLocaleString()}</TableCell>
                     <TableCell><Badge variant={proof.status === 'approved' ? 'default' : proof.status === 'rejected' ? 'destructive' : 'secondary'}>{proof.status}</Badge></TableCell>
                     <TableCell className="text-xs max-w-xs">{proof.rejection_reason || '-'}</TableCell>
                     <TableCell>
                       <div className="flex flex-col gap-1">
                         {proof.file_url && (
                           <Button size="sm" variant="outline" onClick={() => { setPreviewFile(proof); setFilePreviewDialog(true); }}>
                             <Eye className="w-3 h-3 mr-1" />View
                           </Button>
                         )}
                         {proof.performance_summary && (
                           <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => { setViewingPerfSummary(proof); setPerfSummaryViewDialog(true); }}>
                             <BarChart3 className="w-3 h-3 mr-1" />Perf. Summary
                           </Button>
                         )}
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={filePreviewDialog} onOpenChange={setFilePreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader><DialogTitle>File Preview</DialogTitle></DialogHeader>
            {previewFile && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <div><p className="text-sm text-gray-600">Work Type</p><p className="font-semibold">{previewFile.work_type}</p></div>
                  <div><p className="text-sm text-gray-600">Status</p><Badge variant={previewFile.status === 'approved' ? 'default' : 'destructive'}>{previewFile.status}</Badge></div>
                  <div><p className="text-sm text-gray-600">Reward</p><p className="font-bold text-green-600">₹{previewFile.reward_amount || 0}</p></div>
                  <div><p className="text-sm text-gray-600">Date</p><p className="text-sm">{new Date(previewFile.submitted_date || previewFile.created_date).toLocaleString()}</p></div>
                </div>
                {previewFile.file_url && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-semibold mb-2">File:</p>
                    <a href={previewFile.file_url} target="_blank" className="text-blue-600 hover:underline break-all text-sm">{previewFile.file_url}</a>
                    <Button size="sm" className="mt-2" onClick={() => window.open(previewFile.file_url, '_blank')}>Open</Button>
                  </div>
                )}
                {previewFile.task_content && (
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p className="text-sm font-semibold mb-2">Content:</p>
                    <pre className="text-xs whitespace-pre-wrap">{previewFile.task_content}</pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Validation Detail Dialog */}
        <Dialog open={validationDetailDialog} onOpenChange={setValidationDetailDialog}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">📊 Detailed Validation Report</DialogTitle>
              {selectedValidationReport && (
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <p><strong>User:</strong> {selectedValidationReport.user_name}</p>
                  <p><strong>Task:</strong> {selectedValidationReport.task_name}</p>
                  <p><strong>Date:</strong> {new Date(selectedValidationReport.generated_date).toLocaleString()}</p>
                  <Badge className={selectedValidationReport.accuracy_percentage >= 80 ? "bg-green-500" : selectedValidationReport.accuracy_percentage >= 60 ? "bg-yellow-500" : "bg-red-500"}>
                    Accuracy: {Number(selectedValidationReport.accuracy_percentage || 0).toFixed(1)}%
                  </Badge>
                </div>
              )}
            </DialogHeader>

            {selectedValidationReport && (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">{selectedValidationReport.total_fields}</p>
                      <p className="text-xs text-gray-600 mt-1">Total Fields</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">{selectedValidationReport.correct_fields}</p>
                      <p className="text-xs text-gray-600 mt-1">✓ Correct</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-red-600">{selectedValidationReport.incorrect_fields}</p>
                      <p className="text-xs text-gray-600 mt-1">✗ Incorrect</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Field by Field Comparison */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Field Name</TableHead>
                        <TableHead>Original Data</TableHead>
                        <TableHead>User Input</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedValidationReport.validation_results?.map((result, index) => (
                        <TableRow key={index} className={result.status === 'correct' ? 'bg-green-50' : result.status === 'incorrect' ? 'bg-red-50' : 'bg-yellow-50'}>
                          <TableCell className="font-mono text-xs">{result.item_number}</TableCell>
                          <TableCell className="font-medium capitalize">{result.field?.replace(/_/g, ' ')}</TableCell>
                          <TableCell className="font-mono text-sm">
                            <div className="p-2 bg-blue-50 rounded border border-blue-200 max-w-xs overflow-auto">
                              {result.original || <span className="text-gray-400 italic">Empty</span>}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            <div className={`p-2 rounded border max-w-xs overflow-auto ${result.status === 'correct' ? 'bg-green-100 border-green-300' : result.status === 'incorrect' ? 'bg-red-100 border-red-300' : 'bg-yellow-100 border-yellow-300'}`}>
                              {result.user_input || <span className="text-gray-400 italic">Not filled</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {result.status === 'correct' && <Badge className="bg-green-600">✓ Match</Badge>}
                            {result.status === 'incorrect' && <Badge className="bg-red-600">✗ Wrong</Badge>}
                            {result.status === 'missing' && <Badge className="bg-yellow-600">○ Missing</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>


        </div>
        </div>
        );
        }
