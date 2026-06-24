import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Gift, 
  Copy, 
  Share2, 
  CheckCircle, 
  Clock, 
  Lock, 
  IndianRupee,
  UserPlus,
  Award
} from "lucide-react";

export default function Referral() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Generate referral code if not exists
      if (!currentUser.referral_code) {
        const code = 'WD' + currentUser.id.slice(-6).toUpperCase() + Math.random().toString(36).slice(-4).toUpperCase();
        await base44.entities.User.update(currentUser.id, { referral_code: code });
        currentUser.referral_code = code;
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: referrals = [] } = useQuery({
    queryKey: ['my-referrals', user?.referral_code],
    queryFn: () => base44.entities.Referral.filter({ referrer_code: user?.referral_code }),
    enabled: !!user?.referral_code && user?.referral_access_enabled,
    placeholderData: [],
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.referral_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `Join WorkDen and earn money from home! Use my referral code: ${user?.referral_code}\n\nDownload now: ${window.location.origin}?ref=${user?.referral_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WorkDen - Work from Home',
          text: shareText,
        });
      } catch (error) {
        navigator.clipboard.writeText(shareText);
        alert("Link copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Referral link copied to clipboard!");
    }
  };

  const verifiedReferrals = referrals.filter(r => r.verification_status === 'verified');
  const pendingReferrals = referrals.filter(r => r.verification_status === 'pending');
  const totalBonus = user?.referral_bonus || 0;

  // If referral access not enabled
  if (user && !user.referral_access_enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-2 border-purple-200">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Referral Access Locked</h2>
              <p className="text-gray-600 mb-6">
                Referral system is currently disabled for your account. 
                Please contact admin to enable referral access.
              </p>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                🔒 Contact Admin to Unlock
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Refer & Earn
          </h1>
          <p className="text-gray-600">Invite friends and earn ₹30 for each successful referral!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <p className="text-xs opacity-90">Total Referrals</p>
              <p className="text-2xl font-bold">{referrals.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <p className="text-xs opacity-90">Verified</p>
              <p className="text-2xl font-bold">{verifiedReferrals.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <p className="text-xs opacity-90">Pending</p>
              <p className="text-2xl font-bold">{pendingReferrals.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-xl">
            <CardContent className="p-4 text-center">
              <IndianRupee className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <p className="text-xs opacity-90">Total Bonus</p>
              <p className="text-2xl font-bold">₹{totalBonus}</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Card */}
        <Card className="mb-8 shadow-2xl border-2 border-purple-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-6 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Your Referral Code</h2>
            </div>
            <p className="text-center text-purple-100 text-sm">
              Share this code with friends and earn ₹30 when their first task gets approved!
            </p>
          </div>
          
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Input
                  value={user?.referral_code || 'Loading...'}
                  readOnly
                  className="text-center text-2xl font-bold tracking-widest border-2 border-purple-300 bg-purple-50 h-16"
                />
              </div>
              <Button
                onClick={handleCopyCode}
                className={`h-16 px-6 ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {copied ? <CheckCircle className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="h-14 border-2 border-purple-300 hover:bg-purple-50"
              >
                <Copy className="w-5 h-5 mr-2" />
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button
                onClick={handleShare}
                className="h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="mb-8 shadow-xl border-2 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Award className="w-6 h-6" />
              How it Works
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  1
                </div>
                <h3 className="font-bold text-lg mb-2">Share Your Code</h3>
                <p className="text-sm text-gray-600">Share your unique referral code with friends and family</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  2
                </div>
                <h3 className="font-bold text-lg mb-2">Friend Signs Up</h3>
                <p className="text-sm text-gray-600">They register using your referral code and complete verification</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  3
                </div>
                <h3 className="font-bold text-lg mb-2">Earn ₹30 Bonus</h3>
                <p className="text-sm text-gray-600">Get ₹30 when their first task is approved by admin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="shadow-xl border-2 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <UserPlus className="w-6 h-6" />
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                        {referral.referred_user_name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{referral.referred_user_name || 'User'}</p>
                        <p className="text-sm text-gray-500">
                          Joined: {new Date(referral.signup_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={referral.verification_status === 'verified' ? 'default' : 'secondary'}
                      className={referral.verification_status === 'verified' ? 'bg-green-600' : ''}
                    >
                      {referral.verification_status === 'verified' ? (
                        <>✓ Verified - ₹30 Earned</>
                      ) : (
                        <>⏳ Pending</>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold mb-2">No Referrals Yet</p>
                <p className="text-sm">Share your code and start earning!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
