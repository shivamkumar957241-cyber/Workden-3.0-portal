import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  User,
  BarChart3,
  Award,
  Sparkles
} from "lucide-react";
import moment from "moment";

export default function RecruiterDashboardView() {
  const [currentUser, setCurrentUser] = useState(null);
  const [recruiter, setRecruiter] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      console.log("🔐 Current User:", user);
      console.log("🔐 Has Dashboard Access ID:", user?.recruiter_dashboard_access_id);
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  // Fetch ALL data immediately - NO conditional enabling
  const { data: allRecruiters = [] } = useQuery({
    queryKey: ['recruiters'],
    queryFn: () => base44.entities.Recruiter.list(),
    refetchInterval: 5000
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    refetchInterval: 5000
  });

  const { data: allProofs = [] } = useQuery({
    queryKey: ['all-proofs'],
    queryFn: () => base44.entities.Proof.list(),
    refetchInterval: 5000
  });

  // Find the recruiter this user has access to
  useEffect(() => {
    if (currentUser?.recruiter_dashboard_access_id && allRecruiters.length > 0) {
      console.log("\n=== 🔍 FINDING RECRUITER ===");
      console.log("User's access ID:", currentUser.recruiter_dashboard_access_id);
      console.log("Access ID type:", typeof currentUser.recruiter_dashboard_access_id);
      console.log("All recruiters:", allRecruiters.map(r => ({ 
        id: r.id, 
        idType: typeof r.id,
        name: r.name,
        match: String(r.id) === String(currentUser.recruiter_dashboard_access_id)
      })));
      
      const foundRecruiter = allRecruiters.find(r => 
        String(r.id) === String(currentUser.recruiter_dashboard_access_id)
      );
      
      console.log("Found recruiter:", foundRecruiter);
      console.log("======================\n");
      setRecruiter(foundRecruiter);
    }
  }, [currentUser, allRecruiters]);

  // Filter users assigned to this recruiter - EXACT SAME LOGIC as admin panel
  const assignedUsers = recruiter?.id 
    ? allUsers.filter(u => {
        const match = String(u.assigned_recruiter_id) === String(recruiter.id);
        return match;
      })
    : [];

  useEffect(() => {
    if (recruiter?.id) {
      console.log("\n=== 👥 USER FILTERING ===");
      console.log("Recruiter ID:", recruiter.id);
      console.log("Recruiter ID type:", typeof recruiter.id);
      console.log("Total users:", allUsers.length);
      console.log("Users with assigned_recruiter_id:", allUsers.filter(u => u.assigned_recruiter_id).map(u => ({
        name: u.full_name,
        assigned_to: u.assigned_recruiter_id,
        assigned_to_type: typeof u.assigned_recruiter_id,
        matches: String(u.assigned_recruiter_id) === String(recruiter.id)
      })));
      console.log("Assigned users count:", assignedUsers.length);
      console.log("======================\n");
    }
  }, [recruiter, allUsers, assignedUsers]);

  // Get approved proofs for assigned users - EXACT SAME LOGIC as admin panel
  const userIds = assignedUsers.map(u => String(u.id));
  const approvedProofs = allProofs.filter(p => 
    p.status === 'approved' && userIds.includes(String(p.user_id))
  );

  useEffect(() => {
    if (assignedUsers.length > 0) {
      console.log("\n=== ✅ PROOF FILTERING ===");
      console.log("User IDs:", userIds);
      console.log("Total proofs:", allProofs.length);
      console.log("Approved proofs:", allProofs.filter(p => p.status === 'approved').length);
      console.log("Proofs for these users:", approvedProofs.length);
      console.log("======================\n");
    }
  }, [assignedUsers, allProofs, approvedProofs]);

  // Filter proofs by time
  const getFilteredProofs = () => {
    if (timeFilter === "all") return approvedProofs;
    
    const now = moment();
    return approvedProofs.filter(proof => {
      const proofDate = moment(proof.created_date);
      switch (timeFilter) {
        case "today":
          return proofDate.isSame(now, 'day');
        case "yesterday":
          return proofDate.isSame(now.clone().subtract(1, 'days'), 'day');
        case "dayBeforeYesterday":
          return proofDate.isSame(now.clone().subtract(2, 'days'), 'day');
        case "week":
          return proofDate.isSame(now, 'week');
        case "month":
          return proofDate.isSame(now, 'month');
        default:
          return true;
      }
    });
  };

  const filteredProofs = getFilteredProofs();

  const getUserApprovedTasks = (userId) => {
    return approvedProofs.filter(p => String(p.user_id) === String(userId)).length;
  };

  const getFilteredUserApprovedTasks = (userId) => {
    return filteredProofs.filter(p => String(p.user_id) === String(userId)).length;
  };

  // No access
  if (!currentUser?.recruiter_dashboard_access_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center">
        <Card className="max-w-md p-12 text-center shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Access</h2>
          <p className="text-gray-600">You don't have access to any recruiter dashboard. Contact admin.</p>
        </Card>
      </div>
    );
  }

  if (!recruiter) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 p-4 md:p-8 pb-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-6 relative">
              <Sparkles className="absolute top-4 right-4 w-6 h-6 text-yellow-300 animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {recruiter.name} Dashboard 👋
                  </h1>
                  <p className="text-teal-100 text-sm mt-1">Recruiter Performance • Team Analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Users</p>
                  <p className="text-3xl font-bold">{assignedUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Approved Tasks</p>
                  <p className="text-3xl font-bold">{approvedProofs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Filtered Approved</p>
                  <p className="text-3xl font-bold">{filteredProofs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Filter */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Calendar className="w-5 h-5" />
              Filter by Time Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "dayBeforeYesterday", label: "Day Before Yesterday" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" }
              ].map(filter => (
                <Button
                  key={filter.value}
                  variant={timeFilter === filter.value ? "default" : "outline"}
                  onClick={() => setTimeFilter(filter.value)}
                  className={timeFilter === filter.value ? "bg-teal-600 hover:bg-teal-700" : ""}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Users List with Approved Tasks */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-teal-900">
              <BarChart3 className="w-5 h-5" />
              Assigned Users - Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {assignedUsers.length > 0 ? (
              <div className="divide-y">
                {assignedUsers.map((user, index) => {
                  const totalApproved = getUserApprovedTasks(user.id);
                  const filteredApproved = getFilteredUserApprovedTasks(user.id);
                  const joinDate = user.created_date ? moment(user.created_date).format('DD MMM YYYY') : 'N/A';
                  const taskStatus = totalApproved > 0 ? 'Completed' : 'Active';
                  
                  return (
                    <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-lg">
                            {user.full_name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">User ID: {user.user_id || user.login_user_id}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                Joined: {joinDate}
                              </Badge>
                              <Badge className={taskStatus === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}>
                                {taskStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{filteredApproved}</p>
                            <p className="text-xs text-green-700">
                              {timeFilter === "all" ? "Total Approved" : timeFilter === "today" ? "Today" : timeFilter === "week" ? "This Week" : "This Month"}
                            </p>
                          </div>
                          {timeFilter !== "all" && (
                            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                              <p className="text-lg font-semibold text-gray-600">{totalApproved}</p>
                              <p className="text-xs text-gray-500">All Time</p>
                            </div>
                          )}
                          <Badge className={user.is_subscribed ? "bg-green-500" : "bg-gray-400"}>
                            {user.is_subscribed ? "Subscribed" : "Free"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold">No users assigned yet</p>
                <p className="text-sm mt-1">Admin will assign users to this recruiter</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {assignedUsers.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{assignedUsers.length}</p>
                  <p className="text-sm opacity-90">Team Members</p>
                </div>
                <div>
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{approvedProofs.length}</p>
                  <p className="text-sm opacity-90">Total Approved</p>
                </div>
                <div>
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-2xl font-bold">
                    {assignedUsers.length > 0 ? (approvedProofs.length / assignedUsers.length).toFixed(1) : 0}
                  </p>
                  <p className="text-sm opacity-90">Avg per User</p>
                </div>
                <div>
                  <User className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-2xl font-bold">
                    {assignedUsers.filter(u => u.is_subscribed).length}
                  </p>
                  <p className="text-sm opacity-90">Subscribed Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium">📊 Note:</p>
          <p>This dashboard shows only <strong>approved tasks</strong>. Pending or rejected tasks are not displayed.</p>
        </div>
      </div>
    </div>
  );
}