import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, XCircle, Eye, FileText, Calendar, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UserDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  
  const [filePreviewDialog, setFilePreviewDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: users = [] } = useQuery({ queryKey: ['all-users'], queryFn: () => base44.entities.User.list(), initialData: [] });
  const { data: proofs = [] } = useQuery({ queryKey: ['all-proofs'], queryFn: () => base44.entities.Proof.list('-created_date'), initialData: [] });

  const user = users.find(u => u.id === userId);
  const userProofs = proofs.filter(p => p.user_id === userId);

  const approvedProofs = userProofs.filter(p => p.status === 'approved');
  const rejectedProofs = userProofs.filter(p => p.status === 'rejected');
  const pendingProofs = userProofs.filter(p => p.status === 'pending');

  const filteredProofs = userProofs.filter(p => {
    const matchesSearch = !searchQuery || p.work_type?.toLowerCase().includes(searchQuery.toLowerCase()) || p.task_content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleFilePreview = (proof) => {
    setPreviewFile(proof);
    setFilePreviewDialog(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <Card className="p-12 text-center">
          <p className="text-xl font-bold text-gray-700">User not found</p>
          <Link to={createPageUrl("AdminPanel")} className="mt-4 inline-block">
            <Button><ArrowLeft className="w-4 h-4 mr-2" />Back to Admin Panel</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link to={createPageUrl("AdminPanel")}>
            <Button variant="outline" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">User Task Summary</h1>
            <p className="text-gray-600">{user.full_name}</p>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm opacity-90 mb-1">User Name</p>
                <p className="text-2xl font-bold">{user.full_name}</p>
                <p className="text-sm opacity-75">{user.user_id}</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold">₹{Number(user.total_earnings || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold">₹{Number(user.wallet_balance || 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-90" />
              <p className="text-sm opacity-90">Total Submitted</p>
              <p className="text-4xl font-bold">{userProofs.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-90" />
              <p className="text-sm opacity-90">Approved</p>
              <p className="text-4xl font-bold">{approvedProofs.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6 text-center">
              <XCircle className="w-10 h-10 mx-auto mb-2 opacity-90" />
              <p className="text-sm opacity-90">Rejected</p>
              <p className="text-4xl font-bold">{rejectedProofs.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-90" />
              <p className="text-sm opacity-90">Pending</p>
              <p className="text-4xl font-bold">{pendingProofs.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by task name or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>All</Button>
                <Button size="sm" variant={statusFilter === 'approved' ? 'default' : 'outline'} onClick={() => setStatusFilter('approved')} className="bg-green-600 hover:bg-green-700">Approved</Button>
                <Button size="sm" variant={statusFilter === 'rejected' ? 'default' : 'outline'} onClick={() => setStatusFilter('rejected')} className="bg-red-600 hover:bg-red-700">Rejected</Button>
                <Button size="sm" variant={statusFilter === 'pending' ? 'default' : 'outline'} onClick={() => setStatusFilter('pending')} className="bg-orange-600 hover:bg-orange-700">Pending</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Task History ({filteredProofs.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Work Type</TableHead>
                  <TableHead>Submit Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProofs.length > 0 ? (
                  filteredProofs.map(proof => (
                    <TableRow key={proof.id} className={proof.status === 'approved' ? 'bg-green-50' : proof.status === 'rejected' ? 'bg-red-50' : ''}>
                      <TableCell className="font-mono text-xs">{proof.id.substring(0, 8)}</TableCell>
                      <TableCell className="font-semibold">{proof.work_type}</TableCell>
                      <TableCell className="text-sm">{new Date(proof.submitted_date || proof.created_date).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{proof.duration_seconds ? `${Math.floor(proof.duration_seconds / 60)}m` : '-'}</TableCell>
                      <TableCell className="font-bold text-green-600">₹{proof.reward_amount || 0}</TableCell>
                      <TableCell>
                        <Badge variant={proof.status === 'approved' ? 'default' : proof.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {proof.status === 'approved' ? '✓ Approved' : proof.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {proof.status === 'rejected' && (
                          <p className="text-xs text-red-700">{proof.rejection_reason || '-'}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {proof.file_url && (
                          <Button size="sm" variant="outline" onClick={() => handleFilePreview(proof)}>
                            <Eye className="w-3 h-3 mr-1" />View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      No tasks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* File Preview Dialog */}
        <Dialog open={filePreviewDialog} onOpenChange={setFilePreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>File Preview</DialogTitle>
            </DialogHeader>
            {previewFile && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <div><p className="text-sm text-gray-600">Work Type</p><p className="font-semibold">{previewFile.work_type}</p></div>
                  <div><p className="text-sm text-gray-600">Status</p><Badge variant={previewFile.status === 'approved' ? 'default' : 'destructive'}>{previewFile.status}</Badge></div>
                  <div><p className="text-sm text-gray-600">Reward</p><p className="font-bold text-green-600">₹{previewFile.reward_amount || 0}</p></div>
                  <div><p className="text-sm text-gray-600">Date</p><p className="text-sm">{new Date(previewFile.submitted_date || previewFile.created_date).toLocaleString()}</p></div>
                </div>

                {previewFile.file_url && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-semibold mb-2">File Link:</p>
                    <a href={previewFile.file_url} target="_blank" className="text-blue-600 hover:underline break-all text-sm">
                      {previewFile.file_url}
                    </a>
                    <Button size="sm" className="mt-2" onClick={() => window.open(previewFile.file_url, '_blank')}>
                      Open in New Tab
                    </Button>
                  </div>
                )}

                {previewFile.task_content && (
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p className="text-sm font-semibold mb-2">Task Content:</p>
                    <pre className="text-xs whitespace-pre-wrap">{previewFile.task_content}</pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}