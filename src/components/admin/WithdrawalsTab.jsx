import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

// IST datetime formatter
const formatIST = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export default function WithdrawalsTab({ withdrawals, users, appUsers, pendingWithdrawals, approveWithdrawalMutation, rejectWithdrawalMutation }) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });

  const applyFilters = (list) => {
    const now = new Date();
    return list.filter(w => {
      // Search
      const searchLower = search.toLowerCase();
      if (searchLower) {
        const user = users.find(u => u.id === w.user_id) || appUsers.find(u => u.id === w.user_id);
        const userName = user?.full_name || w.user_name || '';
        const userPhone = user?.phone || user?.mobile || '';
        if (!userName.toLowerCase().includes(searchLower) &&
            !userPhone.includes(searchLower) &&
            !String(w.amount).includes(searchLower)) return false;
      }

      // Date filter
      if (dateFilter === 'all') return true;
      const d = new Date(w.requested_date || w.created_date);
      if (dateFilter === 'last_hour') return d >= new Date(now.getTime() - 3600000);
      if (dateFilter === 'today') { const s = new Date(); s.setHours(0,0,0,0); return d >= s; }
      if (dateFilter === 'yesterday') {
        const s = new Date(now); s.setDate(s.getDate()-1); s.setHours(0,0,0,0);
        const e = new Date(s); e.setHours(23,59,59,999);
        return d >= s && d <= e;
      }
      if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
        return d >= new Date(customDateRange.start) && d <= new Date(customDateRange.end);
      }
      return true;
    });
  };

  const filteredWithdrawals = applyFilters(withdrawals);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawals ({pendingWithdrawals} pending)</CardTitle>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            ['all','All'],['last_hour','Last Hour'],['today','Today'],['yesterday','Yesterday'],['custom','Custom']
          ].map(([val, label]) => (
            <Button key={val} size="sm" variant={dateFilter === val ? 'default' : 'outline'}
              onClick={() => setDateFilter(val)}>
              {label}
            </Button>
          ))}
        </div>

        {dateFilter === 'custom' && (
          <div className="flex gap-2 mt-2">
            <Input type="datetime-local" value={customDateRange.start}
              onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
              className="max-w-xs" placeholder="Start" />
            <Input type="datetime-local" value={customDateRange.end}
              onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
              className="max-w-xs" placeholder="End" />
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mt-3 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name, phone, amount..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Date & Time (IST)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWithdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-12">
                  No withdrawal records found
                </TableCell>
              </TableRow>
            ) : (
              filteredWithdrawals.map(w => {
                const user = users.find(u => u.id === w.user_id) || 
                             appUsers.find(u => u.id === w.user_id);
                return (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user?.full_name || w.user_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{user?.phone || user?.mobile || '-'}</p>
                        <p className="text-xs text-gray-400">{user?.email || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">₹{w.amount}</TableCell>
                    <TableCell className="text-xs">
                      <p>{w.bank_name}</p>
                      <p>{w.account_number}</p>
                      <p>{w.ifsc_code}</p>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      <p className="font-semibold">{formatIST(w.requested_date || w.created_date)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={w.status === 'completed' ? 'default' : w.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {w.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {w.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button size="sm" className="bg-green-600 h-7" onClick={() => {
                            if (confirm(`Approve ₹${w.amount}?`))
                              approveWithdrawalMutation.mutate({ withdrawalId: w.id, withdrawal: w });
                          }}>✓</Button>
                          <Button size="sm" variant="destructive" className="h-7" onClick={() => {
                            const reason = prompt("Reason:");
                            if (reason) rejectWithdrawalMutation.mutate({ id: w.id, reason, withdrawal: w });
                          }}>✗</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}