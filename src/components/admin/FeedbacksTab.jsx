import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function FeedbacksTab({ userFeedbacks }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const filtered = userFeedbacks.filter(fb => {
    if (categoryFilter !== 'all' && fb.experience !== categoryFilter) return false;
    if (dateFilter === 'all') return true;
    const d = new Date(fb.created_date);
    const now = new Date();
    if (dateFilter === 'today') { const s = new Date(now.setHours(0,0,0,0)); return d >= s; }
    if (dateFilter === 'yesterday') {
      const s = new Date(now); s.setDate(s.getDate()-1); s.setHours(0,0,0,0);
      const e = new Date(s); e.setHours(23,59,59,999);
      return d >= s && d <= e;
    }
    if (dateFilter === 'custom' && customRange.start && customRange.end) {
      const s = new Date(customRange.start), e = new Date(customRange.end); e.setHours(23,59,59,999);
      return d >= s && d <= e;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Star className="w-6 h-6" />User Feedbacks</CardTitle>
          <Badge className="bg-white/20 text-white text-lg px-4 py-2">{userFeedbacks.length} Total</Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {['all','excellent','good','average','poor'].map(c => (
            <Button key={c} size="sm" variant={categoryFilter === c ? 'default' : 'outline'} className="bg-white/20 hover:bg-white/30" onClick={() => setCategoryFilter(c)}>{c.charAt(0).toUpperCase()+c.slice(1)}</Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {['all','today','yesterday','custom'].map(d => (
            <Button key={d} size="sm" variant={dateFilter === d ? 'default' : 'outline'} className="bg-white/20 hover:bg-white/30" onClick={() => setDateFilter(d)}>{d.charAt(0).toUpperCase()+d.slice(1)}</Button>
          ))}
        </div>
        {dateFilter === 'custom' && (
          <div className="flex gap-2 mt-2">
            <Input type="date" value={customRange.start} onChange={e => setCustomRange(p => ({...p, start: e.target.value}))} className="max-w-xs" />
            <Input type="date" value={customRange.end} onChange={e => setCustomRange(p => ({...p, end: e.target.value}))} className="max-w-xs" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {filtered.length > 0 ? filtered.map(fb => (
          <Card key={fb.id} className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold">{fb.user_name}</p>
                  <p className="text-xs text-gray-500">{new Date(fb.created_date).toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_,i) => (
                    <Star key={i} className={`w-4 h-4 ${i < fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <Badge className="mb-2">{fb.experience}</Badge>
              {fb.issues_faced && <div className="mt-2 p-2 bg-red-50 rounded"><p className="text-xs font-semibold text-red-800">Issues:</p><p className="text-sm text-red-700">{fb.issues_faced}</p></div>}
              {fb.suggestions && <div className="mt-2 p-2 bg-blue-50 rounded"><p className="text-xs font-semibold text-blue-800">Suggestions:</p><p className="text-sm text-blue-700">{fb.suggestions}</p></div>}
            </CardContent>
          </Card>
        )) : <p className="text-center text-gray-500 py-12">No feedbacks found</p>}
      </CardContent>
    </Card>
  );
}