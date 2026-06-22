import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, CheckCircle, BarChart3, LogOut, Loader2, Lock, Shield } from "lucide-react";

export default function RecruiterPortal() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recruiterData, setRecruiterData] = useState(null);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });

  const urlParams = new URLSearchParams(window.location.search);
  const urlId = urlParams.get('id') || urlParams.get('url');

  const { data: users = [] } = useQuery({ 
    queryKey: ['all-users'], 
    queryFn: () => base44.entities.User.list(), 
    initialData: [], 
    refetchInterval: 10000,
    enabled: authenticated 
  });
  
  const { data: proofs = [] } = useQuery({ 
    queryKey: ['all-proofs'], 
    queryFn: () => base44.entities.Proof.list('-created_date'), 
    initialData: [], 
    refetchInterval: 5000,
    enabled: authenticated 
  });
  
  const { data: recruiters = [] } = useQuery({ 
    queryKey: ['recruiters'], 
    queryFn: () => base44.entities.Recruiter.list(), 
    initialData: [], 
    enabled: authenticated 
  });

  useEffect(() => {
    if (!urlId) {
      setError("Invalid URL - No recruiter ID found");
      setLoading(false);
      return;
    }
    // Auto-authenticate directly - no login required
    loadPublicDashboard();
  }, [urlId]);

  const loadPublicDashboard = async () => {
    try {
      const recruiterUrls = await base44.entities.RecruiterUrl.list();
      const urlData = recruiterUrls.find(u => u.unique_url === urlId);

      if (!urlData) {
        setError("Invalid or disabled URL");
        setLoading(false);
        return;
      }

      if (!urlData.is_enabled) {
        setError("This URL has been disabled by admin");
        setLoading(false);
        return;
      }

      // Set public data and authenticate
      const publicData = {
        urlId: urlId,
        recruiterId: urlData.recruiter_id,
        recruiterName: urlData.recruiter_name,
        loggedInUserName: "Public Viewer"
      };

      setRecruiterData(publicData);
      setAuthenticated(true);
      setLoading(false);
    } catch (error) {
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-12 text-center">
            {error ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
                <p className="text-red-600 mb-4">{error}</p>
              </>
            ) : (
              <>
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-teal-600 animate-spin" />
                <p className="text-gray-600">Loading recruiter dashboard...</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard View - Get recruiter data
  const recruiter = recruiters.find(r => String(r.id) === String(recruiterData.recruiterId));

  const allRecruiterUsers = users.filter(u => {
    const nameMatch = u.assigned_recruiter_name?.trim().toLowerCase() === recruiterData.recruiterName?.trim().toLowerCase();
    const idMatch = String(u.assigned_recruiter_id)?.trim() === String(recruiterData.recruiterId)?.trim();
    return nameMatch || idMatch;
  });
  
  const getFilterLabel = () => {
    if (dateFilter === 'all') return 'All Time';
    if (dateFilter === 'today') return 'Today';
    if (dateFilter === 'yesterday') return 'Yesterday';
    if (dateFilter === 'last2days') return 'Last 2 Days';
    if (dateFilter === 'last2weeks') return 'Last 2 Weeks';
    if (dateFilter === 'custom') return `Custom (${customDateRange.start} to ${customDateRange.end})`;
    return '';
  };

  const allUserIds = allRecruiterUsers.map(u => String(u.id));

  const getFilteredProofs = () => {
    const approvedProofs = proofs.filter(p => p.status === 'approved' && allUserIds.includes(String(p.user_id)));

    if (dateFilter === 'all') return approvedProofs;
    
    const now = new Date();
    return approvedProofs.filter(proof => {
      const proofDate = new Date(proof.created_date);
      
      if (dateFilter === 'today') {
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        return proofDate >= todayStart;
      }
      
      if (dateFilter === 'yesterday') {
        const yesterdayStart = new Date(now);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return proofDate >= yesterdayStart && proofDate <= yesterdayEnd;
      }
      
      if (dateFilter === 'last2days') {
        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        twoDaysAgo.setHours(0, 0, 0, 0);
        return proofDate >= twoDaysAgo;
      }
      
      if (dateFilter === 'last2weeks') {
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        twoWeeksAgo.setHours(0, 0, 0, 0);
        return proofDate >= twoWeeksAgo;
      }
      
      if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
        const startDate = new Date(customDateRange.start);
        const endDate = new Date(customDateRange.end);
        endDate.setHours(23, 59, 59, 999);
        return proofDate >= startDate && proofDate <= endDate;
      }
      
      return true;
    });
  };

  const filteredProofs = getFilteredProofs();
  
  const getFilteredUsers = () => {
    if (dateFilter === 'all') {
      return allRecruiterUsers;
    } else {
      const usersWithApprovedTasks = new Set(filteredProofs.map(p => String(p.user_id)));
      return allRecruiterUsers.filter(u => usersWithApprovedTasks.has(String(u.id)));
    }
  };

  const displayedUsers = getFilteredUsers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white p-8 rounded-2xl shadow-2xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2">{recruiterData.recruiterName}</h2>
              <div className="flex items-center gap-4 text-teal-100">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Code: <span className="font-mono font-bold text-white">{recruiter?.recruiter_code || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Filter: <span className="font-bold text-white">{getFilterLabel()}</span>
                </p>
              </div>
              {recruiterData.loggedInUserName && (
                <p className="text-teal-200 text-sm mt-1">Viewing as: {recruiterData.loggedInUserName}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-teal-100">Report Generated</p>
              <p className="text-xl font-bold">{new Date().toLocaleDateString()}</p>
              <p className="text-sm text-teal-100">{new Date().toLocaleTimeString()}</p>
              <Badge className="bg-white/20 text-white px-3 py-1 mt-2">
                🌐 Public View
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">📅 Filter by Approval Date:</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={dateFilter === 'all' ? 'default' : 'outline'} onClick={() => setDateFilter('all')} className={dateFilter === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}>
                All
              </Button>
              <Button size="sm" variant={dateFilter === 'today' ? 'default' : 'outline'} onClick={() => setDateFilter('today')} className={dateFilter === 'today' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : ''}>
                Today
              </Button>
              <Button size="sm" variant={dateFilter === 'yesterday' ? 'default' : 'outline'} onClick={() => setDateFilter('yesterday')} className={dateFilter === 'yesterday' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}>
                Yesterday
              </Button>
              <Button size="sm" variant={dateFilter === 'last2days' ? 'default' : 'outline'} onClick={() => setDateFilter('last2days')} className={dateFilter === 'last2days' ? 'bg-gradient-to-r from-orange-600 to-amber-600' : ''}>
                Last 2 Days
              </Button>
              <Button size="sm" variant={dateFilter === 'last2weeks' ? 'default' : 'outline'} onClick={() => setDateFilter('last2weeks')} className={dateFilter === 'last2weeks' ? 'bg-gradient-to-r from-teal-600 to-cyan-600' : ''}>
                Last 2 Weeks
              </Button>
              <Button size="sm" variant={dateFilter === 'custom' ? 'default' : 'outline'} onClick={() => setDateFilter('custom')} className={dateFilter === 'custom' ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : ''}>
                Custom
              </Button>
            </div>
            {dateFilter === 'custom' && (
              <div className="flex gap-3 mt-3">
                <Input type="date" value={customDateRange.start} onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})} />
                <Input type="date" value={customDateRange.end} onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-90" />
              <p className="text-5xl font-bold mb-2">{displayedUsers.length}</p>
              <p className="text-sm opacity-90">{dateFilter === 'all' ? 'Total Users' : 'Users with Approved Tasks'}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-90" />
              <p className="text-5xl font-bold mb-2">{filteredProofs.length}</p>
              <p className="text-sm opacity-90">Approved Tasks</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-90" />
              <p className="text-5xl font-bold mb-2">
                {displayedUsers.length > 0 ? (filteredProofs.length / displayedUsers.length).toFixed(1) : 0}
              </p>
              <p className="text-sm opacity-90">Avg Tasks per User</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-90" />
              <p className="text-5xl font-bold mb-2">{allRecruiterUsers.length}</p>
              <p className="text-sm opacity-90">Total Assigned Users</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="border-0 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Users className="w-8 h-8" />
              {dateFilter === 'all' ? 
                `Complete Users List (${displayedUsers.length} Total)` : 
                `Users with Approved Tasks - ${getFilterLabel()} (${displayedUsers.length})`
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gradient-to-r from-slate-100 to-gray-100">
                  <TableRow>
                    <TableHead className="font-bold text-gray-700 py-4">#</TableHead>
                    <TableHead className="font-bold text-gray-700">User Name</TableHead>
                    <TableHead className="font-bold text-gray-700">User ID</TableHead>
                    <TableHead className="font-bold text-gray-700">Email</TableHead>
                    <TableHead className="font-bold text-gray-700">Phone</TableHead>
                    <TableHead className="font-bold text-gray-700">Status</TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">Approved Tasks<br/><span className="text-xs font-normal">({getFilterLabel()})</span></TableHead>
                    <TableHead className="font-bold text-gray-700">Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedUsers.map((user, index) => {
                    const userApproved = filteredProofs.filter(p => String(p.user_id) === String(user.id)).length;
                    const rowColor = index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-r from-gray-50 to-slate-50';

                    return (
                      <TableRow key={user.id} className={`${rowColor} border-b border-gray-200`}>
                        <TableCell className="font-bold text-lg text-gray-700 py-4">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                              {user.full_name?.[0] || 'U'}
                            </div>
                            <p className="font-semibold text-gray-900">{user.full_name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">{user.user_id || user.login_user_id}</TableCell>
                        <TableCell className="text-sm text-gray-700">{user.email}</TableCell>
                        <TableCell className="text-sm text-gray-700">{user.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={user.is_subscribed ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1' : 'bg-gray-500 text-white px-3 py-1'}>
                            {user.is_subscribed ? '✓ Subscribed' : 'Free'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                         <p className={`text-3xl font-bold ${userApproved > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                           {userApproved}
                         </p>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          <p className="font-semibold">{new Date(user.created_date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{new Date(user.created_date).toLocaleTimeString()}</p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {displayedUsers.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-gray-500" />
                </div>
                <p className="text-xl font-semibold text-gray-600 mb-2">No Users Found</p>
                <p className="text-gray-500">
                  {dateFilter === 'all' ? 
                    'No users assigned to this recruiter yet' : 
                    `No users with approved tasks in the selected time range (${getFilterLabel()})`
                  }
                </p>
              </div>
            )}
            </CardContent>
            </Card>

            {/* Footer */}
            <div className="bg-gradient-to-r from-slate-100 to-gray-100 p-6 rounded-xl border-2 border-gray-200 text-center mt-8">
            <p className="text-gray-700 font-semibold mb-1">📊 Recruiter Performance Dashboard</p>
            <p className="text-sm text-gray-600">
            This report shows {dateFilter === 'all' ? 'complete user statistics for all time' : `users with approved tasks for ${getFilterLabel()}`}
            </p>
            </div>
            </div>
            </div>
            );
            }