import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SendNotificationDialog({ open, onClose, users = [], appUsers = [], onSuccess }) {
  const [form, setForm] = useState({ title: "", message: "", target: "all", user_id: "" });
  const [userSearch, setUserSearch] = useState("");
  const [sending, setSending] = useState(false);

  const allUsers = [
    ...users.filter(u => u.role !== 'admin'),
    ...appUsers.filter(au => au.role !== 'admin' && !users.some(u => u.login_user_id === au.login_user_id))
  ];

  const filteredUsers = allUsers.filter(u =>
    !userSearch ||
    u.full_name?.toString().toLowerCase().includes(userSearch.toLowerCase()) ||
    u.login_user_id?.toString().toLowerCase().includes(userSearch.toLowerCase())
  ).slice(0, 20);

  const handleSend = async () => {
    if (!form.title || !form.message) { alert("Please fill title and message"); return; }
    if (form.target === 'specific' && !form.user_id) { alert("Please select a specific user"); return; }
    setSending(true);
    try {
      const data = { title: form.title, message: form.message, type: "info" };
      if (form.target === 'specific') data.user_id = form.user_id;
      await base44.entities.Notification.create(data);
      setForm({ title: "", message: "", target: "all", user_id: "" });
      setUserSearch("");
      onSuccess?.();
      onClose?.();
      alert("✅ Notification sent!");
    } catch (e) { alert("❌ Failed to send"); } finally { setSending(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Send To</Label>
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant={form.target === 'all' ? 'default' : 'outline'} onClick={() => setForm({ ...form, target: 'all', user_id: '' })}>📢 All Users</Button>
              <Button size="sm" variant={form.target === 'specific' ? 'default' : 'outline'} onClick={() => setForm({ ...form, target: 'specific' })}>👤 Specific User</Button>
            </div>
          </div>
          {form.target === 'specific' && (
            <div>
              <Label>Select User</Label>
              <Input placeholder="Search by name or ID..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="mt-1 mb-2" />
              <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                {filteredUsers.map(u => (
                  <button key={u.id} type="button" onClick={() => setForm({ ...form, user_id: u.id })}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${form.user_id === u.id ? 'bg-blue-100 font-semibold' : ''}`}>
                    {u.full_name} <span className="text-gray-400 text-xs">({u.login_user_id || u.id?.substring(0, 8)})</span>
                    {form.user_id === u.id && <span className="ml-2 text-blue-600">✓</span>}
                  </button>
                ))}
                {filteredUsers.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">No users found</p>}
              </div>
              {form.user_id && <p className="text-xs text-green-600 mt-1">✓ User selected</p>}
            </div>
          )}
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notification title..." /></div>
          <div><Label>Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Notification message..." /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending}>{sending ? "Sending..." : `Send ${form.target === 'specific' ? 'to User' : 'to All'}`}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}