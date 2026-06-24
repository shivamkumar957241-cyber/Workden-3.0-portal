import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Lock, Play, CreditCard, CheckCircle, Loader2, AlertTriangle, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function TasksPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "", city: "", paymentMethod: "", transactionId: "", paidName: "", screenshotFile: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showHelpVideo, setShowHelpVideo] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [todayProofs, setTodayProofs] = useState([]);
  const [platformOff, setPlatformOff] = useState(false);
  const [offMessage, setOffMessage] = useState("");

  // ✅ NEW: Track if first task has been started (click pe hi unlock)
  const [firstTaskStarted, setFirstTaskStarted] = useState(false);

  const WEEKLY_SCHEDULE = { 1: "Data Entry", 2: "Data Entry", 3: "Form Filling", 4: "Form Filling", 5: "PDF to Word Typing", 6: "Grammar Correction", 0: null };
  const todayDay = new Date().getDay();
  const isSunday = todayDay === 0;
  const scheduledFirstTask = WEEKLY_SCHEDULE[todayDay];
  const todayStr = new Date().toLocaleDateString('en-CA');

  const { data: globalSettings = [] } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => base44.entities.GlobalSettings.list(),
    placeholderData: []
  });

  const convertDriveUrl = (url) => {
    if (!url) return "";
    if (url.includes('drive.google.com')) {
      const m1 = url.match(/\/file\/d\/([^/]+)/);
      if (m1) return `https://drive.google.com/uc?export=view&id=${m1[1]}`;
      const m2 = url.match(/[?&]id=([^&]+)/);
      if (m2) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
    }
    return url;
  };

  const paymentQRCode = convertDriveUrl(
    globalSettings.find(s => s.setting_key === 'payment_qr')?.setting_value ||
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692ab5743b33f5dfad922ff3/5077f5f2d_6172534948808559377.jpg"
  );
  const paymentLink = globalSettings.find(s => s.setting_key === 'payment_link')?.setting_value || "https://razorpay.me/@WorkDen";

  useEffect(() => {
    const cachedUser = localStorage.getItem('workden_3_user');
    const cachedTasks = localStorage.getItem('workden_tasks');
    if (cachedUser) { try { setCurrentUser(JSON.parse(cachedUser)); } catch(e) {} }
    if (cachedTasks) { try { setTasks(JSON.parse(cachedTasks)); } catch(e) {} }
    loadData();
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const taskList = await base44.entities.Task.list();
      if (taskList && taskList.length >= 0) {
        setTasks(taskList);
        localStorage.setItem('workden_tasks', JSON.stringify(taskList));
      }
    } catch (e) {}
  };

  const loadData = async () => {
    const savedUserStr = localStorage.getItem('workden_3_user');
    const savedUserSource = localStorage.getItem('workden_3_user_source');
    let user = null;
    if (savedUserSource === 'appuser' && savedUserStr) {
      try {
        user = JSON.parse(savedUserStr);
        setCurrentUser(user);
        const dbUsers = await base44.entities.AppUser.filter({ id: user.id });
        if (dbUsers?.length > 0) { user = dbUsers[0]; setCurrentUser(user); localStorage.setItem('workden_3_user', JSON.stringify(user)); }
      } catch (e) {}
    } else {
      try {
        user = await base44.auth.me();
        setCurrentUser(user);
        localStorage.setItem('workden_3_user', JSON.stringify(user));
      } catch (error) {
        if (savedUserStr) { try { user = JSON.parse(savedUserStr); setCurrentUser(user); } catch (e) {} }
      }
    }
    try {
      const settings = await base44.entities.GlobalSettings.list();
      const isPlatformOff = settings.find(s => s.setting_key === 'platform_off_enabled')?.setting_value === 'true';
      const message = settings.find(s => s.setting_key === 'platform_off_message')?.setting_value || "Platform is currently closed. Please check back later.";
      setPlatformOff(isPlatformOff && user?.role !== 'admin');
      setOffMessage(message);
    } catch (e) {}
    if (user) {
      setFormData(prev => ({ ...prev, name: user.full_name || "", email: user.email || "", mobile: user.phone || "" }));

      // ✅ localStorage se check karo — kya aaj ka first task already start ho chuka hai?
      if (scheduledFirstTask) {
        const startedKey = `workden_first_task_started_${user.id}_${todayStr}`;
        if (localStorage.getItem(startedKey) === 'true') {
          setFirstTaskStarted(true);
        }
      }
    }
  };

  const isTaskLocked = () => {
    if (currentUser?.role === 'admin') return false;
    if (currentUser?.is_subscribed) return false;
    if (currentUser?.free_unlock) return false;
    return true;
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingScreenshot(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, screenshotFile: file_url }));
    } catch (error) { alert("Failed to upload screenshot."); }
    finally { setUploadingScreenshot(false); }
  };

  const handleSubmitPayment = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim() || !formData.email.trim() || !formData.city.trim() || !formData.paymentMethod || !formData.transactionId.trim() || !formData.paidName.trim()) {
      alert("⚠️ Please fill all required fields"); return;
    }
    if (!agreeTerms) { alert("⚠️ Please agree to the terms and conditions"); return; }
    setSubmitting(true);
    try {
      const existingPayments = await base44.entities.SubscriptionPayment.filter({ user_id: currentUser.id });
      if (existingPayments?.length > 0) {
        alert("⚠️ You have already submitted this form. Admin will verify your payment soon.");
        setSubmitting(false); setShowPaymentDialog(false); return;
      }
      await base44.entities.SubscriptionPayment.create({
        user_id: currentUser.id, user_name: formData.name, user_email: formData.email,
        mobile: formData.mobile, city: formData.city, payment_method: formData.paymentMethod,
        transaction_id: formData.transactionId, paid_name: formData.paidName,
        screenshot_url: formData.screenshotFile || "", amount: 999, status: "pending"
      });
      setSubmitted(true);
    } catch (error) { alert("❌ Failed to submit. Please try again."); }
    finally { setSubmitting(false); }
  };

  // ✅ Proof check — still runs for backward compat (agar pehle se submit kiya ho)
  useEffect(() => {
    if (!currentUser?.id || !scheduledFirstTask) return;

    // Pehle localStorage check karo — agar already started hai toh API call skip
    const startedKey = `workden_first_task_started_${currentUser.id}_${todayStr}`;
    if (localStorage.getItem(startedKey) === 'true') {
      setFirstTaskStarted(true);
      return;
    }

    // Warna DB se check karo (purane submissions ke liye)
    const checkFirstTask = async () => {
      try {
        const userProofs = await base44.entities.Proof.filter({ user_id: currentUser.id });
        const todaySubmissions = userProofs.filter(p => {
          const d = new Date(p.submitted_date || p.created_date).toLocaleDateString('en-CA');
          return d === todayStr && p.work_type === scheduledFirstTask;
        });
        setTodayProofs(todaySubmissions);
        // Agar proof already submit hai toh bhi flag set karo
        if (todaySubmissions.length > 0) {
          setFirstTaskStarted(true);
          localStorage.setItem(startedKey, 'true');
        }
      } catch (e) {}
    };
    checkFirstTask();
  }, [currentUser?.id, scheduledFirstTask]);

  // ✅ FIXED: Ab sirf "Start" click karne pe unlock hoga — submit ki zaroorat nahi
  const firstTaskDoneToday = !scheduledFirstTask || firstTaskStarted || todayProofs.length > 0;

  // ✅ Handler: Jab pehle task ka Start click ho
  const handleFirstTaskStart = () => {
    if (currentUser?.id && scheduledFirstTask) {
      const startedKey = `workden_first_task_started_${currentUser.id}_${todayStr}`;
      localStorage.setItem(startedKey, 'true');
      setFirstTaskStarted(true);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.name === scheduledFirstTask) return -1;
    if (b.name === scheduledFirstTask) return 1;
    return 0;
  });

  const TASK_ROUTES = {
    "Data Entry": "/DataEntry", "Form Filling": "/FormFilling",
    "Grammar Correction": "/GrammarCorrection", "E-Book Typing": "/PdfToWordTyping",
    "PDF to Word Typing": "/PdfToWordTyping", "Typing": "/Typing",
    "Hard Captcha Filling": "/CaptchaFilling", "Copy-Paste Work": "/CopyPaste", "Chat Support": "/ChatSupport",
  };

  const getTaskRoute = (task) => {
    if (task.page_route) return `/${task.page_route}`;
    return TASK_ROUTES[task.name] || createPageUrl("TaskWorkspace") + `?taskId=${task.id}`;
  };

  const taskIcons = ["📝", "📋", "✍️", "📄", "🖊️", "📊", "💬", "🔤", "📑", "🗂️", "📌", "🖋️"];
  const taskColors = ["bg-blue-50 border-blue-100", "bg-purple-50 border-purple-100", "bg-green-50 border-green-100", "bg-orange-50 border-orange-100", "bg-pink-50 border-pink-100", "bg-teal-50 border-teal-100"];
  const taskIconBgs = ["bg-blue-100", "bg-purple-100", "bg-green-100", "bg-orange-100", "bg-pink-100", "bg-teal-100"];

  const allLocked = isTaskLocked();

  if (platformOff) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Platform Closed</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{offMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-5 pb-4">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-black text-gray-900">Available Tasks</h1>
          <p className="text-gray-400 text-sm mt-0.5">Select a task to start earning</p>

          {/* Status pill */}
          {(currentUser?.is_subscribed || currentUser?.free_unlock) ? (
            <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <p className="text-green-800 text-xs font-semibold">
                {currentUser?.free_unlock ? 'Admin Unlocked' : 'Subscription Active'}
              </p>
            </div>
          ) : null}

          {/* Sunday */}
          {isSunday && !allLocked && (
            <div className="mt-2 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
              <span className="text-sm">🏖️</span>
              <p className="text-orange-800 text-xs font-semibold">Sunday Holiday! No tasks today. Enjoy your rest day!</p>
            </div>
          )}

          {/* First task notice */}
          {scheduledFirstTask && !allLocked && !isSunday && !firstTaskStarted && (
            <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
              <span className="text-sm">📅</span>
              <p className="text-blue-800 text-xs font-semibold">Today's first task: <strong>{scheduledFirstTask}</strong> — Start karo, baaki unlock honge</p>
            </div>
          )}

          {/* All tasks unlocked notice */}
          {scheduledFirstTask && !allLocked && !isSunday && firstTaskStarted && (
            <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <p className="text-green-800 text-xs font-semibold">Sab tasks unlock hain! Koi bhi karo 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* How to earn video — only when locked */}
      {allLocked && (
        <div className="px-4 pt-4 max-w-xl mx-auto">
          <button
            onClick={() => setShowHelpVideo(true)}
            className="w-full bg-gray-900 rounded-2xl overflow-hidden flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors"
          >
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <div className="w-0 h-0 border-l-[14px] border-l-white border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent ml-1"></div>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm">How to Earn Money Online 💰</p>
              <p className="text-gray-400 text-xs mt-0.5">Watch WorkDen platform demo</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="max-w-xl mx-auto px-4 py-4 space-y-2">
        {sortedTasks.map((task, index) => {
          const isFirstTask = task.name === scheduledFirstTask;
          const subscriptionLocked = allLocked;

          // ✅ FIXED LOGIC:
          // - Subscription locked? Sab locked
          // - Pehla task nahi kiya start? Sirf pehla task open, baaki locked
          // - Pehla task start kar diya? Sab open
          const firstTaskLocked = !subscriptionLocked && scheduledFirstTask && !isFirstTask && !firstTaskDoneToday;
          const locked = subscriptionLocked || firstTaskLocked;

          const icon = taskIcons[index % taskIcons.length];
          const iconBg = taskIconBgs[index % taskIconBgs.length];

          return (
            <div key={task.id} className={`rounded-2xl border overflow-hidden transition-all ${
              locked ? 'bg-gray-50 border-gray-100 opacity-75' :
              isFirstTask && !subscriptionLocked && !firstTaskStarted ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' :
              'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
            }`}>
              {/* Today badge — sirf tab dikhao jab started nahi */}
              {isFirstTask && !subscriptionLocked && !firstTaskStarted && (
                <div className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1.5">
                  <span>📅</span> Today's First Task — Yahan se shuru karo
                </div>
              )}

              <div className="flex items-center gap-3 px-4 py-3.5">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${locked ? 'bg-gray-100' : iconBg}`}>
                  {locked ? <Lock className="w-4 h-4 text-gray-400" /> : icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm leading-tight ${locked ? 'text-gray-400' : 'text-gray-900'}`}>{task.name}</p>
                  {task.description && (
                    <p className="text-gray-400 text-xs mt-0.5 truncate">{task.description}</p>
                  )}
                  {firstTaskLocked && (
                    <p className="text-amber-600 text-xs mt-1 font-semibold">🔒 Pehle "{scheduledFirstTask}" start karo</p>
                  )}
                </div>

                {/* Action */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!locked ? (
                    <Link to={getTaskRoute(task)}>
                      {/* ✅ isFirstTask pe click hote hi handleFirstTaskStart call hoga */}
                      <button
                        onClick={() => { if (isFirstTask) handleFirstTaskStart(); }}
                        className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Start
                      </button>
                    </Link>
                  ) : subscriptionLocked ? (
                    <button
                      onClick={() => { setShowPaymentDialog(true); setPaymentStep(1); setSubmitted(false); }}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                    >
                      <CreditCard className="w-3 h-3" />
                      Subscribe
                    </button>
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">📋</span>
            <p className="text-gray-500 font-semibold">No tasks available</p>
            <p className="text-gray-400 text-sm mt-1">Contact admin to get tasks assigned</p>
          </div>
        )}

        {/* Subscribe CTA */}
        {allLocked && tasks.length > 0 && (
          <div className="mt-4 bg-gray-900 rounded-2xl p-5 text-center">
            <p className="text-white font-black text-lg mb-1">Unlock All {tasks.length} Tasks</p>
            <p className="text-gray-400 text-sm mb-4">One-time subscription • ₹999 • Valid 1 year</p>
            <button
              onClick={() => { setShowPaymentDialog(true); setPaymentStep(1); setSubmitted(false); }}
              className="bg-white text-gray-900 font-black px-8 py-3 rounded-xl text-base hover:bg-gray-100 transition-colors"
            >
              Subscribe Now — ₹999
            </button>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {submitted ? "Payment Submitted!" : paymentStep === 1 ? "Subscribe — ₹999" : "Payment Confirmation"}
            </DialogTitle>
            {!submitted && (
              <DialogDescription className="text-center">
                {paymentStep === 1 ? "One-time ₹999 to unlock all tasks" : "Fill your details after payment"}
              </DialogDescription>
            )}
          </DialogHeader>

          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-700">Payment Submitted!</h3>
              <p className="text-gray-600 text-sm">Admin will verify and activate within 24 hours.</p>
              <Button onClick={() => setShowPaymentDialog(false)} className="w-full bg-green-600">Done</Button>
            </div>
          ) : paymentStep === 1 ? (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <div className="bg-gray-900 text-white py-3 px-6 rounded-xl inline-block mb-3">
                  <p className="text-3xl font-black">₹999</p>
                  <p className="text-sm text-gray-400">One-time Subscription</p>
                </div>
              </div>
              <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-12 bg-green-600 hover:bg-green-700 font-bold text-base">💳 Pay ₹999 — Click Here</Button>
              </a>
              <div className="text-center text-sm text-gray-400 font-semibold">OR scan QR</div>
              <div className="text-center">
                <div className="mx-auto max-w-[180px] bg-white p-3 rounded-2xl shadow-xl border-2 border-gray-200">
                  <img src={paymentQRCode} alt="QR" className="w-full h-auto rounded-xl" />
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-xs text-amber-800 font-semibold">⚠️ Non-refundable • Valid for 1 year</p>
              </div>
              <Button onClick={() => setPaymentStep(2)} className="w-full h-11 bg-gray-900 hover:bg-gray-800">I've Made the Payment →</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitPayment} className="space-y-3 py-2">
              <div><Label>Full Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your full name" required /></div>
              <div><Label>Mobile Number *</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="Mobile number" required /></div>
              <div><Label>Email Address *</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" required /></div>
              <div><Label>City *</Label><Input value={formData.city || ""} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Your city" required /></div>
              <div>
                <Label>Payment Method *</Label>
                <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full p-2 border rounded-md text-sm" required>
                  <option value="">Select Method</option>
                  <option value="UPI">UPI</option>
                  <option value="QR">QR Code</option>
                </select>
              </div>
              <div><Label>Transaction ID / UTR *</Label><Input value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} placeholder="UPI Reference / UTR" required /></div>
              <div><Label>Name Used for Payment *</Label><Input value={formData.paidName || ""} onChange={e => setFormData({...formData, paidName: e.target.value})} placeholder="Name from payment app" required /></div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">Non-refundable • Valid 1 year • Read Terms before proceeding</p>
                </div>
                <Button type="button" onClick={() => setShowTermsDialog(true)} variant="outline" className="w-full text-xs h-8">📄 Read Terms & User Agreement</Button>
                <div className="flex items-center gap-2">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={setAgreeTerms} />
                  <label htmlFor="terms" className="text-xs text-amber-900 font-medium cursor-pointer">I agree to WorkDen's Terms & Conditions</label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setPaymentStep(1)} className="flex-1">← Back</Button>
                <Button type="submit" disabled={submitting || !agreeTerms} className="flex-1 bg-green-600 hover:bg-green-700">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <>✅ Confirm</>}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Help Video Dialog */}
      <Dialog open={showHelpVideo} onOpenChange={setShowHelpVideo}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <div className="w-full h-full">
            <iframe src="https://drive.google.com/file/d/1kBxKTj_T9yMgJvEV27lZck0CyKDYIRiv/preview" className="w-full h-full" frameBorder="0" allowFullScreen title="How to earn" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold">WorkDen — Terms & User Agreement</DialogTitle></DialogHeader>
          <div className="space-y-4 text-sm text-gray-700">
            <p>Welcome to WorkDen. By subscribing, you agree to the following terms:</p>
            <div><h3 className="font-bold mb-1">1. Subscription</h3><p>The ₹999 subscription fee is non-refundable and valid for 1 year from activation.</p></div>
            <div><h3 className="font-bold mb-1">2. Earnings</h3><p>Income depends on user performance, task quality, consistency, and platform availability.</p></div>
            <div><h3 className="font-bold mb-1">3. Usage Rules</h3><p>Do not submit fake proof, create multiple accounts, or misuse platform features.</p></div>
            <div><h3 className="font-bold mb-1">4. Contact</h3><p>Support: workdenindia567@gmail.com</p></div>
            <Button onClick={() => setShowTermsDialog(false)} className="w-full bg-gray-900 mt-2">I Understand — Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
