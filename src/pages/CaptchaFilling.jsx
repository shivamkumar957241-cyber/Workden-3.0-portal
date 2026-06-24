import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import TaskPreviewScreen from "@/components/TaskPreviewScreen";
import TaskTimeGuard from "@/components/TaskTimeGuard";
import TaskLockedScreen from "@/components/TaskLockedScreen";
import TaskRefreshWarning from "@/components/TaskRefreshWarning";
import { useTaskLock } from "@/lib/TaskLockContext";
import { getTaskLockStatus, setTaskLocked, buildVIPReportHeader, buildVIPReportFooter } from "@/lib/taskLockStorage";
import { useTaskActivityTracker } from "@/lib/useTaskActivityTracker";
import { startTaskActivity, stopTaskActivity } from "@/lib/TaskActivityManager";

const TASK_NAME = "Hard Captcha Filling";
let currentSessionId = null;
const TOTAL = 500;
const REWARD = "₹150";
const TASK_DURATION = 8 * 60 * 60;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate a random string of given length from charset
const randomStr = (len, charset) => Array.from({ length: len }, () => charset[Math.floor(Math.random() * charset.length)]).join('');

function generateCaptcha() {
  const type = rand(0, 8);

  if (type === 0) {
    // Multi-step math (8-9 char answers are numbers, but display is long)
    const subtype = rand(0, 3);
    let display, answer;
    if (subtype === 0) {
      const a = rand(12, 99), b = rand(8, 50), c = rand(20, 200);
      answer = a * b + c;
      display = `(${a} × ${b}) + ${c} = ?`;
    } else if (subtype === 1) {
      const a = rand(10, 50), b = rand(10, 50), c = rand(3, 15);
      answer = (a + b) * c;
      display = `(${a} + ${b}) × ${c} = ?`;
    } else if (subtype === 2) {
      const b = rand(3, 12), q = rand(10, 50), c = rand(20, 100);
      const a = b * q;
      answer = q + c;
      display = `${a} ÷ ${b} + ${c} = ?`;
    } else {
      const a = rand(5, 20), b = rand(5, 18), c = rand(3, 12), d = rand(3, 10);
      answer = a * b - c * d;
      display = `${a} × ${b} − ${c} × ${d} = ?`;
    }
    return { type: 'math', display, answer: String(answer), tag: 'Math', difficulty: 'Hard', hint: 'Solve the math expression carefully' };
  }

  if (type === 1) {
    // 8-char uppercase text CAPTCHA
    const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // removed I, O to avoid confusion
    const word = randomStr(8, UPPER);
    return { type: 'text', display: word, answer: word, tag: 'Text', difficulty: 'Medium', hint: 'Type exactly as shown (uppercase only)' };
  }

  if (type === 2) {
    // 8-9 char distorted text with numbers replacing letters
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const original = randomStr(8, charset);
    const replacements = { 'A': '4', 'E': '3', 'I': '1', 'O': '0', 'S': '5', 'G': '6', 'T': '7', 'B': '8' };
    const distorted = original.split('').map(c => replacements[c] || c).join('');
    const reverseMap = { '4': 'A', '3': 'E', '1': 'I', '0': 'O', '5': 'S', '6': 'G', '7': 'T', '8': 'B' };
    return {
      type: 'distorted',
      display: distorted,
      answer: original,
      tag: 'Distorted',
      difficulty: 'Hard',
      hint: 'Replace: 0→O, 3→E, 1→I, 4→A, 5→S, 6→G, 7→T, 8→B'
    };
  }

  if (type === 3) {
    // 8-char mixed case with special substitutions
    const items = [
      ['R3@D TH!$ N0W', 'READ THIS NOW'], ['TYP3 H3R3 N0W', 'TYPE HERE NOW'],
      ['W0RK D3N !NF0', 'WORK DEN INFO'], ['!D3NT!FY Y0UR$', 'IDENTIFY YOURS'],
      ['$3CUR3 4CC3SS', 'SECURE ACCESS'], ['V3R!FY 3NTR4NC', 'VERIFY ENTRANC'],
      ['C4PTCH4 D3C0D3', 'CAPTCHA DECODE'], ['@N4LYZ3 D4T4', 'ANALYZE DATA'],
      ['PR0F!L3 V4L!D', 'PROFILE VALID'], ['M0D|_|L3 CH3CK', 'MODULE CHECK'],
    ];
    const item = pick(items);
    return { type: 'overlapping', display: item[0], answer: item[1], tag: 'Jumbled', difficulty: 'Hard', hint: 'Decode: ! → I, @ → A, $ → S, 0 → O, 3 → E, 4 → A' };
  }

  if (type === 4) {
    // 8-9 char reverse word
    const reverseWords = ['PLATFORM', 'SECURITY', 'DATABASE', 'PROTOCOL', 'FUNCTION', 'VARIABLE', 'CONSTANT', 'COMPUTER', 'KEYBOARD', 'ABSTRACT', 'ASSEMBLY', 'COMPILER', 'OVERFLOW', 'TEMPLATE'];
    const word = pick(reverseWords);
    const reversed = word.split('').reverse().join('');
    return { type: 'reverse', display: `Reverse: ${reversed}`, answer: word, tag: 'Reverse', difficulty: 'Medium', hint: 'Type the word reversed back to its original form' };
  }

  if (type === 5) {
    // Extract digits from 8-9 char mixed string
    const a = rand(100, 999), b = rand(100, 999);
    const mixed = `A${a}BC${b}D`;
    const answer = `${a}${b}`;
    return { type: 'filter_num', display: `Numbers only: ${mixed}`, answer, tag: 'Filter', difficulty: 'Medium', hint: 'Extract and type ONLY the numbers' };
  }

  if (type === 6) {
    // Instruction-based with 8-9 char complexity
    const instructions = [
      { display: 'Type VOWELS from: PLATFORMS', answer: 'AOI', hint: 'P-L-A-T-F-O-R-M-S → vowels: A, O' },
      { display: 'Type VOWELS from: SECURITY', answer: 'EUI', hint: 'S-E-C-U-R-I-T-Y → vowels: E, U, I' },
      { display: 'Type CONSONANTS from: AUDIO', answer: 'D', hint: 'A-U-D-I-O → consonants: D' },
      { display: 'Type 2nd,4th,6th,8th letter of: PLATFORM', answer: 'LATOM', hint: 'P(1)L(2)A(3)T(4)F(5)O(6)R(7)M(8) → L,T,O,M' },
      { display: 'Count letters in: SECURITY → type', answer: '8', hint: 'S-E-C-U-R-I-T-Y = 8 letters' },
      { display: 'Count letters in: PLATFORM → type', answer: '8', hint: 'P-L-A-T-F-O-R-M = 8 letters' },
      { display: 'Type every 2nd letter of: CAPTCHACODE', answer: 'ACAOE', hint: 'C(1)A(2)P(3)T(4)C(5)H(6)A(7)C(8)O(9)D(10)E(11) → A,T,H,C,D' },
      { display: 'Type first 4 + last 4 of: PLATFORMS', answer: 'PLATORMS', hint: 'P-L-A-T + O-R-M-S' },
    ];
    const inst = pick(instructions);
    return { type: 'instruction', display: inst.display, answer: inst.answer, tag: 'Instruction', difficulty: 'Hard', hint: inst.hint };
  }

  if (type === 7) {
    // Similar character confusion — 8-9 chars
    const confusionPairs = [
      { display: 'Type: I1lO0oIl', answer: 'I1lO0oIl', hint: 'I=capital I, 1=one, l=lowercase L, O=letter O, 0=zero' },
      { display: 'Type exactly: 0O0OB8B8', answer: '0O0OB8B8', hint: '0=zero, O=letter, B=letter, 8=eight' },
      { display: 'Type exactly: Il1lI1lI', answer: 'Il1lI1lI', hint: 'I=capital I, l=lowercase L, 1=number one' },
      { display: 'Type exactly: S5S5Z2Z2', answer: 'S5S5Z2Z2', hint: 'S=letter, 5=five, Z=letter, 2=two' },
      { display: 'Type exactly: G6G6B8B8', answer: 'G6G6B8B8', hint: 'G=letter, 6=six, B=letter, 8=eight' },
      { display: 'Type exactly: rn m rn m', answer: 'rn m rn m', hint: 'rn = two letters r and n (not m)' },
      { display: 'Type exactly: 1lI1lI1l', answer: '1lI1lI1l', hint: '1=one, l=lowercase L, I=capital I' },
    ];
    const cp = pick(confusionPairs);
    return { type: 'confusion', display: cp.display, answer: cp.answer, tag: 'Confusion', difficulty: 'Hard', hint: cp.hint };
  }

  // type === 8: 8-9 char alphanumeric mixed case
  const mixedCharset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const length = rand(8, 9);
  const code = randomStr(length, mixedCharset);
  return {
    type: 'mixed',
    display: `Type exactly: ${code}`,
    answer: code,
    tag: 'Mixed Case',
    difficulty: 'Hard',
    hint: 'Case-sensitive! Uppercase and lowercase matter'
  };
}

const DIFFICULTY_COLORS = { Easy: 'bg-green-500', Medium: 'bg-yellow-500', Hard: 'bg-red-500' };
const TAG_COLORS = { Math: 'bg-pink-500', Text: 'bg-blue-500', Distorted: 'bg-purple-500', Jumbled: 'bg-orange-500', Reverse: 'bg-indigo-500', Filter: 'bg-cyan-500', Instruction: 'bg-rose-500', Confusion: 'bg-amber-500', 'Mixed Case': 'bg-teal-500' };

function generateAllCaptchas() {
  return Array.from({ length: TOTAL }, (_, i) => ({
    id: i + 1,
    ...generateCaptcha(),
    userInput: '',
    isSaved: false,
  }));
}

export default function CaptchaFilling() {
  const [user, setUser] = useState(null);
  const [captchas, setCaptchas] = useState(() => generateAllCaptchas());
  const [savedCount, setSavedCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(TASK_DURATION);
  const [showPreview, setShowPreview] = useState(true);
  const [lockStatus, setLockStatus] = useState({ isLocked: false, lockUntil: null });
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const navigate = useNavigate();
  const { registerTask, unregisterTask, lockAndLeave } = useTaskLock();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userSource = localStorage.getItem('workden_3_user_source');
        const savedUserId = localStorage.getItem('workden_3_login_id');
        if (userSource === 'appuser' && savedUserId) {
          const users = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
          if (users?.length > 0) { setUser(users[0]); return; }
        }
        setUser(await base44.auth.me());
      } catch (e) {
        const saved = localStorage.getItem('workden_3_user');
        if (saved) setUser(JSON.parse(saved));
      }
    };
    loadUser();
    const ls = getTaskLockStatus(TASK_NAME);
    setLockStatus(ls);
    const savedStart = sessionStorage.getItem(`task_start_${TASK_NAME}`);
    if (savedStart && !ls.isLocked) {
      setStartTime(parseInt(savedStart));
      setShowPreview(false);
      setShowRefreshWarning(true);
    }
  }, []);

  useEffect(() => {
    if (!startTime) return;
    const timer = setInterval(() => {
      setRemainingTime(Math.max(0, TASK_DURATION - Math.floor((Date.now() - startTime) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    return () => {
      unregisterTask();
      if (startTime && currentSessionId) {
        stopTaskActivity(currentSessionId, 'ABANDONED').catch(() => {});
        sessionStorage.removeItem(`task_start_${TASK_NAME}`);
        sessionStorage.removeItem(`task_session_${TASK_NAME}`);
        sessionStorage.removeItem('workden_active_task_name');
        currentSessionId = null;
      }
    };
  }, [startTime, unregisterTask]);


  const handleStart = async () => {
    const now = Date.now();
    setCaptchas(generateAllCaptchas());
    setStartTime(now);
    sessionStorage.setItem(`task_start_${TASK_NAME}`, now.toString());
    sessionStorage.setItem('workden_active_task_name', TASK_NAME);
    setShowPreview(false);

    try {
      currentSessionId = await startTaskActivity(user?.id, user?.full_name || user?.email, TASK_NAME, 'Hard Captcha Filling');
      sessionStorage.setItem(`task_session_${TASK_NAME}`, currentSessionId);
    } catch(e) {
      console.error('Failed to start activity:', e);
    }
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

  const handleInputChange = (id, value) => {
    setCaptchas(prev => prev.map(c => c.id === id ? { ...c, userInput: value } : c));
  };

  const handleSave = (id) => {
    const captcha = captchas.find(c => c.id === id);
    if (!captcha.userInput || captcha.userInput.trim() === '') {
      alert("Please enter the answer!"); return;
    }
    setCaptchas(prev => prev.map(c => c.id === id ? { ...c, isSaved: true } : c));
    setSavedCount(p => p + 1);
  };

  const downloadTXT = () => {
    const done = captchas.filter(c => c.isSaved);
    if (!done.length) { alert("No captchas saved yet!"); return; }
    const startDate = startTime ? new Date(startTime) : new Date();
    const endDate = new Date();
    const totalSec = Math.floor((endDate - startDate) / 1000);

    let txt = buildVIPReportHeader({ user, taskName: TASK_NAME, startDate, endDate, totalSec, completed: done.length, total: TOTAL, reward: REWARD });

    txt += `  ┌${'─'.repeat(56)}┐\n`;
    txt += `  │                CAPTCHA ANSWERS                         │\n`;
    txt += `  └${'─'.repeat(56)}┘\n\n`;

    done.forEach((c) => {
      txt += `  ╔${'═'.repeat(56)}╗\n`;
      txt += `  ║  ITEM #${String(c.id).padEnd(49)}║\n`;
      txt += `  ║  Type: ${(c.tag || '').padEnd(16)}  Difficulty: ${(c.difficulty || '').padEnd(22)}║\n`;
      txt += `  ╚${'═'.repeat(56)}╝\n`;
      txt += `  ${'Captcha'.padEnd(14)}: ${c.display}\n`;
      txt += `  ${'Your Answer'.padEnd(14)}: ${c.userInput}\n`;
      txt += `  ${'-'.repeat(58)}\n\n`;
    });

    txt += buildVIPReportFooter();

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `WorkDen_CaptchaFilling_Report_${new Date().toISOString().split('T')[0]}.txt`; a.click();
    URL.revokeObjectURL(url);
    alert(`✅ Downloaded ${done.length} captchas!\n\n📤 Upload to Google Drive and submit via Menu → "Submit Your Work"`);
  };

  if (lockStatus.isLocked) {
    return <TaskLockedScreen taskName={TASK_NAME} lockUntil={lockStatus.lockUntil} onBack={() => navigate(createPageUrl("Tasks"))} />;
  }

  if (showPreview) {
    const previewItems = captchas.slice(0, 2).map((cap) => ({
      id: cap.id,
      text: `${cap.tag} (${cap.difficulty}): ${cap.display}`,
      label: `Sample Captcha #${cap.id}`
    }));
    return (
      <TaskTimeGuard>
        <TaskPreviewScreen
          taskName="Hard Captcha Filling"
          reward={REWARD}
          total={TOTAL}
          previewItems={previewItems}
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
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <Button variant="ghost" size="icon" onClick={async () => {
            if (window.confirm("⚠️ If you leave this task, it will be LOCKED until tomorrow 9:00 AM. Do you want to continue?")) {
              if (currentSessionId) {
                try {
                  await stopTaskActivity(currentSessionId, 'STOPPED');
                } catch(e) { console.error('Failed to stop activity:', e); }
                currentSessionId = null;
              }
              sessionStorage.removeItem(`task_start_${TASK_NAME}`);
              sessionStorage.removeItem(`task_session_${TASK_NAME}`);
              sessionStorage.removeItem('workden_active_task_name');
              await new Promise(resolve => setTimeout(resolve, 300));
              lockAndLeave('/Tasks');
            }
          }} className="rounded-full border">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-purple-700">Captcha Filling</h1>
        </div>
        <div className="text-sm font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
          ⏱ {String(Math.floor(remainingTime/3600)).padStart(2,'0')}:{String(Math.floor((remainingTime%3600)/60)).padStart(2,'0')}:{String(remainingTime%60).padStart(2,'0')}
        </div>
        <span className="text-sm font-semibold text-gray-600">{savedCount}/{TOTAL}</span>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {captchas.map((captcha, index) => (
          <div key={captcha.id} className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
            <div className={`flex items-center justify-between px-5 py-4 text-white font-semibold ${
              index % 2 === 0
                ? 'bg-gradient-to-r from-purple-700 to-purple-500'
                : 'bg-gradient-to-r from-blue-500 to-teal-400'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 bg-white/25 rounded-full flex items-center justify-center font-bold text-base">{captcha.id}</span>
                <span className="text-lg font-bold">Item #{captcha.id}</span>
              </div>
              {!captcha.isSaved ? (
                <Button onClick={() => handleSave(captcha.id)} size="sm"
                  className="bg-white/20 hover:bg-white/35 text-white border border-white/40 font-semibold px-4 py-2 h-auto rounded-xl">
                  <Save className="w-4 h-4 mr-1.5" />Save
                </Button>
              ) : (
                <span className="text-sm bg-green-500 px-4 py-1.5 rounded-full font-semibold">✓ Saved</span>
              )}
            </div>

            <Card className="rounded-none border-0 shadow-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs font-bold ${TAG_COLORS[captcha.tag] || 'bg-gray-500'} text-white px-2 py-0.5 rounded-full`}>{captcha.tag}</span>
                  <span className={`text-xs font-bold ${DIFFICULTY_COLORS[captcha.difficulty]} text-white px-2 py-0.5 rounded-full`}>{captcha.difficulty}</span>
                </div>

                <div className="bg-gray-100 border-2 border-dashed border-gray-400 rounded-xl p-5 text-center select-none">
                  <p className={`font-black text-gray-900 tracking-widest ${
                    captcha.type === 'math' ? 'text-2xl' :
                    captcha.type === 'text' ? 'text-3xl font-mono' :
                    captcha.type === 'distorted' ? 'text-2xl font-mono italic' :
                    captcha.type === 'overlapping' ? 'text-xl font-mono font-black' :
                    captcha.type === 'instruction' ? 'text-sm font-semibold' :
                    captcha.type === 'confusion' ? 'text-2xl font-mono tracking-[0.3em]' :
                    captcha.type === 'filter_num' ? 'text-xl font-mono' :
                    captcha.type === 'mixed' ? 'text-2xl font-mono tracking-[0.25em]' :
                    'text-2xl font-mono'
                  }`}
                  style={
                    captcha.type === 'distorted' ? { letterSpacing: '0.25em', textShadow: '2px 2px 0 #aaa, -1px 0 0 #ccc', transform: 'skewX(-8deg)' } :
                    captcha.type === 'overlapping' ? { letterSpacing: '0.12em', textShadow: '1px 0 0 #888, -1px 0 0 #888' } :
                    captcha.type === 'confusion' ? { fontFamily: 'monospace', textShadow: '1px 1px 4px rgba(0,0,0,0.35)' } :
                    captcha.type === 'mixed' ? { fontFamily: 'monospace', textShadow: '1px 1px 3px rgba(80,0,180,0.25)', letterSpacing: '0.25em' } :
                    {}
                  }
                  >
                    {captcha.display}
                  </p>
                  {captcha.hint && (
                    <p className="text-xs text-gray-500 mt-2 italic">💡 {captcha.hint}</p>
                  )}
                </div>

                <Input
                  placeholder={
                    captcha.type === 'reverse' ? "Type the original word..." :
                    captcha.type === 'math' ? "Enter the number answer..." :
                    captcha.type === 'filter_num' ? "Type only the numbers..." :
                    captcha.type === 'instruction' ? "Follow the instruction above..." :
                    captcha.type === 'mixed' ? "Type exactly (case-sensitive)..." :
                    "Enter captcha answer..."
                  }
                  value={captcha.userInput}
                  onChange={e => handleInputChange(captcha.id, e.target.value)}
                  disabled={captcha.isSaved}
                  className="border border-gray-300 focus:border-purple-400 text-center text-base font-bold h-11 bg-white font-mono"
                  onPaste={e => e.preventDefault()}
                />
              </CardContent>
            </Card>
          </div>
        ))}

        <div className="pt-4 pb-8">
          <button
            onClick={downloadTXT}
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
