import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, CheckCircle } from "lucide-react";

export default function TermsSignatureDialog({ user, onAccept }) {
  const [showDialog, setShowDialog] = useState(false);
  const [signing, setSigning] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const termsRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // RESET FLAG when subscription changes (user reactivated)
    // Only trust user.terms_accepted from DB, not old localStorage flag
    if (user?.terms_accepted) {
      localStorage.setItem('workden_terms_accepted', 'true');
      return;
    }

    // If user is NOT subscribed, clear the flag (they may re-subscribe later)
    if (!user?.is_subscribed && !user?.free_unlock) {
      localStorage.removeItem('workden_terms_accepted');
    }

    // Check localStorage
    const locallyAccepted = localStorage.getItem('workden_terms_accepted');
    if (locallyAccepted === 'true') return;

    // Check backend: does this user already have a TermsAcceptance record?
    const checkBackendSignature = async () => {
      try {
        const userId = user?.id;
        if (!userId) return;
        const existing = await base44.entities.TermsAcceptance.filter({ user_id: userId });
        if (existing && existing.length > 0) {
          // Already submitted — mark locally and update user record
          localStorage.setItem('workden_terms_accepted', 'true');
          const userSource = localStorage.getItem('workden_user_source');
          try {
            if (userSource === 'appuser') {
              await base44.entities.AppUser.update(userId, { terms_accepted: true });
            } else {
              await base44.entities.User.update(userId, { terms_accepted: true });
            }
          } catch (e) {}
          const cached = localStorage.getItem('workden_user');
          if (cached) {
            try {
              const c = JSON.parse(cached);
              c.terms_accepted = true;
              localStorage.setItem('workden_user', JSON.stringify(c));
            } catch (e) {}
          }
          return; // Don't show dialog
        }
      } catch (e) {}

      // No existing signature — show dialog when on task page
      if (user?.is_subscribed && !user?.terms_accepted) {
        const checkTaskStart = () => {
          const path = window.location.pathname;
          if (
            user?.is_subscribed &&
            !user?.terms_accepted &&
            window.location.pathname.includes('TaskWorkspace')
          ) {
  setShowDialog(true);
}
        };
        checkTaskStart();
        const interval = setInterval(checkTaskStart, 2000);
        return () => clearInterval(interval);
      }
    };

    checkBackendSignature();
  }, [user]);

  useEffect(() => {
    if (showDialog && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Fix for laptop: attach native event listeners directly on canvas
      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const src = e.touches ? e.touches[0] : e;
        return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
      };

      let drawing = false;
      const onDown = (e) => {
        e.preventDefault();
        drawing = true;
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
      };
      const onMove = (e) => {
        if (!drawing) return;
        e.preventDefault();
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
      };
      const onUp = (e) => {
        e?.preventDefault();
        drawing = false;
        setIsDrawing(false);
        setSignatureData(canvas.toDataURL('image/png'));
      };

      canvas.addEventListener('mousedown', onDown);
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('mouseup', onUp);
      canvas.addEventListener('mouseleave', onUp);
      canvas.addEventListener('touchstart', onDown, { passive: false });
      canvas.addEventListener('touchmove', onMove, { passive: false });
      canvas.addEventListener('touchend', onUp);
      canvas.addEventListener('touchcancel', onUp);

      return () => {
        canvas.removeEventListener('mousedown', onDown);
        canvas.removeEventListener('mousemove', onMove);
        canvas.removeEventListener('mouseup', onUp);
        canvas.removeEventListener('mouseleave', onUp);
        canvas.removeEventListener('touchstart', onDown);
        canvas.removeEventListener('touchmove', onMove);
        canvas.removeEventListener('touchend', onUp);
        canvas.removeEventListener('touchcancel', onUp);
      };
    }
  }, [showDialog]);

  const handleScroll = (e) => {
    const element = e.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 80) {
      setHasScrolled(true);
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const coords = getCoordinates(e);
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    e?.preventDefault();
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
  };

  const handleSubmit = async () => {
    if (!signatureData) {
      alert("⚠️ Please provide your signature");
      return;
    }
    setSigning(true);
    try {
      // Use the base64 data URL directly instead of uploading (avoids upload failures)
      const file_url = signatureData;

      const cachedUserStr = localStorage.getItem('workden_user');
      let userId = user?.id || 'anonymous';
      let userName = user?.full_name || user?.email || 'User';
      let userEmail = user?.email || '';
      let userPhone = '';
      let userLoginId = '';

      if (cachedUserStr) {
        try {
          const cachedUser = JSON.parse(cachedUserStr);
          userId = cachedUser.id || userId;
          userName = cachedUser.full_name || cachedUser.email || userName;
          userEmail = cachedUser.email || userEmail;
          userPhone = cachedUser.phone || '';
          userLoginId = cachedUser.login_user_id || '';
        } catch (e) {}
      }

      await base44.entities.TermsAcceptance.create({
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone,
        user_login_id: userLoginId,
        signature_url: file_url,
        accepted_date: new Date().toISOString(),
        terms_version: "2.0",
      });

      // Update user record
      try {
        const userSource = localStorage.getItem('workden_user_source');
        if (userSource === 'appuser') {
          await base44.entities.AppUser.update(userId, {
            terms_accepted: true,
            terms_accepted_date: new Date().toISOString(),
            signature_url: file_url,
          });
        } else if (user?.id) {
          await base44.entities.User.update(user.id, {
            terms_accepted: true,
            terms_accepted_date: new Date().toISOString(),
            signature_url: file_url,
          });
        }
      } catch (e) {}

      // Permanently mark in localStorage — prevents re-appearing
      localStorage.setItem('workden_terms_accepted', 'true');
      if (cachedUserStr) {
        try {
          const cachedUser = JSON.parse(cachedUserStr);
          cachedUser.terms_accepted = true;
          localStorage.setItem('workden_user', JSON.stringify(cachedUser));
        } catch (e) {}
      }

      setShowDialog(false);
      alert("✅ Terms & Conditions accepted successfully!");
      if (onAccept) onAccept();
    } catch (error) {
      console.error("Error submitting signature:", error);
      alert("❌ Failed to submit. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  const locallyAccepted = localStorage.getItem('workden_terms_accepted') === 'true';
  if (!showDialog || user?.terms_accepted || locallyAccepted) return null;
  // Extra guard: if no user, don't show
  if (!user) return null;

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Terms & Conditions Agreement
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Terms */}
        <div className="flex-1 overflow-auto px-5 py-4 text-sm" ref={termsRef} onScroll={handleScroll}>
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 mb-4">
            <p className="text-amber-900 font-semibold text-center text-sm">
              ⚠️ Please read all terms carefully before signing
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold">TERMS & CONDITIONS</h2>
            <p className="text-xs text-gray-500">Last Updated: 2026</p>

            <p>Welcome to WorkDen. These Terms govern your use of the Platform. By registering or using the Platform, you agree to these Terms.</p>

            <div>
              <h3 className="font-bold mb-1">1) Platform Purpose</h3>
              <p>WorkDen is a digital platform for task/work management, workforce support tools, and subscription-based digital services.</p>
            </div>

            <div>
              <h3 className="font-bold mb-1">2) Eligibility</h3>
              <p>WorkDen can be used by individuals of all age groups. Minors must use the platform under parental or guardian guidance.</p>
            </div>

            <div>
              <h3 className="font-bold mb-1">3) User Account & Security</h3>
              <p>All information provided during registration must be true and correct. You will keep your credentials confidential and not share your account.</p>
            </div>

            <div>
              <h3 className="font-bold mb-1">4) Subscription & Payment Policy</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>The payment has been made by the user <strong>voluntarily</strong> through the portal.</li>
                <li>The subscription fee is <strong>non-refundable</strong> under any circumstances.</li>
                <li>Once the portal is activated, the subscription fee will <strong>not be refunded</strong>.</li>
                <li>Subscription provides digital access/services for one year from activation date.</li>
                <li>Misuse or fraudulent payment disputes are strictly prohibited.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-1">5) Earnings & Performance</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>Earnings depend <strong>strictly on task performance</strong> — the number of correctly completed tasks.</li>
                <li>Payment will be based on the number of correctly completed tasks only.</li>
                <li>If tasks are not completed or are left midway, the <strong>responsibility lies with the user</strong>.</li>
                <li>If the user is unable to work for any reason, it is their <strong>own responsibility</strong>.</li>
                <li>WorkDen does not guarantee fixed income.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-1">6) Task Rules</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>Tasks must be completed within the allotted time (8 hours).</li>
                <li>Exiting a task mid-way will result in a task lock until the next day at 9:00 AM.</li>
                <li>Copy-paste is disabled. All entries must be typed manually.</li>
                <li>Minimum accuracy of 95% is required for approval.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-1">7) User Responsibilities</h3>
              <p>You agree to use WorkDen honestly and responsibly, not to misuse any features, and to follow all guidelines provided within the Platform.</p>
            </div>

            <div>
              <h3 className="font-bold mb-1">8) Prohibited Activities</h3>
              <p>Users must NOT create fake accounts, submit false data, misuse tasks/subscriptions, harass others, or attempt hacking or scraping of the platform.</p>
            </div>

            <div>
              <h3 className="font-bold mb-1">9) Contact</h3>
              <p>Support Email: <a href="mailto:workdenindia567@gmail.com" className="text-blue-600 underline">workdenindia567@gmail.com</a></p>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-bold mb-2">USER AGREEMENT</h2>
              <p>By providing your signature below, you confirm that:</p>
              <ul className="mt-2 space-y-1">
                <li>✅ You have read and understood all terms</li>
                <li>✅ You accept that the payment was made voluntarily and is non-refundable</li>
                <li>✅ You understand earnings depend solely on task performance</li>
                <li>✅ You accept full responsibility for incomplete or abandoned tasks</li>
                <li>✅ You will use WorkDen fairly and lawfully</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        {hasScrolled ? (
          <div className="border-t-2 px-5 py-4 bg-gray-50 space-y-3">
            <p className="text-sm font-semibold text-gray-900">✍️ Your Signature *</p>
            <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white touch-none" style={{ maxWidth: '100%' }}>
              <canvas
                ref={canvasRef}
                width={500}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
                className="w-full cursor-crosshair block"
                style={{ touchAction: 'none', maxHeight: '120px' }}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Button onClick={clearSignature} variant="outline" size="sm" className="text-xs">
                Clear Signature
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!signatureData || signing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm"
              >
                {signing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" />I Agree & Submit Signature</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t-2 px-5 py-3 bg-amber-50">
            <p className="text-center text-amber-900 font-semibold text-sm">
              📜 Please scroll to the bottom to read all terms before signing
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}