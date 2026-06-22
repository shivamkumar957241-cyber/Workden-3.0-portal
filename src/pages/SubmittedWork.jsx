import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  IndianRupee,
  Download,
  Filter,
  AlertTriangle,
  BarChart3,
  Play
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SubmittedWork() {
  const [user, setUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [perfSummaryDialog, setPerfSummaryDialog] = useState(false);
  const [viewingProof, setViewingProof] = useState(null);
  const [showHelpVideo, setShowHelpVideo] = useState(false);

  const { data: globalSettings = [] } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => base44.entities.GlobalSettings.list(),
    initialData: []
  });

  const taskHistoryVideoUrl = globalSettings.find(s => s.setting_key === 'task_history_video')?.setting_value;

  const openHelpVideo = () => {
    if (!taskHistoryVideoUrl) { alert("No help video available yet. Admin will add it soon."); return; }
    const getEmbed = (url) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        if (m && m[2].length === 11) return `https://www.youtube.com/embed/${m[2]}`;
      }
      if (url.includes('drive.google.com')) {
        const m = url.match(/\/file\/d\/([^/]+)/);
        if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
      }
      return url;
    };
    const embedUrl = getEmbed(taskHistoryVideoUrl);
    const dialog = document.createElement('div');
    dialog.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    dialog.innerHTML = `<div style="width:100%;max-width:1000px;height:75vh;background:white;border-radius:12px;overflow:hidden;position:relative"><button onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:12px;right:12px;z-index:10;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:20px">×</button><iframe src="${embedUrl}" style="width:100%;height:100%;border:none" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"></iframe></div>`;
    document.body.appendChild(dialog);
    dialog.onclick = (e) => { if (e.target === dialog) dialog.remove(); };
  };

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userSource = localStorage.getItem('workden_user_source');
      const savedUserId = localStorage.getItem('workden_login_id');
      if (userSource === 'appuser' && savedUserId) {
        const appUsers = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
        if (appUsers?.length > 0) { setUser(appUsers[0]); return; }
      }
      const savedUser = localStorage.getItem('workden_user');
      if (savedUser) { setUser(JSON.parse(savedUser)); return; }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      const savedUser = localStorage.getItem('workden_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  };

  const { data: proofs = [] } = useQuery({
    queryKey: ['my-proofs', user?.id],
    queryFn: () => base44.entities.Proof.filter({ user_id: user?.id }, '-submitted_date', 50),
    enabled: !!user?.id,
    initialData: [],
    refetchInterval: 30000,
  });

  const filteredProofs = proofs.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const stats = {
    total: proofs.length,
    approved: proofs.filter(p => p.status === 'approved').length,
    pending: proofs.filter(p => p.status === 'pending').length,
    rejected: proofs.filter(p => p.status === 'rejected').length,
    totalEarnings: proofs.filter(p => p.status === 'approved').reduce((sum, p) => sum + Number(p.reward_amount || 0), 0)
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white">✓ Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">✗ Rejected</Badge>;
      default:
        return <Badge variant="secondary">⏳ Pending</Badge>;
    }
  };

  const handleDownloadCSV = () => {
    if (proofs.length === 0) {
      alert("No submissions to download");
      return;
    }

    const headers = ['Work Type', 'Status', 'Reward', 'Submitted Date', 'File URL', 'Notes'];
    const rows = proofs.map(p => [
      p.work_type,
      p.status,
      `₹${p.reward_amount || 0}`,
      new Date(p.submitted_date).toLocaleString(),
      p.file_url || 'N/A',
      p.task_content || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `submitted_work_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
              Task History
            </h1>
            <p className="text-gray-600">Track all your work submissions and their status</p>
          </div>
          <Button
            onClick={openHelpVideo}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold shadow-lg"
          >
            <Play className="w-4 h-4 mr-2" />
            👉 See How to Check Task History
          </Button>
        </div>



        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-1 opacity-90" />
              <p className="text-xs opacity-90">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-1 opacity-90" />
              <p className="text-xs opacity-90">Approved</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-1 opacity-90" />
              <p className="text-xs opacity-90">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
            <CardContent className="p-4 text-center">
              <XCircle className="w-6 h-6 mx-auto mb-1 opacity-90" />
              <p className="text-xs opacity-90">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <CardContent className="p-4 text-center">
              <IndianRupee className="w-6 h-6 mx-auto mb-1 opacity-90" />
              <p className="text-xs opacity-90">Earned</p>
              <p className="text-2xl font-bold">₹{stats.totalEarnings}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Download */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleDownloadCSV}
                variant="outline"
                className="border-2 border-blue-300 hover:bg-blue-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredProofs.length > 0 ? (
            filteredProofs.map((proof) => (
              <Card 
                key={proof.id} 
                className={`shadow-lg hover:shadow-xl transition-shadow border-l-4 ${
                  proof.status === 'approved' 
                    ? 'border-l-green-500' 
                    : proof.status === 'rejected' 
                    ? 'border-l-red-500' 
                    : 'border-l-yellow-500'
                }`}
              >
                <CardContent className="p-3 md:p-5">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-4">
                    <div className="flex items-start gap-3 md:gap-4 w-full">
                      {getStatusIcon(proof.status)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1">
                          {proof.work_type}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          Submitted: {new Date(proof.submitted_date).toLocaleString()}
                        </p>
                        
                        {proof.duration_seconds > 0 && (
                          <p className="text-xs text-gray-400 mb-2">
                            ⏱ Work Time: {Math.floor(proof.duration_seconds / 60)}m {proof.duration_seconds % 60}s
                            {proof.auto_submitted && <Badge variant="outline" className="ml-2 text-xs">Auto-submitted</Badge>}
                          </p>
                        )}

                        <div className="flex items-center gap-3 flex-wrap">
                          {getStatusBadge(proof.status)}
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            <IndianRupee className="w-3 h-3 mr-1" />
                            ₹{proof.reward_amount || 0}
                          </Badge>
                        </div>

                        {/* Rejection Reason */}
                        {proof.status === 'rejected' && proof.rejection_reason && (
                          <div className="mt-3 md:mt-4 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-red-800 text-xs md:text-sm mb-1">Rejection Reason:</p>
                                <p className="text-red-700 text-xs md:text-sm break-words">
                                  {proof.rejection_reason.split('\n').map((line, idx) => {
                                    const urlMatch = line.match(/(https?:\/\/[^\s]+)/g);
                                    if (urlMatch) {
                                      return (
                                        <span key={idx}>
                                          {line.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                                            if (part.match(/^https?:\/\//)) {
                                              return <a key={i} href={part} className="text-blue-600 underline hover:text-blue-800 font-medium" onClick={(e) => { e.preventDefault(); window.location.href = part; }}>View Report File</a>;
                                            }
                                            return part;
                                          })}
                                          <br />
                                        </span>
                                      );
                                    }
                                    return <span key={idx}>{line}<br /></span>;
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Performance Summary Button */}
                        {proof.status === 'rejected' && proof.performance_summary && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-2 border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold"
                              onClick={() => { setViewingProof(proof); setPerfSummaryDialog(true); }}
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Performance Summary
                            </Button>
                          </div>
                        )}

                        {/* Notes */}
                        {proof.task_content && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Notes:</span> {proof.task_content}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {proof.file_url && (
                      <a 
                        href={proof.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="flex-shrink-0">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View File
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center shadow-lg">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-semibold text-gray-600 mb-2">No Submissions Found</p>
              <p className="text-sm text-gray-500">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} submissions yet` 
                  : 'Complete tasks and submit your work to see them here'
                }
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Performance Summary Dialog */}
      <Dialog open={perfSummaryDialog} onOpenChange={setPerfSummaryDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              Performance Summary
            </DialogTitle>
            {viewingProof && (
              <p className="text-sm text-gray-500">
                {viewingProof.work_type} • {new Date(viewingProof.submitted_date || viewingProof.created_date).toLocaleDateString()}
              </p>
            )}
          </DialogHeader>
          {viewingProof?.performance_summary ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Task Performance Analysis
                </p>
                <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed bg-white rounded-lg p-4 border border-amber-200">
                  {viewingProof.performance_summary}
                </div>
              </div>
              {viewingProof.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{viewingProof.rejection_reason}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No performance summary available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}