import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, User, KeyRound, AlertCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function RecruiterLogin() {
  const [recruiterCode, setRecruiterCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!recruiterCode.trim()) {
      setError("Please enter Recruiter Code");
      return;
    }

    setLoading(true);
    try {
      const recruiters = await base44.entities.Recruiter.list();
      const recruiter = recruiters.find(
        r => r.recruiter_code?.toUpperCase() === recruiterCode.trim().toUpperCase()
      );

      if (!recruiter) {
        setError("Invalid Recruiter Code");
        setLoading(false);
        return;
      }

      if (recruiter.status === 'inactive') {
        setError("Your account is inactive. Please contact admin.");
        setLoading(false);
        return;
      }

      // Save session
      const sessionData = {
        id: String(recruiter.id),
        name: recruiter.name,
        email: recruiter.email,
        mobile: recruiter.mobile,
        recruiter_code: recruiter.recruiter_code
      };
      
      console.log("✅ Recruiter logged in:", sessionData);
      localStorage.setItem('recruiter_session', JSON.stringify(sessionData));
      
      // Redirect to dashboard
      window.location.href = "#" + createPageUrl("RecruiterDashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-8 text-white text-center relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e9e7d6f2c135f2968907d8/b84b417d1_6296293782902737811.jpg"
              alt="WorkDen"
              className="h-16 mx-auto mb-3 object-contain"
            />
            <h1 className="text-3xl font-bold mb-1">Recruiter Login</h1>
            <p className="text-teal-100 text-sm">Access your recruiter dashboard</p>
          </div>
        </div>

        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700 font-semibold text-base">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                Recruiter Code
              </Label>
              <Input
                placeholder="Enter your recruiter code"
                value={recruiterCode}
                onChange={(e) => setRecruiterCode(e.target.value.toUpperCase())}
                className="border-2 border-gray-200 focus:border-teal-500 h-16 text-xl font-mono font-bold text-center rounded-xl px-4 tracking-widest"
                required
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Enter the unique code provided by admin
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 rounded-xl shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6 mr-2" />
                  Login to Dashboard
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Don't have a recruiter code?
            </p>
            <p className="text-xs text-gray-400">
              Contact admin to get your unique recruiter code
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
