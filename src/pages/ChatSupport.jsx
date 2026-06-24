import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, MessageSquare, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const TOTAL = 125;
const TYPES = ['PAYMENT', 'REFUND', 'DELIVERY', 'TECHNICAL', 'ACCOUNT', 'PRODUCT', 'BILLING', 'CUSTOMER_SERVICE'];
const BASE_ISSUES = [
  'Payment gateway showing error message','Order not received after 10 days',
  'Wrong item delivered in package','Cannot access my account dashboard',
  'Password reset link not working','Charged twice for same order',
  'Product quality not as advertised','Need invoice for last month',
  'Tracking number not updating','Want to change delivery address',
  'Cancellation refund pending','Coupon code rejected at checkout',
  'Subscription auto-renewed without permission','Account suspended without reason',
  'Missing items from order','Product damaged during shipping',
  'Return policy clarification needed','Exchange process timeline',
  'Warranty claim process question','Bulk order discount inquiry',
];

const queries = Array.from({ length: TOTAL }, (_, i) => {
  const base = BASE_ISSUES[i % BASE_ISSUES.length];
  const vars = [`${base} - urgent resolution needed`,`Facing issue: ${base}`,`Need help with ${base}`,`Problem regarding ${base}`,`${base} - please assist`,`Query about ${base}`];
  return { id: i + 1, type: TYPES[i % TYPES.length], issue: vars[i % vars.length], sampleAnswer: "I understand your concern and I'm here to help. Let me check the details and provide a solution right away." };
});

export default function ChatSupport() {
  const [savedAnswers, setSavedAnswers] = useState({});
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(8 * 60 * 60);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      setRemainingTime(Math.max(0, 8 * 60 * 60 - elapsed));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const handleSave = (id, answer) => {
    if (!answer.trim()) { alert("Please write a response before submitting!"); return; }
    setSavedAnswers(prev => ({ ...prev, [id]: answer }));
    alert(`Response ${id} saved!\n\n💡 Complete all queries, download CSV, then submit via Menu → "Submit Your Work"`);
    const el = document.getElementById(`answer-${id}`);
    if (el) el.value = '';
  };

  const savedCount = Object.keys(savedAnswers).length;

  const downloadCSV = () => {
    if (!savedCount) { alert("No responses saved yet!"); return; }
    let csv = 'No,Query Type,Query,Response,Saved At\n';
    Object.entries(savedAnswers).forEach(([id, answer]) => {
      const q = queries.find(x => x.id === parseInt(id));
      const esc = s => `"${String(s).replace(/"/g,'""')}"`;
      if (q) csv += `${id},${q.type},${esc(q.issue)},${esc(answer)},${esc(new Date().toLocaleString())}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `chat-support-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    alert(`✅ CSV Downloaded!\n\n📤 Submit via Menu (☰) → "Submit Your Work"`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Tasks"))} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Chat Support Q&A</h1>
              <p className="text-teal-100 text-xs">{TOTAL} Queries • Payment: ₹450</p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-xl">
              <p className="text-xs text-teal-100">Saved</p>
              <p className="text-xl font-bold">{savedCount}/{TOTAL}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-2 p-2.5 bg-white/10 rounded-xl">
              <Clock className="w-4 h-4 text-teal-200" />
              <div><p className="text-xs text-teal-200">Elapsed</p><p className="font-bold">{formatTime(elapsedTime)}</p></div>
            </div>
            <div className={`flex items-center gap-2 p-2.5 rounded-xl ${remainingTime < 1800 ? 'bg-red-500/30' : 'bg-white/10'}`}>
              <Clock className="w-4 h-4 text-orange-200" />
              <div><p className="text-xs text-orange-200">Remaining</p><p className="font-bold">{formatTime(remainingTime)}</p></div>
            </div>
          </div>
          <Button onClick={downloadCSV} variant="secondary" className="w-full bg-white text-teal-600 hover:bg-teal-50 font-semibold" disabled={savedCount === 0}>
            <Download className="w-4 h-4 mr-2" />Download CSV ({savedCount})
          </Button>
          {savedCount > 0 && <p className="text-xs text-center text-teal-100 mt-2">💡 Submit via Menu (☰) → "Submit Your Work"</p>}
        </div>

        <div className="space-y-5">
          {queries.map(query => {
            const isSaved = !!savedAnswers[query.id];
            return (
              <Card key={query.id} className={`shadow-lg border-2 ${isSaved ? 'border-green-400 bg-green-50/30' : 'border-teal-200'}`}>
                <CardHeader className="py-3 px-4 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-teal-900 flex items-center gap-2 text-base">
                      <span className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">{query.id}</span>
                      Query #{query.id}
                    </CardTitle>
                    <div className="flex gap-2">
                      {isSaved && <Badge className="bg-green-500 text-white text-xs">✓ Saved</Badge>}
                      <Badge className="bg-teal-100 text-teal-700 border border-teal-200 text-xs">{query.type}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2 font-medium text-sm">{query.issue}</p>
                  <p className="text-xs text-gray-500 mt-1 bg-blue-50 p-2 rounded-lg border-l-4 border-blue-400">Sample: {query.sampleAnswer}</p>
                </CardHeader>
                <CardContent className="pt-4 px-4">
                  {!isSaved ? (
                    <>
                      <Textarea id={`answer-${query.id}`} placeholder="Type your professional response here..." className="mb-3 border-2 border-teal-200 focus:border-teal-400 text-sm" rows={4} />
                      <Button onClick={() => { const el = document.getElementById(`answer-${query.id}`); if (el) handleSave(query.id, el.value); }}
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-5">
                        Submit Response
                      </Button>
                    </>
                  ) : (
                    <div className="p-3 bg-green-100 rounded-xl text-center text-green-700 font-semibold text-sm">✓ Response Saved Successfully</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
