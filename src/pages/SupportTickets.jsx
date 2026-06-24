import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Ticket, Upload, Loader2, CheckCircle, Clock, MessageSquare, Send, Phone, AlertCircle, Play } from "lucide-react";

export default function SupportTickets() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("tickets"); // tickets | call | ticket_history | call_history
  const [ticketDialog, setTicketDialog] = useState(false);
  const [callDialog, setCallDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", description: "", image: null });
  const [callForm, setCallForm] = useState({ fullName: "", mobile: "", email: "", subject: "", issue: "" });
  const [uploading, setUploading] = useState(false);
  const [submittingCall, setSubmittingCall] = useState(false);
  const queryClient = useQueryClient();

  const { data: globalSettings = [] } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => base44.entities.GlobalSettings.list(),
    placeholderData: []
  });

  const openDemoVideo = () => {
    const videoUrl = globalSettings.find(s => s.setting_key === 'support_tickets_video')?.setting_value;
    if (!videoUrl) { alert("No demo video available yet. Admin will add it soon."); return; }
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
    const embedUrl = getEmbed(videoUrl);
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
      const userSource = localStorage.getItem('workden_3_user_source');
      const savedUserId = localStorage.getItem('workden_3_login_id');
      if (userSource === 'appuser' && savedUserId) {
        const appUsers = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
        if (appUsers?.length > 0) { setUser(appUsers[0]); return; }
      }
      const savedUser = localStorage.getItem('workden_3_user');
      if (savedUser) { setUser(JSON.parse(savedUser)); return; }
      setUser(await base44.auth.me());
    } catch (error) {
      const savedUser = localStorage.getItem('workden_3_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  };

  const { data: tickets = [] } = useQuery({
    queryKey: ['my-tickets', user?.id],
    queryFn: () => base44.entities.HelpTicket.filter({ user_id: user?.id }, '-created_date'),
    enabled: !!user?.id,
    placeholderData: [],
    refetchInterval: 15000,
  });

  const { data: callRequests = [] } = useQuery({
    queryKey: ['my-call-requests', user?.id],
    queryFn: () => base44.entities.CallRequest.filter({ user_id: user?.id }, '-created_date'),
    enabled: !!user?.id,
    placeholderData: [],
    refetchInterval: 15000,
  });

  const createTicketMutation = useMutation({
    mutationFn: (data) => base44.entities.HelpTicket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      setTicketDialog(false);
      setTicketForm({ subject: "", description: "", image: null });
      alert("✅ Ticket raised successfully!");
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setTicketForm(prev => ({ ...prev, image: file_url }));
    } catch {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitTicket = () => {
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      alert("Please fill all required fields");
      return;
    }
    createTicketMutation.mutate({
      user_id: user.id,
      user_name: user.full_name || user.email,
      user_email: user.email || user.login_user_id || "",
      user_phone: user.phone || "",
      message: ticketForm.description,
      subject: ticketForm.subject,
      description: ticketForm.description,
      image_url: ticketForm.image || "",
      status: "open"
    });
  };

  const handleSubmitCall = async (e) => {
    e.preventDefault();
    if (!callForm.fullName || !callForm.mobile || !callForm.subject || !callForm.issue) {
      alert("⚠️ Please fill all required fields");
      return;
    }
    setSubmittingCall(true);
    try {
      await base44.entities.CallRequest.create({
        user_id: user?.id || "",
        full_name: callForm.fullName,
        mobile: callForm.mobile,
        email: callForm.email,
        subject: callForm.subject,
        issue: callForm.issue,
        status: "pending"
      });
      queryClient.invalidateQueries({ queryKey: ['my-call-requests'] });
      setCallDialog(false);
      setCallForm({ fullName: "", mobile: "", email: "", subject: "", issue: "" });
      alert("✅ Call request submitted!");
    } catch {
      alert("❌ Failed to submit. Please try again.");
    } finally {
      setSubmittingCall(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved': return <Badge className="bg-green-600">✓ Resolved</Badge>;
      case 'in_progress': case 'contacted': return <Badge className="bg-blue-600">🔄 In Progress</Badge>;
      default: return <Badge className="bg-yellow-600">⏳ Open</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'resolved' || status === 'contacted') return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
    if (status === 'in_progress') return <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
            Support Tickets & History
          </h1>
          <p className="text-gray-600">Raise tickets, request calls, and track your history</p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={() => setTicketDialog(true)} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="w-4 h-4 mr-2" />Add Ticket
          </Button>
          <Button onClick={() => setCallDialog(true)} className="bg-gradient-to-r from-green-600 to-emerald-600">
            <Phone className="w-4 h-4 mr-2" />Call Request
          </Button>
          <Button onClick={openDemoVideo} className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white">
            <Play className="w-4 h-4 mr-2" />Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <CardContent className="p-4 text-center"><MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-90" /><p className="text-xs opacity-90">Tickets</p><p className="text-2xl font-bold">{tickets.length}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <CardContent className="p-4 text-center"><Phone className="w-6 h-6 mx-auto mb-1 opacity-90" /><p className="text-xs opacity-90">Call Requests</p><p className="text-2xl font-bold">{callRequests.length}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <CardContent className="p-4 text-center"><CheckCircle className="w-6 h-6 mx-auto mb-1 opacity-90" /><p className="text-xs opacity-90">Resolved</p><p className="text-2xl font-bold">{[...tickets, ...callRequests].filter(r => r.status === 'resolved').length}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg">
            <CardContent className="p-4 text-center"><Clock className="w-6 h-6 mx-auto mb-1 opacity-90" /><p className="text-xs opacity-90">Pending</p><p className="text-2xl font-bold">{[...tickets, ...callRequests].filter(r => r.status === 'open' || r.status === 'pending').length}</p></CardContent>
          </Card>
        </div>

        {/* Ticket History */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            My Ticket History ({tickets.length})
          </h2>
          <div className="space-y-4">
            {tickets.length > 0 ? tickets.map((ticket) => (
              <Card key={ticket.id} className={`shadow-lg border-l-4 ${ticket.status === 'resolved' ? 'border-l-green-500' : ticket.status === 'in_progress' ? 'border-l-blue-500' : 'border-l-yellow-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(ticket.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(ticket.created_date).toLocaleString()}</p>
                      {ticket.admin_reply && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="font-semibold text-green-800 text-sm">Admin Reply:</p>
                          <p className="text-green-700 text-sm">{ticket.admin_reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="p-10 text-center shadow-lg">
                <Ticket className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-semibold text-gray-600 mb-1">No Tickets Yet</p>
                <p className="text-sm text-gray-500">Click "Add Ticket" to raise a support ticket</p>
              </Card>
            )}
          </div>
        </div>

        {/* Call History */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Phone className="w-6 h-6 text-green-600" />
            Call History ({callRequests.length})
          </h2>
          <div className="space-y-4">
            {callRequests.length > 0 ? callRequests.map((req) => (
              <Card key={req.id} className={`shadow-lg border-l-4 ${req.status === 'resolved' || req.status === 'contacted' ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(req.status)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{req.subject}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{req.issue}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(req.created_date).toLocaleString()}</p>
                      {req.admin_notes && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="font-semibold text-blue-800 text-sm">Admin Notes:</p>
                          <p className="text-blue-700 text-sm">{req.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="p-10 text-center shadow-lg">
                <Phone className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-semibold text-gray-600 mb-1">No Call Requests</p>
                <p className="text-sm text-gray-500">Click "Call Request" to request a callback</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Ticket Dialog */}
      <Dialog open={ticketDialog} onOpenChange={setTicketDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Raise Help Ticket</DialogTitle>
            <DialogDescription>Describe your issue and we'll help you</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input placeholder="Brief summary of your issue" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea placeholder="Describe your issue in detail..." value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })} rows={4} />
            </div>
            <div>
              <Label>Upload Screenshot (Optional)</Label>
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 mt-1">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-purple-600" /> : ticketForm.image ? <><CheckCircle className="w-5 h-5 text-green-600" /><span className="text-green-600">Uploaded</span></> : <><Upload className="w-5 h-5 text-gray-400" /><span className="text-gray-600">Click to upload</span></>}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            <Button onClick={handleSubmitTicket} disabled={createTicketMutation.isPending} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
              {createTicketMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <><Send className="w-4 h-4 mr-2" />Raise Ticket</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Request Dialog */}
      <Dialog open={callDialog} onOpenChange={setCallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request a Call</DialogTitle>
            <DialogDescription>Our team will contact you soon</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCall} className="space-y-3">
            <div>
              <Label>Full Name *</Label>
              <Input placeholder="Your full name" value={callForm.fullName} onChange={e => setCallForm({...callForm, fullName: e.target.value})} required />
            </div>
            <div>
              <Label>Mobile Number *</Label>
              <Input placeholder="Your mobile number" value={callForm.mobile} onChange={e => setCallForm({...callForm, mobile: e.target.value})} required />
            </div>
            <div>
              <Label>Email (Optional)</Label>
              <Input type="email" placeholder="Your email" value={callForm.email} onChange={e => setCallForm({...callForm, email: e.target.value})} />
            </div>
            <div>
              <Label>Subject *</Label>
              <Input placeholder="What is this call about?" value={callForm.subject} onChange={e => setCallForm({...callForm, subject: e.target.value})} required />
            </div>
            <div>
              <Label>Issue / Message *</Label>
              <Textarea placeholder="Describe your issue in detail" rows={3} value={callForm.issue} onChange={e => setCallForm({...callForm, issue: e.target.value})} required />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCallDialog(false)} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={submittingCall} className="flex-1 bg-green-600 hover:bg-green-700">
                {submittingCall ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Request Call'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
