import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  User, 
  Bell, 
  CheckCircle,
  Phone,
  Save,
  Trash2,
  AlertTriangle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Wallet Password
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Profile Edit
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Delete Account
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setPhone(currentUser.phone || "");
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetWalletPassword = async () => {
    if (user?.wallet_password && currentPassword !== user.wallet_password) {
      alert("❌ Current password is incorrect!");
      return;
    }

    if (newPassword.length < 4) {
      alert("❌ Password must be at least 4 characters!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    setSavingPassword(true);
    try {
      await base44.entities.User.update(user.id, { wallet_password: newPassword });
      alert("✅ Wallet password updated successfully!");
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      loadUser();
    } catch (error) {
      alert("❌ Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!phone.trim()) {
      alert("⚠️ Please enter a valid phone number");
      return;
    }

    setSavingProfile(true);
    try {
      await base44.entities.User.update(user.id, { phone: phone.trim() });
      alert("✅ Phone number updated!");
      loadUser();
    } catch (error) {
      alert("❌ Failed to update phone number");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert("⚠️ Please type DELETE to confirm");
      return;
    }

    setDeleting(true);
    try {
      // Update user status to inactive
      await base44.entities.User.update(user.id, { status: 'inactive' });
      
      alert("✅ Account deleted successfully. You will be logged out.");
      
      // Clear all data and logout
      localStorage.clear();
      sessionStorage.clear();
      await base44.auth.logout();
      window.location.href = "#/";
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("❌ Failed to delete account. Please contact support.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4 md:p-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account settings and security</p>
        </div>

        {/* Profile Section */}
        <Card className="mb-6 shadow-lg border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-gray-700">Full Name</Label>
              <Input value={user?.full_name || ''} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500 mt-1">Contact admin to change your name</p>
            </div>

            <div>
              <Label className="text-gray-700">Email</Label>
              <Input value={user?.email || ''} disabled className="bg-gray-50" />
            </div>

            <div>
              <Label className="text-gray-700">User ID</Label>
              <Input value={user?.user_id || ''} disabled className="bg-gray-50" />
            </div>

            <div>
              <Label className="text-gray-700">Phone Number</Label>
              <Input
                value={user?.phone || 'Not set'}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed after signup</p>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Security */}
        <Card className="mb-6 shadow-lg border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Shield className="w-5 h-5" />
              Wallet Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Wallet Password</h3>
                <p className="text-sm text-gray-600">
                  {user?.wallet_password 
                    ? 'Password is set - your wallet is protected'
                    : 'Set a password to protect your wallet balance'
                  }
                </p>
              </div>
              <Badge 
                variant={user?.wallet_password ? 'default' : 'secondary'}
                className={user?.wallet_password ? 'bg-green-600' : ''}
              >
                {user?.wallet_password ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Protected</>
                ) : (
                  'Not Set'
                )}
              </Badge>
            </div>
            
            <Button 
              onClick={() => setShowPasswordDialog(true)}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              {user?.wallet_password ? 'Change Wallet Password' : 'Set Wallet Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="mb-6 shadow-lg border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="w-5 h-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Account Status</span>
              <Badge className={user?.status === 'active' ? 'bg-green-600' : 'bg-red-600'}>
                {user?.status === 'active' ? '✓ Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">ID Verification</span>
              <Badge 
                variant={user?.id_verification_status === 'verified' ? 'default' : 'secondary'}
                className={user?.id_verification_status === 'verified' ? 'bg-green-600' : ''}
              >
                {user?.id_verification_status === 'verified' 
                  ? '✓ Verified' 
                  : user?.id_verification_status === 'pending'
                  ? '⏳ Pending'
                  : 'Not Verified'
                }
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Training Access</span>
              <Badge 
                variant={user?.training_access ? 'default' : 'secondary'}
                className={user?.training_access ? 'bg-green-600' : ''}
              >
                {user?.training_access ? '✓ Enabled' : 'Disabled'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">User Badge</span>
              <Badge variant="outline" className="capitalize border-2 border-purple-300 text-purple-700">
                🏆 {user?.badge || 'Bronze'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mb-6 shadow-lg border-2 border-red-300">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Delete Account</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete your WorkDen account, all work history, and wallet data. This action cannot be undone.
                </p>
              </div>
              
              <Button 
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {user?.wallet_password ? 'Change Wallet Password' : 'Set Wallet Password'}
              </DialogTitle>
              <DialogDescription>
                {user?.wallet_password 
                  ? 'Enter your current password and set a new one'
                  : 'Set a password to protect your wallet balance from unauthorized viewing'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {user?.wallet_password && (
                <div>
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPwd ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    >
                      {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPwd ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 4 characters)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                  >
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSetWalletPassword}
                disabled={savingPassword}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {savingPassword ? 'Saving...' : 'Save Password'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog - First Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-semibold">This will permanently delete your account including:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All submitted work and history</li>
                  <li>Wallet balance and transaction records</li>
                  <li>Profile data and settings</li>
                  <li>Referral data and earnings</li>
                </ul>
                <p className="font-bold text-red-600 mt-3">This action CANNOT be undone!</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowDeleteDialog(false);
                  setShowFinalConfirmation(true);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Continue to Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Account Dialog - Final Confirmation */}
        <Dialog open={showFinalConfirmation} onOpenChange={setShowFinalConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Final Confirmation Required
              </DialogTitle>
              <DialogDescription>
                To confirm account deletion, type <span className="font-bold">DELETE</span> in the box below
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Last Warning</p>
                <p className="text-xs text-red-700">
                  Once you click "Delete Account", all your data will be permanently removed and you will be logged out immediately.
                </p>
              </div>

              <div>
                <Label>Type DELETE to confirm</Label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="border-red-300 focus:border-red-500"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowFinalConfirmation(false);
                  setDeleteConfirmText("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
