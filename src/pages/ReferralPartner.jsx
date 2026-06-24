import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, DollarSign, CheckCircle, Loader2, Gift, Play } from "lucide-react";

export default function ReferralPartner() {
  const [user, setUser] = useState(null);
  const [applyDialog, setApplyDialog] = useState(false);

  const { data: globalSettings = [] } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => base44.entities.GlobalSettings.list(),
    placeholderData: []
  });
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    qualification: "",
    city: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Support AppUsers
      const userSource = localStorage.getItem('workden_3_user_source');
      const savedUserId = localStorage.getItem('workden_3_login_id');
      let currentUser = null;

      if (userSource === 'appuser' && savedUserId) {
        const appUsers = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
        if (appUsers?.length > 0) currentUser = appUsers[0];
      }
      if (!currentUser) {
        const savedUser = localStorage.getItem('workden_3_user');
        if (savedUser) currentUser = JSON.parse(savedUser);
      }
      if (!currentUser) {
        currentUser = await base44.auth.me();
      }

      setUser(currentUser);
      setFormData({
        full_name: currentUser.full_name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        qualification: "",
        city: ""
      });
    } catch (error) {
      const savedUser = localStorage.getItem('workden_3_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        setFormData({ full_name: u.full_name || "", email: u.email || "", phone: u.phone || "", qualification: "", city: "" });
      }
    }
  };

  const { data: existingApplication } = useQuery({
    queryKey: ['my-referral-partner-app', user?.id],
    queryFn: () => base44.entities.ReferralPartner.filter({ user_id: user?.id }),
    enabled: !!user?.id,
    placeholderData: []
  });

  const applyMutation = useMutation({
    mutationFn: (data) => base44.entities.ReferralPartner.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-referral-partner-app'] });
      setApplyDialog(false);
      alert("✅ Application submitted successfully! Admin will review it soon.");
    }
  });

  const handleSubmit = () => {
    if (!formData.full_name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.city.trim()) {
      alert("⚠️ Please fill all required fields");
      return;
    }

    applyMutation.mutate({
      user_id: user.id,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      qualification: formData.qualification,
      city: formData.city,
      status: "pending"
    });
  };

  const hasApplied = existingApplication && existingApplication.length > 0;
  const application = hasApplied ? existingApplication[0] : null;

  const referralVideoUrl = globalSettings.find(s => s.setting_key === 'referral_partner_video')?.setting_value || "";

  const openVideo = () => {
    if (!referralVideoUrl) { alert("No video available yet."); return; }
    let embedUrl = referralVideoUrl;
    // Convert Google Drive link
    const driveMatch = referralVideoUrl.match(/\/file\/d\/([^/]+)/);
    if (driveMatch) embedUrl = `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    // Convert YouTube watch link
    const ytMatch = referralVideoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;

    const dialog = document.createElement('div');
    dialog.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    dialog.innerHTML = `<div style="width:100%;max-width:900px;height:70vh;background:white;border-radius:12px;overflow:hidden;position:relative"><button onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:12px;right:12px;z-index:10;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:20px">×</button><iframe src="${embedUrl}" style="width:100%;height:100%;border:none" allowfullscreen></iframe></div>`;
    document.body.appendChild(dialog);
    dialog.onclick = (e) => { if (e.target === dialog) dialog.remove(); };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            💼 Referral Partner Program
          </h1>
          <p className="text-gray-600">Refer users and earn money!</p>
        </div>

        {/* Video Tutorial */}
        <div
          className="mb-6 relative overflow-hidden rounded-2xl cursor-pointer hover:shadow-2xl transition-all shadow-xl"
          onClick={openVideo}
        >
          <div className="relative h-40 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center shadow-xl">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
              <p className="text-2xl font-black drop-shadow-lg">💼 Referral Partner Tutorial</p>
              <p className="text-sm mt-1 opacity-90">Watch how to earn with referrals</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 shadow-xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-purple-900 mb-2">
                Earn with Every Referral!
              </h2>
              <p className="text-gray-700 text-lg">
                Refer users to WorkDen and earn on two levels.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-white rounded-xl shadow-md text-center border-2 border-purple-200">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-bold text-3xl text-purple-600">₹150</p>
                <p className="text-sm font-semibold text-gray-700">Per Referral</p>
                <p className="text-xs text-gray-500 mt-1">When your referred user joins</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-md text-center border-2 border-green-200">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-bold text-3xl text-green-600">₹50</p>
                <p className="text-sm font-semibold text-gray-700">Per Approved Task</p>
                <p className="text-xs text-gray-500 mt-1">Each task approved for referred user</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Status or Apply Button */}
        {hasApplied ? (
          <Card className="shadow-xl">
            <CardHeader className={`${
              application.status === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
              application.status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
              'bg-gradient-to-r from-yellow-500 to-orange-600'
            } text-white`}>
              <CardTitle>Your Application Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 font-medium">Status:</p>
                  <Badge className={
                    application.status === 'approved' ? 'bg-green-600' :
                    application.status === 'rejected' ? 'bg-red-600' :
                    'bg-yellow-600'
                  }>
                    {application.status === 'approved' ? '✓ Approved' :
                     application.status === 'rejected' ? '✗ Rejected' :
                     '⏳ Pending Review'}
                  </Badge>
                </div>

                {application.status === 'approved' && (
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <p className="font-bold text-green-900 text-center mb-2">
                      🎉 Congratulations! You are now a Referral Partner
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{application.total_referrals || 0}</p>
                        <p className="text-sm text-gray-600">Total Referrals</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-green-600">₹{application.total_earnings || 0}</p>
                        <p className="text-sm text-gray-600">Total Earnings</p>
                      </div>
                    </div>
                  </div>
                )}

                {application.status === 'pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-yellow-800">⏳ Your application is under review. Admin will notify you soon!</p>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-red-800">❌ Your application was not approved. Contact admin for details.</p>
                  </div>
                )}

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2"><strong>Submitted Details:</strong></p>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {application.full_name}</p>
                    <p><strong>Phone:</strong> {application.phone}</p>
                    <p><strong>Email:</strong> {application.email || 'N/A'}</p>
                    <p><strong>Address:</strong> {application.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle>Apply to Become a Referral Partner</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg mb-6">
                <p className="text-amber-900 font-semibold text-center">
                  💡 Submit your details to become an official referral partner
                </p>
              </div>

              <Button 
                onClick={() => setApplyDialog(true)}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg"
              >
                <Gift className="w-5 h-5 mr-2" />
                Apply for Referral Partner
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Form Dialog */}
      <Dialog open={applyDialog} onOpenChange={setApplyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Referral Partner Application</DialogTitle>
            <DialogDescription>Fill in your details to apply</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label>Phone Number *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email address"
                type="email"
              />
            </div>

            <div>
              <Label>Qualification *</Label>
              <Input
                value={formData.qualification}
                onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                placeholder="e.g., Graduate, 12th Pass"
              />
            </div>

            <div>
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Enter your city"
              />
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 text-center font-medium">
                ✅ Earn ₹150 per referral + ₹50 per approved task!
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={applyMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
