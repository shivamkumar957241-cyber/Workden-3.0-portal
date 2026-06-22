import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingUp, DollarSign, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Analytics() {
  const { data: users = [] } = useQuery({ queryKey: ['all-users'], queryFn: () => base44.entities.User.list(), initialData: [] });
  const { data: proofs = [] } = useQuery({ queryKey: ['all-proofs'], queryFn: () => base44.entities.Proof.list(), initialData: [] });
  const { data: withdrawals = [] } = useQuery({ queryKey: ['withdrawals'], queryFn: () => base44.entities.WithdrawalRequest.list(), initialData: [] });

  const totalEarnings = users.reduce((sum, u) => sum + Number(u.total_earnings || 0), 0);
  const totalWithdrawals = withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + Number(w.amount || 0), 0);
  const approvedProofs = proofs.filter(p => p.status === 'approved').length;

  const workTypeData = proofs.reduce((acc, proof) => {
    const type = proof.work_type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(workTypeData).map(([name, value]) => ({ name, submissions: value }));

  const statusData = [
    { name: 'Approved', value: proofs.filter(p => p.status === 'approved').length, color: '#22c55e' },
    { name: 'Pending', value: proofs.filter(p => p.status === 'pending').length, color: '#f59e0b' },
    { name: 'Rejected', value: proofs.filter(p => p.status === 'rejected').length, color: '#ef4444' },
  ];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailySubmissions = last7Days.map(date => {
    const count = proofs.filter(p => p.submitted_date?.split('T')[0] === date).length;
    return { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), submissions: count };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 md:p-6 pb-24">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to={createPageUrl("AdminPanel")}><Button variant="outline" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div><h1 className="text-2xl md:text-3xl font-bold">Analytics Dashboard</h1><p className="text-sm text-slate-600">Platform Performance Metrics</p></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6"><Users className="w-8 h-8 mb-2" /><p className="text-xs opacity-90">Total Users</p><p className="text-3xl font-bold">{users.length}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6"><DollarSign className="w-8 h-8 mb-2" /><p className="text-xs opacity-90">Total Earnings</p><p className="text-3xl font-bold">₹{Number(totalEarnings).toFixed(0)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6"><TrendingUp className="w-8 h-8 mb-2" /><p className="text-xs opacity-90">Total Withdrawals</p><p className="text-3xl font-bold">₹{Number(totalWithdrawals).toFixed(0)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6"><CheckCircle className="w-8 h-8 mb-2" /><p className="text-xs opacity-90">Approved Works</p><p className="text-3xl font-bold">{approvedProofs}</p></CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card><CardHeader><CardTitle>Work Type Distribution</CardTitle></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" angle={-45} textAnchor="end" height={100} /><YAxis /><Tooltip /><Bar dataKey="submissions" fill="#8b5cf6" /></BarChart>
            </ResponsiveContainer></CardContent>
          </Card>

          <Card><CardHeader><CardTitle>Submission Status</CardTitle></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer></CardContent>
          </Card>
        </div>

        <Card><CardHeader><CardTitle>Daily Submissions (Last 7 Days)</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySubmissions}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="submissions" stroke="#3b82f6" strokeWidth={2} /></LineChart>
          </ResponsiveContainer></CardContent>
        </Card>
      </div>
    </div>
  );
}