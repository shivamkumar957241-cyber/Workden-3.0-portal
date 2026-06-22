import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, Eye, RefreshCw, Clock, Zap, AlertTriangle, Trash2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDur = (sec) => {
  if (!sec || sec <= 0) return 'N/A';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
};

const timeSince = (dateStr) => {
  if (!dateStr) return 'N/A';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// Stale session detection — agar 30 min se koi heartbeat nahi toh stale maano
const isStale = (activity) => {
  const lastSeen = activity.behavior_data?.last_activity || activity.start_time;
  if (!lastSeen) return true;
  const diffMin = (Date.now() - new Date(lastSeen).getTime()) / 60000;
  return diffMin > 30;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const avatarColors = [
  { bg: '#E6F1FB', text: '#0C447C' },
  { bg: '#EAF3DE', text: '#27500A' },
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#E1F5EE', text: '#085041' },
  { bg: '#FAEEDA', text: '#633806' },
  { bg: '#FBEAF0', text: '#72243E' },
];

const getAvatarColor = (name) => {
  const idx = (name || '').charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
};

// ─── Confirm Delete Dialog ─────────────────────────────────────────────────────
function ConfirmDeleteDialog({ open, onClose, onConfirm, userName, type }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <Trash2 className="w-5 h-5" /> Delete Activity
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to remove <span className="font-bold text-gray-900">{userName}</span>'s {type === 'live' ? 'live session' : 'history record'} from the tracker?
          </p>
          <p className="text-xs text-gray-400">Note: This only removes from the activity view. User account is not affected.</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={onConfirm}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Live Activity Detail Dialog ───────────────────────────────────────────────
function LiveDetailDialog({ activity, open, onClose }) {
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!activity) return null;
  const b = activity.behavior_data || {};
  const totalTyped = b.total_typed_chars || 0;
  const totalPasted = b.total_pasted_chars || 0;
  const typingRatio = (totalTyped + totalPasted) > 0 ? Math.round((totalTyped / (totalTyped + totalPasted)) * 100) : null;
  const pasteRatio = 100 - (typingRatio ?? 100);
  const flags = [];
  if ((b.tab_switch_count || 0) > 10) flags.push({ level: 'high', msg: `Excessive tab switching (${b.tab_switch_count})` });
  else if ((b.tab_switch_count || 0) > 5) flags.push({ level: 'med', msg: `Frequent tab switching (${b.tab_switch_count})` });
  if (pasteRatio > 50 && totalPasted > 50) flags.push({ level: 'high', msg: `High paste ratio: ${pasteRatio}%` });
  if ((b.paste_event_count || 0) > 5) flags.push({ level: 'med', msg: `Multiple paste events: ${b.paste_event_count}` });
  if ((b.wpm || 0) > 120) flags.push({ level: 'high', msg: `Unrealistic typing speed: ${b.wpm} WPM` });
  if ((b.backspace_count || 0) === 0 && totalTyped > 200) flags.push({ level: 'med', msg: 'No backspace usage — possible copy-paste' });
  if ((b.screen_hidden_events || 0) > 5) flags.push({ level: 'high', msg: `Multiple screen hidden events: ${b.screen_hidden_events}` });

  const elapsedSec = Math.floor((nowTick - new Date(activity.start_time).getTime()) / 1000);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: getAvatarColor(activity.user_name).bg, color: getAvatarColor(activity.user_name).text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
              {getInitials(activity.user_name)}
            </div>
            <div>
              <p className="text-base font-bold">{activity.user_name}</p>
              <p className="text-xs font-normal text-gray-500">Live Activity Details</p>
            </div>
            <Badge className="ml-auto bg-green-100 text-green-800 border border-green-300 animate-pulse">LIVE</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border bg-gray-50 text-center">
              <p className="text-xs text-gray-500 mb-1">Task</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{activity.task_name || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-xl border bg-blue-50 text-center">
              <p className="text-xs text-gray-500 mb-1">Active Time</p>
              <p className="text-sm font-semibold text-blue-800">{fmtDur(elapsedSec)}</p>
            </div>
            <div className="p-3 rounded-xl border bg-purple-50 text-center">
              <p className="text-xs text-gray-500 mb-1">Last Seen</p>
              <p className="text-sm font-semibold text-purple-800">{timeSince(b.last_activity)}</p>
            </div>
          </div>

          {/* Flags */}
          {flags.length > 0 && (
            <div className="p-3 rounded-xl border-2 border-red-200 bg-red-50">
              <p className="text-xs font-bold text-red-800 flex items-center gap-1 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Suspicious Activity
              </p>
              <div className="space-y-1">
                {flags.map((f, i) => (
                  <div key={i} className={`text-xs flex items-center gap-1.5 ${f.level === 'high' ? 'text-red-700' : 'text-orange-600'}`}>
                    <span>{f.level === 'high' ? '🚨' : '⚠️'}</span> {f.msg}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Typing */}
          <div className="p-4 rounded-xl border bg-cyan-50">
            <p className="text-xs font-bold text-cyan-800 mb-3">Typing Analysis</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { label: 'Typed', value: totalTyped },
                { label: 'Pasted', value: totalPasted },
                { label: 'WPM', value: b.wpm || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-black text-cyan-700">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
            {typingRatio !== null && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Typed {typingRatio}%</span><span>Pasted {pasteRatio}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${typingRatio < 50 ? 'bg-red-500' : typingRatio < 70 ? 'bg-yellow-400' : 'bg-green-500'}`} style={{ width: `${typingRatio}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Behavior Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border bg-indigo-50">
              <p className="text-xs font-bold text-indigo-800 mb-3">Tab & Focus</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Tab Switches', value: b.tab_switch_count || 0 },
                  { label: 'Paste Events', value: b.paste_event_count || 0 },
                  { label: 'Backspaces', value: b.backspace_count || 0 },
                  { label: 'Idle Time', value: b.idle_time_seconds ? Math.floor(b.idle_time_seconds / 60) + 'm' : '0m' },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-lg font-black text-indigo-700">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-gray-50">
              <p className="text-xs font-bold text-gray-700 mb-3">Screen Behavior</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Min Count', value: b.window_minimized_count || 0 },
                  { label: 'Min Duration', value: (b.window_minimized_seconds || 0) + 's' },
                  { label: 'Hidden Events', value: b.screen_hidden_events || 0 },
                  { label: 'Last Paste Len', value: b.paste_event_last_length || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-lg font-black text-gray-700">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border bg-gray-50 text-xs text-gray-500">
            <p>Session ID: <span className="font-mono text-gray-700">{activity.session_id}</span></p>
            <p>Started: {activity.start_time ? new Date(activity.start_time).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── History Detail Dialog ─────────────────────────────────────────────────────
function HistoryDetailDialog({ history, open, onClose }) {
  if (!history) return null;
  const b = history.behavior_data || {};
  const totalTyped = b.total_typed_chars || 0;
  const totalPasted = b.total_pasted_chars || 0;
  const typingRatio = (totalTyped + totalPasted) > 0 ? Math.round((totalTyped / (totalTyped + totalPasted)) * 100) : null;
  const pasteRatio = 100 - (typingRatio ?? 100);
  const flags = [];
  if ((b.tab_switch_count || 0) > 10) flags.push({ level: 'high', msg: `Excessive tab switching (${b.tab_switch_count})` });
  if (pasteRatio > 50 && totalPasted > 50) flags.push({ level: 'high', msg: `High paste ratio: ${pasteRatio}%` });
  if ((b.wpm || 0) > 120) flags.push({ level: 'high', msg: `Unrealistic typing speed: ${b.wpm} WPM` });
  if ((b.backspace_count || 0) === 0 && totalTyped > 200) flags.push({ level: 'med', msg: 'No backspace usage' });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: getAvatarColor(history.user_name).bg, color: getAvatarColor(history.user_name).text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
              {getInitials(history.user_name)}
            </div>
            <div>
              <p className="text-base font-bold">{history.user_name}</p>
              <p className="text-xs font-normal text-gray-500">Completed Task Details</p>
            </div>
            <Badge className={`ml-auto ${history.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
              {history.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Time Summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Task', value: history.task_name || 'N/A', color: 'bg-gray-50' },
              { label: 'Start', value: history.start_time ? new Date(history.start_time).toLocaleTimeString() : 'N/A', color: 'bg-blue-50' },
              { label: 'End', value: history.end_time ? new Date(history.end_time).toLocaleTimeString() : 'N/A', color: 'bg-purple-50' },
              { label: 'Duration', value: fmtDur(history.total_duration), color: 'bg-green-50' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-3 rounded-xl border ${color} text-center`}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xs font-semibold text-gray-800 truncate">{value}</p>
              </div>
            ))}
          </div>

          {flags.length > 0 && (
            <div className="p-3 rounded-xl border-2 border-red-200 bg-red-50">
              <p className="text-xs font-bold text-red-800 flex items-center gap-1 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Suspicious Activity
              </p>
              {flags.map((f, i) => (
                <p key={i} className={`text-xs ${f.level === 'high' ? 'text-red-700' : 'text-orange-600'}`}>
                  {f.level === 'high' ? '🚨' : '⚠️'} {f.msg}
                </p>
              ))}
            </div>
          )}

          <div className="p-4 rounded-xl border bg-cyan-50">
            <p className="text-xs font-bold text-cyan-800 mb-3">Typing Analysis</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { label: 'Typed', value: totalTyped },
                { label: 'Pasted', value: totalPasted },
                { label: 'WPM', value: b.wpm || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-black text-cyan-700">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
            {typingRatio !== null && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Typed {typingRatio}%</span><span>Pasted {pasteRatio}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${typingRatio < 50 ? 'bg-red-500' : typingRatio < 70 ? 'bg-yellow-400' : 'bg-green-500'}`} style={{ width: `${typingRatio}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border bg-indigo-50">
              <p className="text-xs font-bold text-indigo-800 mb-3">Tab & Focus</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Tab Switches', value: b.tab_switch_count || 0 },
                  { label: 'Paste Events', value: b.paste_event_count || 0 },
                  { label: 'Backspaces', value: b.backspace_count || 0 },
                  { label: 'Idle Time', value: b.idle_time_seconds ? Math.floor(b.idle_time_seconds / 60) + 'm' : '0m' },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-lg font-black text-indigo-700">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-gray-50">
              <p className="text-xs font-bold text-gray-700 mb-3">Screen & Items</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Min Duration', value: (b.window_minimized_seconds || 0) + 's' },
                  { label: 'Hidden Events', value: b.screen_hidden_events || 0 },
                  { label: 'Active Time', value: fmtDur(b.active_seconds) },
                  { label: 'Items Saved', value: b.items_saved || b.entries_completed || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-lg font-black text-gray-700">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border bg-gray-50 text-xs text-gray-500">
            <p>Session ID: <span className="font-mono text-gray-700">{history.session_id}</span></p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Live User Card ────────────────────────────────────────────────────────────
function LiveUserCard({ activity, nowTick, onView, onDelete }) {
  const b = activity.behavior_data || {};
  const elapsedSec = Math.floor((nowTick - new Date(activity.start_time).getTime()) / 1000);
  const totalTyped = b.total_typed_chars || 0;
  const totalPasted = b.total_pasted_chars || 0;
  const pasteRatio = (totalTyped + totalPasted) > 0 ? Math.round((totalPasted / (totalTyped + totalPasted)) * 100) : 0;
  const tabCount = b.tab_switch_count || 0;
  const wpm = b.wpm || 0;
  const stale = isStale(activity);

  const hasFlags = pasteRatio > 50 || tabCount > 10 || wpm > 120;
  const avatarColor = getAvatarColor(activity.user_name);

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all ${stale ? 'border-gray-200 bg-gray-50 opacity-70' : hasFlags ? 'border-yellow-300 bg-yellow-50' : 'border-green-200 bg-white'}`}>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor.bg, color: avatarColor.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          {getInitials(activity.user_name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 text-sm truncate">{activity.user_name}</p>
            {stale ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">Inactive</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium animate-pulse">● Live</span>
            )}
            {hasFlags && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 font-medium">⚠ Flagged</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {activity.task_name} • {stale ? `Last seen ${timeSince(b.last_activity || activity.start_time)}` : `Active ${fmtDur(elapsedSec)}`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" onClick={() => onView(activity)} className="h-8 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50">
            <Eye className="w-3.5 h-3.5" /> View
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(activity)} className="h-8 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {[
          { icon: '⌨️', label: 'Typed', value: totalTyped },
          { icon: '📋', label: 'Pasted', value: totalPasted },
          { icon: '🔄', label: 'Tabs', value: tabCount, alert: tabCount > 10 },
          { icon: '⚡', label: 'WPM', value: wpm, alert: wpm > 120 },
          { icon: '⏸️', label: 'Idle', value: b.idle_time_seconds ? Math.floor(b.idle_time_seconds / 60) + 'm' : '0m' },
        ].map(({ icon, label, value, alert }) => (
          <div key={label} className={`text-center p-2 rounded-xl ${alert ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-100'}`}>
            <p className="text-base">{icon}</p>
            <p className={`text-sm font-bold ${alert ? 'text-red-700' : 'text-gray-800'}`}>{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── History User Card ─────────────────────────────────────────────────────────
function HistoryUserCard({ history, onView, onDelete }) {
  const b = history.behavior_data || {};
  const totalTyped = b.total_typed_chars || 0;
  const totalPasted = b.total_pasted_chars || 0;
  const pasteRatio = (totalTyped + totalPasted) > 0 ? Math.round((totalPasted / (totalTyped + totalPasted)) * 100) : 0;
  const tabCount = b.tab_switch_count || 0;
  const wpm = b.wpm || 0;
  const hasFlags = pasteRatio > 50 || tabCount > 10 || wpm > 120;
  const isCompleted = history.status === 'COMPLETED';
  const avatarColor = getAvatarColor(history.user_name);

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all ${hasFlags ? 'border-yellow-300 bg-yellow-50' : isCompleted ? 'border-green-200 bg-white' : 'border-red-200 bg-white'}`}>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor.bg, color: avatarColor.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          {getInitials(history.user_name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 text-sm truncate">{history.user_name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {history.status}
            </span>
            {hasFlags && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 font-medium">⚠ Flagged</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {history.task_name} • Duration: {fmtDur(history.total_duration)} • {timeSince(history.end_time)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" onClick={() => onView(history)} className="h-8 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50">
            <Eye className="w-3.5 h-3.5" /> View
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(history)} className="h-8 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {[
          { icon: '⌨️', label: 'Typed', value: totalTyped },
          { icon: '📋', label: 'Pasted', value: totalPasted },
          { icon: '🔄', label: 'Tabs', value: tabCount, alert: tabCount > 10 },
          { icon: '⚡', label: 'WPM', value: wpm, alert: wpm > 120 },
          { icon: '💾', label: 'Items', value: b.items_saved || b.entries_completed || 0 },
        ].map(({ icon, label, value, alert }) => (
          <div key={label} className={`text-center p-2 rounded-xl ${alert ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-100'}`}>
            <p className="text-base">{icon}</p>
            <p className={`text-sm font-bold ${alert ? 'text-red-700' : 'text-gray-800'}`}>{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ActivityTab ──────────────────────────────────────────────────────────
export default function ActivityTab({ taskActivityLogs, proofs, tasks, activityDateFilter, setActivityDateFilter, activityTaskType, setActivityTaskType, activityStatus, setActivityStatus, activitySearch, setActivitySearch, onRefresh }) {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [liveActivities, setLiveActivities] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [nowTick, setNowTick] = useState(Date.now());

  // View detail states
  const [viewLive, setViewLive] = useState(null);
  const [viewHistory, setViewHistory] = useState(null);

  // Delete confirm states
  const [deleteTarget, setDeleteTarget] = useState(null); // { item, type: 'live' | 'history' }

  // 1s ticker for live timers
  useEffect(() => {
    const ticker = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  // 10s polling
  useEffect(() => {
    const fetchData = async () => {
      try {
        const live = await base44.entities.LiveActivity.list('-start_time', 100);
        setLiveActivities(live || []);
      } catch (e) { console.error('LiveActivity fetch error:', e); }
      try {
        const hist = await base44.entities.ActivityHistory.list('-end_time', 50);
        setActivityHistory(hist || []);
      } catch (e) { console.error('ActivityHistory fetch error:', e); }
      setLastRefresh(new Date());
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    try {
      const live = await base44.entities.LiveActivity.list(undefined, 100);
      setLiveActivities(live || []);
      const hist = await base44.entities.ActivityHistory.list('-end_time', 100);
      setActivityHistory(hist || []);
      setLastRefresh(new Date());
      if (onRefresh) onRefresh();
    } catch (e) {}
  };

  // Delete handlers
  const handleDeleteLive = async (item) => {
    try {
      await base44.entities.LiveActivity.delete(item.id);
      setLiveActivities(prev => prev.filter(a => a.id !== item.id));
    } catch (e) { console.error('Delete live error:', e); }
    setDeleteTarget(null);
  };

  const handleDeleteHistory = async (item) => {
    try {
      await base44.entities.ActivityHistory.delete(item.id);
      setActivityHistory(prev => prev.filter(a => a.id !== item.id));
    } catch (e) { console.error('Delete history error:', e); }
    setDeleteTarget(null);
  };

  // Filters
  const applyDateFilter = (list, dateField) => list.filter(activity => {
    if (activitySearch && !activity.user_name?.toString().toLowerCase().includes(activitySearch.toLowerCase())) return false;
    if (activityTaskType !== 'all' && activity.task_name !== activityTaskType) return false;
    const now = new Date();
    const d = new Date(activity[dateField]);
    if (activityDateFilter === 'today') { const s = new Date(now); s.setHours(0,0,0,0); return d >= s; }
    if (activityDateFilter === 'yesterday') { const s = new Date(now); s.setDate(s.getDate()-1); s.setHours(0,0,0,0); const e = new Date(s); e.setHours(23,59,59,999); return d >= s && d <= e; }
    if (activityDateFilter === 'last_hour') return d >= new Date(now.getTime() - 3600000);
    return true;
  });

  const filteredLive = applyDateFilter(liveActivities, 'start_time');
  const filteredHistory = applyDateFilter(activityHistory, 'end_time');

  // Separate active vs stale in live
  const activeLive = filteredLive.filter(a => !isStale(a));
  const staleLive = filteredLive.filter(a => isStale(a));

  return (
    <div className="space-y-5">

      {/* ── Header / Filters ── */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-base tracking-tight">Live Activity Tracker</p>
              <p className="text-slate-400 text-xs mt-0.5">Real-time monitoring • Auto-refreshes every 10s</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-slate-400 text-xs">{lastRefresh.toLocaleTimeString()}</p>
              <Button size="sm" onClick={handleManualRefresh} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-7 text-xs gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </Button>
            </div>
          </div>

          {/* Date filter pills */}
          <div className="flex gap-1.5 mt-3">
            {[['all','All Time'],['today','Today'],['yesterday','Yesterday'],['last_hour','Last Hour']].map(([val, label]) => (
              <button key={val} onClick={() => setActivityDateFilter(val)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${activityDateFilter === val ? 'bg-white text-slate-800' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white px-5 py-3 border-t border-gray-100 grid md:grid-cols-2 gap-3">
          <Select value={activityTaskType} onValueChange={setActivityTaskType}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Tasks" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              {tasks.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Search by name..." value={activitySearch} onChange={e => setActivitySearch(e.target.value)} className="h-8 text-xs" />
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Now', value: activeLive.length, color: 'text-green-700', bg: 'bg-green-50 border-green-200', dot: true },
          { label: 'Inactive Sessions', value: staleLive.length, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
          { label: 'Tasks Completed', value: filteredHistory.filter(a => a.status === 'COMPLETED').length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Tasks Abandoned', value: filteredHistory.filter(a => a.status === 'ABANDONED').length, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
        ].map(({ label, value, color, bg, dot }) => (
          <div key={label} className={`rounded-2xl border-2 p-4 text-center ${bg}`}>
            <div className="flex items-center justify-center gap-1.5">
              {dot && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
              <p className={`text-3xl font-black ${color}`}>{value}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Currently Working ── */}
      <div className="rounded-2xl border-2 border-green-300 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-white" />
            <p className="text-white font-bold text-sm">Currently Working</p>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{activeLive.length} active</span>
            {staleLive.length > 0 && <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full">{staleLive.length} inactive</span>}
          </div>
        </div>
        <div className="bg-white p-3 space-y-3">
          {filteredLive.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">No live sessions found</p>
            </div>
          ) : (
            <>
              {activeLive.map(activity => (
                <LiveUserCard key={activity.id} activity={activity} nowTick={nowTick}
                  onView={setViewLive}
                  onDelete={(item) => setDeleteTarget({ item, type: 'live' })}
                />
              ))}
              {staleLive.length > 0 && (
                <>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-px bg-gray-200" />
                    <p className="text-xs text-gray-400 font-medium">Inactive / Stale Sessions</p>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  {staleLive.map(activity => (
                    <LiveUserCard key={activity.id} activity={activity} nowTick={nowTick}
                      onView={setViewLive}
                      onDelete={(item) => setDeleteTarget({ item, type: 'live' })}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── History ── */}
      <div className="rounded-2xl border-2 border-indigo-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white" />
            <p className="text-white font-bold text-sm">Completed Tasks History</p>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{filteredHistory.length} records</span>
          </div>
        </div>
        <div className="bg-white p-3 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-gray-400 text-sm">No history found</p>
            </div>
          ) : (
            filteredHistory.map(history => (
              <HistoryUserCard key={history.id} history={history}
                onView={setViewHistory}
                onDelete={(item) => setDeleteTarget({ item, type: 'history' })}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}
      <LiveDetailDialog activity={viewLive} open={!!viewLive} onClose={() => setViewLive(null)} />
      <HistoryDetailDialog history={viewHistory} open={!!viewHistory} onClose={() => setViewHistory(null)} />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget?.type === 'live' ? handleDeleteLive(deleteTarget.item) : handleDeleteHistory(deleteTarget.item)}
        userName={deleteTarget?.item?.user_name}
        type={deleteTarget?.type}
      />
    </div>
  );
}