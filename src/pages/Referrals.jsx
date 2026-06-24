import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Copy, Share2, MessageCircle, CheckCircle, Clock, XCircle, ArrowLeft, Gift, Link as LinkIcon, Lock, Wallet, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Referrals() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [transferDialog, setTransferDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        let currentUser = await base44.auth.me();
        
        // Check if user has referral access enabled by admin
        if (!currentUser.referral_access_enabled) {
          return;
        }
        
        // Generate short name-based referral code if not exists
        if (!currentUser.referral_code) {
          const name = (currentUser.full_name || currentUser.email.split('@')[0]).replace(/\s+/g, '').toUpperCase();
          const shortCode = name.substring(0, 6) + Math.random().toString(36).substring(2, 5).toUpperCase();
          await base44.entities.User.update(currentUser.id, { referral_code: shortCode });
          currentUser = await base44.auth.me();
        }
        
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const { data: referrals = [] } = useQuery({
    queryKey: ['user-referrals', user?.id],
    queryFn: () => base44.entities.Referral.filter({ referrer_id: user?.id }),
    enabled: !!user?.id && isUnlocked,
    placeholderData: []
  });

  const { data: allProofs = [] } = useQuery({
    queryKey: ['all-proofs-referrals'],
    queryFn: () => base44.entities.Proof.list(),
    enabled: !!user?.id && isUnlocked,
    placeholderData: []
  });

  const transferBonusMutation = useMutation({
    mutationFn: async () => {
      const referralBonus = user.referral_bonus || 0;
      const newWalletBalance = (user.wallet_balance || 0) + referralBonus;
      
      await base44.entities.User.update(user.id, {
        wallet_balance: newWalletBalance,
        total_earnings: (user.total_earnings || 0) + referralBonus,
        referral_bonus: 0
      });
      
      return { transferredAmount: referralBonus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-referrals'] });
      setUser({ ...user, referral_bonus: 0, wallet_balance: (user.wallet_balance || 0) + data.transferredAmount });
      setTransferDialog(false);
      alert(`✅ ₹${data.transferredAmount} transferred to your wallet successfully!`);
    }
  });

  const handlePasswordSubmit = () => {
    if (passwordInput === "workden@000") {
      setIsUnlocked(true);
      setPasswordDialog(false);
    } else {
      alert("❌ Incorrect password!");
      setPasswordInput("");
    }
  };

  if (!user || !user.referral_access_enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">Referral system access not enabled for your account.</p>
            <p className="text-sm text-gray-500">Please contact admin to get referral access.</p>
            <Link to={createPageUrl("Dashboard")} className="mt-4 inline-block">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const referralLink = user?.referral_code 
    ? `${window.location.origin}?ref=${user.referral_code}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const userName = user?.full_name || 'Your friend';
    const message = `🎉 *${userName}* invited you to join WorkDen!\n\n💰 Work from home and earn daily!\n\n👉 Join now:\n${referralLink}\n\n✅ Get paid daily for your work!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareSMS = () => {
    const userName = user?.full_name || 'Your friend';
    const message = `${userName} invited you to WorkDen! Join here: ${referralLink}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      verified: 'default',
      rejected: 'destructive',
      pending: 'secondary'
    };
    return <Badge variant={variants[status] || 'secondary'} className="text-xs">{status}</Badge>;
  };

  // Calculate bonus earned from each referral
  const referralDetails = referrals.map(ref => {
    const userProofs = allProofs.filter(p => 
      p.user_id === ref.referred_user_id && 
      p.status === 'approved'
    );
    const hasCompletedTasks = userProofs.length > 0;
    const bonusEarned = hasCompletedTasks ? 20 : 0;
    
    return {
      ...ref,
      tasksCompleted: userProofs.length,
      bonusEarned,
      isActive: hasCompletedTasks
    };
  });

  const activeReferrals = referralDetails.filter(r => r.isActive).length;
  const totalBonusEarned = referralDetails.reduce((sum, r) => sum + r.bonusEarned, 0);
  const currentReferralBonus = user?.referral_bonus || 0;
  const canTransfer = currentReferralBonus >= 4999;

  return (
    <>
      {/* Password Dialog */}
      <Dialog open={passwordDialog && !isUnlocked} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Enter Password
            </DialogTitle>
            <DialogDescription>
              Enter the password to access referral system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Password</Label>
              <Input 
                type="password" 
                placeholder="Enter password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handlePasswordSubmit}>Unlock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Bonus to Wallet</DialogTitle>
            <DialogDescription>
              Transfer your referral bonus to your main wallet
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <Wallet className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <p className="text-sm text-gray-600 mb-2">Transfer Amount</p>
              <p className="text-4xl font-bold text-green-600">₹{Number(currentReferralBonus).toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">This will be added to your wallet balance</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => transferBonusMutation.mutate()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Transfer Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isUnlocked && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
              <Link to={createPageUrl("Dashboard")}>
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Referral Program
                </h1>
                <p className="text-sm text-slate-600">Invite friends and earn ₹20 per active user</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <Users className="w-10 h-10 mb-2" />
                  <p className="text-sm opacity-90">Total Referrals</p>
                  <p className="text-4xl font-bold">{referrals.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <CheckCircle className="w-10 h-10 mb-2" />
                  <p className="text-sm opacity-90">Active Users</p>
                  <p className="text-4xl font-bold">{activeReferrals}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <TrendingUp className="w-10 h-10 mb-2" />
                  <p className="text-sm opacity-90">Total Earned</p>
                  <p className="text-4xl font-bold">₹{totalBonusEarned}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <Wallet className="w-10 h-10 mb-2" />
                  <p className="text-sm opacity-90">Bonus Balance</p>
                  <p className="text-4xl font-bold">₹{Number(currentReferralBonus).toFixed(0)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Bonus Card */}
            <Card className="mb-6 border-2 border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-6 h-6 text-green-600" />
                    Referral Bonus Balance
                  </div>
                  {canTransfer && (
                    <Button 
                      onClick={() => setTransferDialog(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Transfer to Wallet
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 mb-4">
                  <p className="text-sm opacity-90 mb-2">Your Current Bonus Balance</p>
                  <p className="text-5xl font-bold mb-3">₹{Number(currentReferralBonus).toFixed(2)}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>₹20 earned per active referral</span>
                  </div>
                </div>
                
                {!canTransfer && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      💡 Transfer Requirement: ₹4,999
                    </p>
                    <p className="text-xs text-blue-700">
                      You need ₹{(4999 - Number(currentReferralBonus)).toFixed(2)} more to transfer to wallet
                    </p>
                    <div className="mt-3 bg-blue-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-500"
                        style={{ width: `${Math.min((currentReferralBonus / 4999) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600 text-right mt-1">
                      {((Number(currentReferralBonus) / 4999) * 100).toFixed(1)}% Complete
                    </p>
                  </div>
                )}

                {canTransfer && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-900 font-semibold mb-1">
                      ✅ Ready to Transfer!
                    </p>
                    <p className="text-sm text-green-700">
                      Your bonus has reached the minimum amount. You can now transfer it to your wallet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Referral Link Card */}
            <Card className="mb-6 border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-6 h-6 text-blue-600" />
                  {user?.full_name}'s Invite Link
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Share this link with friends:</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        value={referralLink} 
                        readOnly 
                        className="pl-10 bg-blue-50 border-blue-200 font-mono text-sm"
                      />
                    </div>
                    <Button 
                      onClick={copyToClipboard}
                      className="bg-blue-600 hover:bg-blue-700 min-w-[100px]"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    onClick={shareWhatsApp}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Share on WhatsApp
                  </Button>
                  <Button 
                    onClick={shareSMS}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share via SMS
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium">
                    <strong>Your Referral Code:</strong> <span className="font-mono text-lg text-blue-700">{user?.referral_code}</span>
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    💰 Earn ₹20 when your referral completes their first task!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Referred Users List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals - Detailed View ({referrals.length} total, {activeReferrals} active)</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {referralDetails.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Signup Date</TableHead>
                        <TableHead>Tasks Done</TableHead>
                        <TableHead>Bonus Earned</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referralDetails.map(referral => (
                        <TableRow key={referral.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${referral.isActive ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gray-400'} flex items-center justify-center text-white font-bold`}>
                                {referral.referred_user_name?.[0] || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold">{referral.referred_user_name || 'New User'}</p>
                                <p className="text-xs text-gray-500">ID: {referral.referred_user_id.substring(0, 8)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{referral.referred_user_email}</p>
                              {referral.referred_user_phone && (
                                <p className="text-gray-500">{referral.referred_user_phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(referral.signup_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={referral.isActive ? 'default' : 'secondary'} className="text-xs">
                              {referral.tasksCompleted} tasks
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-bold text-lg ${referral.bonusEarned > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              ₹{referral.bonusEarned}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {referral.isActive ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <Badge variant="default" className="text-xs">Active</Badge>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold mb-2">No referrals yet</p>
                    <p className="text-sm">Share your referral link to invite friends!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
