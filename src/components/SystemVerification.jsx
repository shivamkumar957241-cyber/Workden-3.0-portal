import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, Loader2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SystemVerification({ user, onVerified }) {
  const [systemId, setSystemId] = useState("");
  const [systemPassword, setSystemPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError("");
    
    if (!systemId.trim() || !systemPassword.trim()) {
      setError("Please enter both User ID and Password");
      return;
    }

    setVerifying(true);
    try {
      // Check if entered credentials match
      if (systemId.trim() === user.login_user_id && systemPassword.trim() === user.login_password) {
        // Update user as verified
        await base44.entities.User.update(user.id, { is_system_verified: true });
        onVerified();
      } else {
        setError("Invalid User ID or Password. Please contact admin.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-slate-300">
        <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-900 text-white text-center rounded-t-lg">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">WorkDen User Login</CardTitle>
          <p className="text-sm text-slate-200 mt-2">
            Enter your User ID & Password to access the platform
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">How to get your credentials?</p>
                <p className="mt-1">Contact your HR/Recruiter to receive your System ID and Password via WhatsApp or Email.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label className="font-semibold">User ID</Label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={systemId}
                  onChange={(e) => setSystemId(e.target.value.toUpperCase())}
                  placeholder="Enter User ID (e.g., USR1A2B3C)"
                  className="pl-10 font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="font-semibold">User Password</Label>
              <div className="relative mt-1">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  value={systemPassword}
                  onChange={(e) => setSystemPassword(e.target.value)}
                  placeholder="Enter User Password"
                  className="pl-10 font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={verifying}
              className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-lg"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Verify & Continue
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Need help? Contact support:</p>
            <p className="font-semibold text-gray-700">workdenindia567@gmail.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
