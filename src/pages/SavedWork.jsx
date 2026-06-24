import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CheckCircle, XCircle, Trash2, Download, Filter, ArrowUpDown, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SavedWork() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedWorkForReject, setSelectedWorkForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: savedWorks = [] } = useQuery({
    queryKey: ['saved-works'],
    queryFn: () => base44.entities.SavedWork.list('-saved_date'),
    placeholderData: [],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    placeholderData: [],
    enabled: user?.role === 'admin',
  });

  const approveWorkMutation = useMutation({
    mutationFn: async ({ workId, work }) => {
      await base44.entities.SavedWork.update(workId, { status: "approved" });
      
      const workUser = await base44.entities.User.list();
      const targetUser = workUser.find(u => u.id === work.user_id);
      
      if (targetUser && work.reward_amount) {
        const newBalance = (targetUser.wallet_balance || 0) + work.reward_amount;
        const newEarnings = (targetUser.total_earnings || 0) + work.reward_amount;
        const newCompleted = (targetUser.tasks_completed || 0) + 1;
        
        await base44.entities.User.update(targetUser.id, {
          wallet_balance: newBalance,
          total_earnings: newEarnings,
          tasks_completed: newCompleted,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-works'] });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      alert("Work approved and payment credited to user's wallet!");
    },
  });

  const rejectWorkMutation = useMutation({
    mutationFn: ({ workId, reason }) => 
      base44.entities.SavedWork.update(workId, { 
        status: "rejected",
        rejection_reason: reason 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-works'] });
      setRejectDialog(false);
      setSelectedWorkForReject(null);
      setRejectionReason("");
      alert("Work rejected!");
    },
  });

  const deleteWorkMutation = useMutation({
    mutationFn: (workId) => base44.entities.SavedWork.delete(workId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-works'] });
      alert("Work deleted successfully!");
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async (workIds) => {
      for (const workId of workIds) {
        const work = savedWorks.find(w => w.id === workId);
        if (work) {
          await approveWorkMutation.mutateAsync({ workId, work });
        }
      }
    },
    onSuccess: () => {
      setSelectedWorks([]);
      alert("Selected works approved successfully!");
    },
  });

  const approveAllUserWorksMutation = useMutation({
    mutationFn: async (userId) => {
      const userWorks = savedWorks.filter(w => w.user_id === userId && w.status === 'pending');
      for (const work of userWorks) {
        await approveWorkMutation.mutateAsync({ workId: work.id, work });
      }
    },
    onSuccess: () => {
      alert("All pending works approved successfully!");
    },
  });

  const handleOpenRejectDialog = (work) => {
    setSelectedWorkForReject(work);
    setRejectDialog(true);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    rejectWorkMutation.mutate({
      workId: selectedWorkForReject.id,
      reason: rejectionReason
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const userSavedWorks = isAdmin ? savedWorks : savedWorks.filter(w => w.user_id === user?.id);
  
  // Get unique users who have saved work
  const usersWithWork = isAdmin ? [...new Set(savedWorks.map(w => w.user_id))].map(userId => {
    const userWork = savedWorks.find(w => w.user_id === userId);
    const userData = users.find(u => u.id === userId);
    return {
      userId,
      userName: userWork?.user_name || userData?.full_name || "Unknown User",
      userIdNumber: userWork?.user_id_number || userData?.user_id || "N/A",
      workCount: savedWorks.filter(w => w.user_id === userId).length,
      pendingCount: savedWorks.filter(w => w.user_id === userId && w.status === 'pending').length,
    };
  }) : [];

  // Filter and sort works
  let displayedWorks = selectedUserForView 
    ? savedWorks.filter(w => w.user_id === selectedUserForView)
    : userSavedWorks;

  if (statusFilter !== 'all') {
    displayedWorks = displayedWorks.filter(w => w.status === statusFilter);
  }

  if (sortBy === 'date') {
    displayedWorks = [...displayedWorks].sort((a, b) => 
      new Date(b.saved_date) - new Date(a.saved_date)
    );
  } else if (sortBy === 'name') {
    displayedWorks = [...displayedWorks].sort((a, b) => 
      (a.user_name || '').localeCompare(b.user_name || '')
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    const works = displayedWorks;
    let csv = 'User Name,User ID,Work Type,Content,Saved Date,Status,Reward,Duration\n';
    works.forEach((work) => {
      const duration = work.duration_seconds ? `${Math.floor(work.duration_seconds / 3600)}h ${Math.floor((work.duration_seconds % 3600) / 60)}m` : 'N/A';
      csv += `"${work.user_name}","${work.user_id_number}","${work.work_type}","${work.task_content.substring(0, 50).replace(/"/g, '""')}...","${new Date(work.saved_date).toLocaleString()}","${work.status || 'pending'}","₹${work.reward_amount || 0}","${duration}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saved-works-${selectedUserForView || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const WorkCard = ({ work }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={selectedWorks.includes(work.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedWorks([...selectedWorks, work.id]);
                } else {
                  setSelectedWorks(selectedWorks.filter(id => id !== work.id));
                }
              }}
            />
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <CardTitle className="text-lg">{work.work_type}</CardTitle>
              {isAdmin && !selectedUserForView && (
                <p className="text-sm text-slate-500">
                  User: {work.user_name} (ID: {work.user_id_number})
                </p>
              )}
              <p className="text-sm text-slate-500">
                {new Date(work.saved_date).toLocaleString()}
              </p>
              {work.duration_seconds && (
                <p className="text-xs text-slate-400">
                  Duration: {Math.floor(work.duration_seconds / 3600)}h {Math.floor((work.duration_seconds % 3600) / 60)}m
                </p>
              )}
            </div>
          </div>
          <Badge variant={getStatusColor(work.status)} className="flex items-center gap-1">
            {getStatusIcon(work.status)}
            {work.status || 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 whitespace-pre-wrap line-clamp-3 mb-4">{work.task_content}</p>
        {work.reward_amount && (
          <p className="text-green-600 font-semibold mb-4">Reward: ₹{work.reward_amount}</p>
        )}
        {work.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-red-900">Rejection Reason:</p>
            <p className="text-sm text-red-700">{work.rejection_reason}</p>
          </div>
        )}
        <div className="flex gap-2">
          {isAdmin && work.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => approveWorkMutation.mutate({ workId: work.id, work })}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleOpenRejectDialog(work)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {(!isAdmin || work.status === 'rejected') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteWorkMutation.mutate(work.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isAdmin ? "User Saved Works (Admin View)" : "My Saved Work"}
          </h1>
          <p className="text-slate-600">
            {isAdmin ? "View and manage all user submissions" : "View your submitted work and approval status"}
          </p>
        </div>

        {isAdmin && !selectedUserForView && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users with Saved Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usersWithWork.map((userInfo) => (
                  <Card 
                    key={userInfo.userId}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedUserForView(userInfo.userId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{userInfo.userName}</p>
                          <p className="text-sm text-slate-600">ID: {userInfo.userIdNumber}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{userInfo.workCount} works</Badge>
                          {userInfo.pendingCount > 0 && (
                            <Badge variant="default" className="mt-1">{userInfo.pendingCount} pending</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedUserForView && (
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => setSelectedUserForView(null)}
            >
              ← Back to User List
            </Button>
            <span className="ml-4 text-lg font-semibold">
              Viewing: {usersWithWork.find(u => u.userId === selectedUserForView)?.userName}
            </span>
            <Button
              className="ml-4"
              onClick={() => approveAllUserWorksMutation.mutate(selectedUserForView)}
            >
              Approve All Pending Works
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="name">Sort by User Name</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          {isAdmin && selectedWorks.length > 0 && (
            <Button onClick={() => bulkApproveMutation.mutate(selectedWorks)}>
              Approve Selected ({selectedWorks.length})
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {displayedWorks.length > 0 ? (
            displayedWorks.map((work) => <WorkCard key={work.id} work={work} />)
          ) : (
            <Card className="p-12">
              <div className="text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg mb-2">No saved work found</p>
                <p className="text-sm">Complete tasks to see your saved work here</p>
              </div>
            </Card>
          )}
        </div>

        <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Work</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this work
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Rejection Reason *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Work
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
