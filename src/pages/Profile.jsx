import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Shield, Camera, CheckCircle, AlertCircle, Image, Phone, MapPin, FileText, Eye, Download, Trophy, Star, Award, Zap } from "lucide-react";

const getAchievementTag = (approvedCount) => {
  if (approvedCount >= 100) return { label: "Platinum", icon: "💎", color: "bg-gradient-to-r from-slate-400 to-slate-600 text-white", min: 100 };
  if (approvedCount >= 50) return { label: "Gold", icon: "🥇", color: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white", min: 50 };
  if (approvedCount >= 25) return { label: "Silver", icon: "🥈", color: "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900", min: 25 };
  return { label: "Normal", icon: "⭐", color: "bg-gradient-to-r from-blue-400 to-blue-500 text-white", min: 0 };
};
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDP, setUploadingDP] = useState(false);
  const [idCardLink, setIdCardLink] = useState("");
  const [savingIdCard, setSavingIdCard] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [savingMobile, setSavingMobile] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [docLinks, setDocLinks] = useState({ pan_card_url: "", aadhaar_url: "", bank_passbook_url: "" });
  const [savingDocs, setSavingDocs] = useState(false);
  const [approvedTaskCount, setApprovedTaskCount] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      base44.entities.Proof.filter({ user_id: user.id }).then(proofs => {
        setApprovedTaskCount(proofs.filter(p => p.status === 'approved').length);
      }).catch(() => {});
    }
  }, [user?.id]);

  const loadUser = async () => {
    try {
      const userSource = localStorage.getItem('workden_user_source');
      const savedUserId = localStorage.getItem('workden_login_id');

      if (userSource === 'appuser' && savedUserId) {
        // Load from AppUser entity
        const appUsers = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
        if (appUsers && appUsers.length > 0) {
          const u = appUsers[0];
          setUser(u);
          setIdCardLink(u.id_card_url || "");
          setMobileNumber(u.phone || "");
          setDocLinks({ pan_card_url: u.pan_card_url || "", aadhaar_url: u.aadhaar_url || "", bank_passbook_url: u.bank_passbook_url || "" });
          return;
        }
      }

      // Admin shortcut session
      if (savedUserId === 'SHIVAM') {
        const savedUser = localStorage.getItem('workden_user');
        if (savedUser) {
          const u = JSON.parse(savedUser);
          setUser(u);
          setMobileNumber(u.phone || "");
          return;
        }
      }

      // Fallback to base44 auth
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIdCardLink(currentUser.id_card_url || "");
      setMobileNumber(currentUser.phone || "");
      setDocLinks({ pan_card_url: currentUser.pan_card_url || "", aadhaar_url: currentUser.aadhaar_url || "", bank_passbook_url: currentUser.bank_passbook_url || "" });
    } catch (error) {
      // Use localStorage cache
      const savedUser = localStorage.getItem('workden_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        setIdCardLink(u.id_card_url || "");
        setMobileNumber(u.phone || "");
        setDocLinks({ pan_card_url: u.pan_card_url || "", aadhaar_url: u.aadhaar_url || "", bank_passbook_url: u.bank_passbook_url || "" });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserRecord = async (data) => {
    const userSource = localStorage.getItem('workden_user_source');
    if (userSource === 'appuser') {
      await base44.entities.AppUser.update(user.id, data);
    } else {
      await base44.entities.User.update(user.id, data);
    }
    // Update localStorage cache
    const updated = { ...user, ...data };
    localStorage.setItem('workden_user', JSON.stringify(updated));
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert("❌ Please upload an image file."); e.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { alert("❌ Image too large. Max 5MB."); e.target.value = ''; return; }
    setUploadingDP(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateUserRecord({ profile_picture: file_url });
      alert("✅ Profile picture uploaded!");
      await loadUser();
      e.target.value = '';
    } catch (error) {
      alert("❌ Failed to upload. Please try again.");
      e.target.value = '';
    } finally {
      setUploadingDP(false);
    }
  };

  const handleSaveIdCardLink = async () => {
    if (!idCardLink.trim() || !idCardLink.includes("http")) {
      alert("❌ Please enter a valid URL");
      return;
    }
    setSavingIdCard(true);
    try {
      await updateUserRecord({
        id_card_url: idCardLink.trim(),
        id_card_uploaded_at: new Date().toISOString(),
        id_verification_status: "pending"
      });
      alert("✅ ID Card link submitted! Admin will verify soon.");
      await loadUser();
    } catch (error) {
      alert("❌ Failed to save. Please try again.");
    } finally {
      setSavingIdCard(false);
    }
  };

  const handleSaveDocs = async () => {
    setSavingDocs(true);
    try {
      await updateUserRecord({ pan_card_url: docLinks.pan_card_url.trim(), aadhaar_url: docLinks.aadhaar_url.trim(), bank_passbook_url: docLinks.bank_passbook_url.trim() });
      alert("✅ Documents submitted! Admin will verify soon.");
      await loadUser();
    } catch {
      alert("❌ Failed to save. Please try again.");
    } finally {
      setSavingDocs(false);
    }
  };

  const handleSaveMobile = async () => {
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      alert("⚠️ Please enter a valid mobile number");
      return;
    }
    setSavingMobile(true);
    try {
      await updateUserRecord({ phone: mobileNumber.trim() });
      alert("✅ Mobile number updated!");
      await loadUser();
    } catch (error) {
      alert("❌ Failed to update. Please try again.");
    } finally {
      setSavingMobile(false);
    }
  };

  const getSubscriptionStartDate = () => {
    // For admin/recruiter-created users, use created_date as fallback if subscribed
    const d = user?.subscription_activation_date || user?.subscription_date ||
      (user?.is_subscribed ? (user?.created_date || user?.updated_date) : null);
    return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "Not Activated";
  };

  const getSubscriptionExpiryDate = () => {
    if (user?.subscription_expiry_date) return new Date(user.subscription_expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const d = user?.subscription_activation_date || user?.subscription_date ||
      (user?.is_subscribed ? (user?.created_date || user?.updated_date) : null);
    if (!d) return "Not Activated";
    const exp = new Date(d); exp.setFullYear(exp.getFullYear() + 1);
    return exp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const convertDriveUrlToEmbed = (url) => {
    if (!url) return "";
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">My Profile</h1>
          <p className="text-gray-600">View and manage your account information</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b-2 border-purple-200">
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <User className="w-6 h-6" />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4 pb-4 border-b-2 border-gray-200">
                <div className="relative">
                  {user?.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-300 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-3xl font-bold shadow-md">
                      {user?.full_name?.[0] || user?.email?.[0] || "U"}
                    </div>
                  )}
                  <label 
                    htmlFor="profile-picture-upload" 
                    className={`absolute bottom-0 right-0 bg-gray-800 text-white p-1.5 rounded-full ${uploadingDP ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-900'} transition-colors shadow-md`}
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleProfilePictureUpload}
                    disabled={uploadingDP}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{user?.full_name || "User"}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm font-semibold text-gray-700">ID: {user?.user_id || user?.login_user_id}</p>
                  {uploadingDP && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                  {/* Achievement Tag */}
                  {(() => {
                    const tag = getAchievementTag(approvedTaskCount);
                    const nextTag = approvedTaskCount < 25 ? { label: "Silver", min: 25 } : approvedTaskCount < 50 ? { label: "Gold", min: 50 } : approvedTaskCount < 100 ? { label: "Platinum", min: 100 } : null;
                    return (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold shadow ${tag.color}`}>
                          {tag.icon} {tag.label} Member
                        </span>
                        <span className="text-xs text-gray-500">({approvedTaskCount} tasks approved)</span>
                        {nextTag && (
                          <span className="text-xs text-gray-400">{nextTag.min - approvedTaskCount} more for {nextTag.label}</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Read-only Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 text-gray-900 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    value={user?.full_name || ""}
                    disabled
                    className="border-2 border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-gray-900 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="border-2 border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-gray-900 mb-2">
                    <MapPin className="w-4 h-4" />
                    City
                  </Label>
                  <Input
                    value={user?.city || "Not provided"}
                    disabled
                    className="border-2 border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-gray-900 mb-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </Label>
                  <Input
                    value={user?.role || "user"}
                    disabled
                    className="border-2 border-gray-300 bg-gray-100 text-gray-700 capitalize"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-gray-900 mb-2">
                    <Calendar className="w-4 h-4" />
                    Subscription Activation Date
                  </Label>
                  <Input
                    value={getSubscriptionStartDate()}
                    disabled
                    className="border-2 border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-gray-900 mb-2">
                    <Calendar className="w-4 h-4" />
                    Subscription Expiry Date
                  </Label>
                  <Input
                    value={getSubscriptionExpiryDate()}
                    disabled
                    className="border-2 border-gray-300 bg-gray-100 text-gray-700"
                  />
                </div>
              </div>

              {/* Phone - non-editable for all users */}
              <div>
                <Label className="flex items-center gap-2 text-gray-900 mb-2">
                  <Phone className="w-4 h-4" />
                  Mobile Number
                </Label>
                <Input
                  value={user?.phone || "Not provided"}
                  disabled
                  className="border-2 border-gray-300 bg-gray-100 text-gray-700"
                />
              </div>

              {/* Qualification - show for all users */}
              <div>
                <Label className="flex items-center gap-2 text-gray-900 mb-2">
                  <FileText className="w-4 h-4" />
                  Qualification
                </Label>
                <Input
                  value={user?.qualification || "Not provided"}
                  disabled
                  className="border-2 border-gray-300 bg-gray-100 text-gray-700"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Section */}
        {user?.invoice_url && (
          <Card className="mb-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-200">
              <CardTitle className="text-green-900 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Subscription Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-900 font-semibold mb-2">Your subscription invoice is available</p>
                  <p className="text-sm text-green-700">Generated: {new Date(user.subscription_activation_date || user.created_date).toLocaleDateString()}</p>
                </div>
                <Button 
                  onClick={() => setShowInvoiceDialog(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Upload Section */}
        <Card className="mb-6 border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 border-b-2 border-orange-200">
            <CardTitle className="text-orange-900 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Document Upload (Google Drive Links)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              📋 <strong>Instructions:</strong> Upload each document to Google Drive → Right-click → Share → "Anyone with the link" → Copy link → Paste below.<br/>
              <strong>File naming:</strong> YourName_PAN.pdf, YourName_Aadhaar.pdf, YourName_Passbook.pdf
            </div>

            <div className="space-y-1">
              <Label className="text-gray-900 font-semibold">🪪 PAN Card (Google Drive Link)</Label>
              <Input placeholder="https://drive.google.com/file/..." value={docLinks.pan_card_url} onChange={e => setDocLinks(p => ({...p, pan_card_url: e.target.value}))} className="border-2 border-gray-300" />
              {user?.pan_card_url && <a href={user.pan_card_url} target="_blank" className="text-xs text-blue-600 hover:underline">View submitted link →</a>}
            </div>

            <div className="space-y-1">
              <Label className="text-gray-900 font-semibold">📄 Aadhaar Card (Google Drive Link)</Label>
              <Input placeholder="https://drive.google.com/file/..." value={docLinks.aadhaar_url} onChange={e => setDocLinks(p => ({...p, aadhaar_url: e.target.value}))} className="border-2 border-gray-300" />
              {user?.aadhaar_url && <a href={user.aadhaar_url} target="_blank" className="text-xs text-blue-600 hover:underline">View submitted link →</a>}
            </div>

            <div className="space-y-1">
              <Label className="text-gray-900 font-semibold">🏦 Bank Passbook / Cheque (Google Drive Link)</Label>
              <Input placeholder="https://drive.google.com/file/..." value={docLinks.bank_passbook_url} onChange={e => setDocLinks(p => ({...p, bank_passbook_url: e.target.value}))} className="border-2 border-gray-300" />
              {user?.bank_passbook_url && <a href={user.bank_passbook_url} target="_blank" className="text-xs text-blue-600 hover:underline">View submitted link →</a>}
            </div>

            <Button onClick={handleSaveDocs} disabled={savingDocs} className="w-full bg-orange-600 hover:bg-orange-700">
              {savingDocs ? "Saving..." : "Submit Documents"}
            </Button>
          </CardContent>
        </Card>

        {/* ID Card Section */}
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b-2 border-blue-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Image className="w-6 h-6" />
                ID Card Upload
              </CardTitle>
              {user?.id_verification_status && (
                <Badge variant={user.id_verification_status === 'verified' ? 'default' : user.id_verification_status === 'rejected' ? 'destructive' : 'secondary'}>
                  {user.id_verification_status === 'verified' ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Verified</>
                  ) : user.id_verification_status === 'rejected' ? (
                    <><AlertCircle className="w-3 h-3 mr-1" /> Rejected</>
                  ) : (
                    'Pending'
                  )}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {user?.id_card_url ? (
              <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">✅ ID Card Link Submitted</p>
                    <p className="text-xs text-green-700">
                      Status: {user.id_verification_status || "Pending verification"}
                    </p>
                    <a 
                      href={user.id_card_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View ID Card Link →
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  📅 Submitted: {user.id_card_uploaded_at ? new Date(user.id_card_uploaded_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-2">
                      ⚠️ Please submit your ID card link to verify your account
                    </p>
                    <p className="text-xs text-amber-800">
                      Accepted: ID card provided by WorkDen
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-gray-900">ID Card Link (Google Drive, Dropbox, etc.)</Label>
              <Input
                placeholder="https://drive.google.com/file/..."
                value={idCardLink}
                onChange={(e) => setIdCardLink(e.target.value)}
                disabled={savingIdCard}
                className="border-2 border-gray-300"
              />
              <p className="text-xs text-gray-600">
                📌 Upload your ID to Google Drive/Dropbox, make it shareable, and paste the link here
              </p>
              <Button 
                onClick={handleSaveIdCardLink} 
                disabled={!idCardLink.trim() || savingIdCard}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {savingIdCard ? "Submitting..." : user?.id_card_url ? "Update ID Card Link" : "Submit ID Card Link"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-4xl h-[85vh]">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Subscription Invoice</DialogTitle>
            </DialogHeader>
            {user?.invoice_url && (
              <div className="flex-1 h-full">
                <iframe
                  src={convertDriveUrlToEmbed(user.invoice_url)}
                  className="w-full h-full rounded-lg border-2 border-gray-300"
                  frameBorder="0"
                  title="Invoice"
                  allow="autoplay"
                ></iframe>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}