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
import { Plus, Ticket, Upload, Loader2, CheckCircle, Clock, MessageSquare, Send } from "lucide-react";

export default function HelpTickets() {
  const [user, setUser] = useState(null);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", description: "", image: null });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
    loadSupportData();
    const interval = setInterval(loadSupportData, 10000);
    return () => clearInterval(interval);
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
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      const savedUser = localStorage.getItem('workden_3_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  };

  const loadSupportData = () => {}; // handled by useQuery

  const { data: tickets = [] } = useQuery({
    queryKey: ['my-tickets', user?.id],
    queryFn: () => base44.entities.HelpTicket.filter({ user_id: user?.id }, '-created_date'),
    enabled: !!user?.id,
    placeholderData: [],
    refetchInterval: 10000,
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
    } catch (error) {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      alert("Please fill all required fields");
      return;
    }

    createTicketMutation.mutate({
      user_id: user.id,
      user_name: user.full_name || user.email,
      subject: ticketForm.subject,
      description: ticketForm.description,
      image_url: ticketForm.image || "",
      status: "open"
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-600">✓ Resolved</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-600">🔄 In Progress</Badge>;
      default:
        return <Badge className="bg-yellow-600">⏳ Open</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Help Tickets
            </h1>
            <p className="text-gray-600">Raise and track your support tickets</p>
          </div>
          <Button 
            onClick={() => setTicketDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Raise Ticket
          </Button>
        </div>

        <div className="space-y-4">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="shadow-lg border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{ticket.subject}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {new Date(ticket.created_date).toLocaleString()}
                      </p>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{ticket.description}</p>
                  
                  {ticket.image_url && (
                    <div className="mb-3">
                      <a href={ticket.image_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Upload className="w-3 h-3 mr-1" />
                          View Attachment
                        </Button>
                      </a>
                    </div>
                  )}

                  {ticket.admin_reply && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-blue-800 text-sm">Admin Reply:</p>
                          <p className="text-blue-700 text-sm">{ticket.admin_reply}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center shadow-lg">
              <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-semibold text-gray-600 mb-2">No Tickets Yet</p>
              <p className="text-sm text-gray-500">Raise a ticket if you need help</p>
            </Card>
          )}
        </div>
      </div>

      {/* Raise Ticket Dialog */}
      <Dialog open={ticketDialog} onOpenChange={setTicketDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Raise Help Ticket</DialogTitle>
            <DialogDescription>Describe your issue and we'll help you</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input
                placeholder="Brief summary of your issue"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                rows={5}
              />
            </div>

            <div>
              <Label>Upload Screenshot (Optional)</Label>
              <div className="mt-2">
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  ) : ticketForm.image ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Image Uploaded</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">Click to upload image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={createTicketMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {createTicketMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Raise Ticket
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
