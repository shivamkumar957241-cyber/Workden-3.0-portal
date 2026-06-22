import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, CheckCircle, BarChart3, Download } from "lucide-react";

export default function RecruiterDashboardDialog({ open, onClose, recruiter, proofs, users, filter, onFilterChange, customDateRange, onDateRangeChange }) {
  const [liveProofs, setLiveProofs] = useState(proofs);
  const [liveUsers, setLiveUsers] = useState(users);

  // Auto-refresh data every 8 seconds when dialog is open
  useEffect(() => {
    setLiveProofs(proofs);
    setLiveUsers(users);
  }, [proofs, users]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(async () => {
      try {
        const fresh = await base44.entities.Proof.list('-created_date');
        setLiveProofs(fresh);
      } catch (e) {}
    }, 8000);
    return () => clearInterval(interval);
  }, [open]);

  if (!recruiter) return null;

  // Use live data for calculations
  const allProofs = liveProofs;
  const allUsers = liveUsers;

  const allRecruiterUsers = allUsers.filter(u => {
    const nameMatch = u.assigned_recruiter_name?.trim().toLowerCase() === recruiter.name?.trim().toLowerCase();
    const idMatch = u.assigned_recruiter_id && String(u.assigned_recruiter_id).trim() === String(recruiter.id).trim();
    return nameMatch || idMatch;
  });

  const allUserIds = allRecruiterUsers.map(u => String(u.id));

  const getFilteredProofs = () => {
    const approved = allProofs.filter(p => p.status === 'approved' && allUserIds.includes(String(p.user_id)));
    if (filter === 'all') return approved;
    const now = new Date();
    return approved.filter(p => {
      const d = new Date(p.created_date);
      if (filter === 'today') { const s = new Date(now); s.setHours(0,0,0,0); return d >= s; }
      if (filter === 'yesterday') { const s = new Date(now); s.setDate(s.getDate()-1); s.setHours(0,0,0,0); const e = new Date(s); e.setHours(23,59,59,999); return d >= s && d <= e; }
      if (filter === 'last2days') { const s = new Date(now); s.setDate(s.getDate()-2); s.setHours(0,0,0,0); return d >= s; }
      if (filter === 'last2weeks') { const s = new Date(now); s.setDate(s.getDate()-14); s.setHours(0,0,0,0); return d >= s; }
      if (filter === 'custom' && customDateRange.start && customDateRange.end) {
        const s = new Date(customDateRange.start); const e = new Date(customDateRange.end); e.setHours(23,59,59,999);
        return d >= s && d <= e;
      }
      return true;
    });
  };

  const filteredProofs = getFilteredProofs();
  const displayedUsers = filter === 'all' ? allRecruiterUsers :
    allRecruiterUsers.filter(u => filteredProofs.some(p => String(p.user_id) === String(u.id)));

  const filterLabel = { all: 'All Time', today: 'Today', yesterday: 'Yesterday', last2days: 'Last 2 Days', last2weeks: 'Last 2 Weeks', custom: `Custom` }[filter] || '';

  const filterButtons = ['all', 'today', 'yesterday', 'last2days', 'last2weeks', 'custom'];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto" onContextMenu={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold">{recruiter.name}'s Dashboard</DialogTitle>
            <Button onClick={async () => {
              const html2canvas = (await import('html2canvas')).default;
              const jsPDF = (await import('jspdf')).default;
              const el = document.getElementById('rec-dash-content');
              const canvas = await html2canvas(el, { scale: 2, logging: false, useCORS: true });
              const pdf = new jsPDF('p', 'mm', 'a4');
              const imgW = 210; const pageH = 297;
              const imgH = (canvas.height * imgW) / canvas.width;
              pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH);
              pdf.save(`${recruiter.name}_Dashboard.pdf`);
            }} className="bg-blue-600">
              <Download className="w-4 h-4 mr-2" />Export PDF
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {filterButtons.map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => onFilterChange(f)}>
                {f === 'all' ? 'All Time' : f === 'last2days' ? 'Last 2 Days' : f === 'last2weeks' ? 'Last 2 Weeks' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
          {filter === 'custom' && (
            <div className="flex gap-3">
              <Input type="date" value={customDateRange.start} onChange={(e) => onDateRangeChange({ ...customDateRange, start: e.target.value })} />
              <Input type="date" value={customDateRange.end} onChange={(e) => onDateRangeChange({ ...customDateRange, end: e.target.value })} />
            </div>
          )}
        </DialogHeader>
        <div id="rec-dash-content" className="space-y-6 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <CardContent className="p-4 text-center"><Users className="w-8 h-8 mx-auto mb-1" /><p className="text-3xl font-bold">{displayedUsers.length}</p><p className="text-xs">Users</p></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-4 text-center"><CheckCircle className="w-8 h-8 mx-auto mb-1" /><p className="text-3xl font-bold">{filteredProofs.length}</p><p className="text-xs">Approved ({filterLabel})</p></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="p-4 text-center"><BarChart3 className="w-8 h-8 mx-auto mb-1" /><p className="text-3xl font-bold">{displayedUsers.length > 0 ? (filteredProofs.length / displayedUsers.length).toFixed(1) : 0}</p><p className="text-xs">Avg Tasks/User</p></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <CardContent className="p-4 text-center"><Users className="w-8 h-8 mx-auto mb-1" /><p className="text-3xl font-bold">{allRecruiterUsers.length}</p><p className="text-xs">Total Users</p></CardContent>
            </Card>
          </div>
          <Table>
            <TableHeader>
              <TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>User ID</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Sub Start</TableHead><TableHead>Sub Expiry</TableHead><TableHead>Approved Tasks</TableHead><TableHead>Joined</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {displayedUsers.map((u, i) => {
                const startDate = u.subscription_activation_date || u.subscription_date;
                const expiryDate = u.subscription_expiry_date || (startDate ? (() => { const d = new Date(startDate); d.setFullYear(d.getFullYear()+1); return d.toISOString(); })() : null);
                return (
                <TableRow key={u.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-semibold">{u.full_name}</TableCell>
                  <TableCell className="font-mono text-xs">{u.user_id || u.login_user_id}</TableCell>
                  <TableCell className="text-sm">{u.phone || '-'}</TableCell>
                  <TableCell><Badge className={u.is_subscribed ? 'bg-green-600' : 'bg-gray-500'}>{u.is_subscribed ? '✓ Sub' : 'Free'}</Badge></TableCell>
                  <TableCell className="text-xs">{startDate ? new Date(startDate).toLocaleDateString('en-IN') : '-'}</TableCell>
                  <TableCell className="text-xs">{expiryDate ? new Date(expiryDate).toLocaleDateString('en-IN') : '-'}</TableCell>
                  <TableCell className="text-center font-bold text-green-600 text-xl">{filteredProofs.filter(p => String(p.user_id) === String(u.id)).length}</TableCell>
                  <TableCell className="text-xs">{new Date(u.created_date).toLocaleDateString()}</TableCell>
                </TableRow>
              );})}
              {displayedUsers.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No users found for this filter</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}