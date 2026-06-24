import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  KeyRound, 
  Phone, 
  Mail, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

export default function UserSignup() {
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    login_user_id: "",
    login_password: "",
    confirm_password: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        
        // If user already has login credentials set, redirect to login page
        if (user && user.login_user_id && user.login_password) {
          window.location.href = "#" + createPageUrl("UserLogin");
          return;
        }
        
        // User is authenticated but no credentials yet, show signup form
        if (user) {
          setShowSignupForm(true);
        }
      } catch (error) {
        // Not authenticated, stay on Google signup page
        setShowSignupForm(false);
      }
    };
    checkAuth();
  }, []);

  const generateUserId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'WD';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!formData.full_name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError("Please enter valid mobile number");
      return;
    }
    if (!formData.login_user_id.trim() || formData.login_user_id.length < 4) {
      setError("User ID must be at least 4 characters");
      return;
    }
    if (!formData.login_password.trim() || formData.login_password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.login_password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      // Check if user ID already exists
      const existingUsers = await base44.entities.User.list();
      const userIdExists = existingUsers.some(u => 
        u.login_user_id?.toLowerCase() === formData.login_user_id.toLowerCase()
      );
      
      if (userIdExists) {
        setError("This User ID is already taken. Please choose another.");
        setSubmitting(false);
        return;
      }

      // Check if email already exists
      if (formData.email) {
        const emailExists = existingUsers.some(u => 
          u.email?.toLowerCase() === formData.email.toLowerCase()
        );
        if (emailExists) {
          setError("Account with this email already exists. Please login.");
          setSubmitting(false);
          return;
        }
      }

      // Get current user (from Google auth)
      const currentUser = await base44.auth.me();
      
      // Update user with signup details
      await base44.entities.User.update(currentUser.id, {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || currentUser.email,
        login_user_id: formData.login_user_id.toUpperCase(),
        login_password: formData.login_password,
        user_id: generateUserId(),
        is_approved: false,
        approval_status: "pending",
        is_system_verified: false
      });

      setSubmitted(true);
      
      // After 3 seconds, redirect to login page (keep user logged in)
      setTimeout(() => {
        window.location.href = "#" + createPageUrl("UserLogin");
      }, 3000);
    } catch (error) {
      console.error("Signup error:", error);
      setError("Failed to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Google Signup Screen (Initial)
  if (!showSignupForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e9e7d6f2c135f2968907d8/b84b417d1_6296293782902737811.jpg"
              alt="WorkDen"
              className="h-16 mx-auto mb-4 object-contain"
            />
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome to WorkDen
            </CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              Work from Home • Earn Money Online
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            <Button
              onClick={() => {
                base44.auth.redirectToLogin(window.location.href);
              }}
              className="w-full h-14 text-lg bg-white hover:bg-gray-50 text-gray-800 shadow-lg border-2 border-gray-200"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-3" alt="Google" />
              Continue with Google
            </Button>
            
            <p className="text-xs text-white text-center mt-4">
              By signing up, you agree to our Terms & Conditions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Registration Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account is pending admin approval. You will be able to login once approved.
            </p>
            
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-6 text-left">
              <p className="text-amber-800 text-sm font-medium mb-2">📌 Your Login Details:</p>
              <div className="space-y-1 text-sm">
                <p><strong>User ID:</strong> {formData.login_user_id.toUpperCase()}</p>
                <p><strong>Password:</strong> {formData.login_password}</p>
              </div>
              <p className="text-xs text-amber-600 mt-2">
                Save these! You'll need them to login after approval.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p>⏳ Admin will review your application within 24 hours.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4 flex items-center justify-center relative">
      <Card className="w-full max-w-md shadow-2xl border-0">
        {/* Back Arrow - Only on Details Form Page */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 left-6 text-white hover:bg-white/20 z-10"
          onClick={async () => {
            // Logout user and return to Google signup
            await base44.auth.logout();
            window.location.reload();
          }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <CardHeader className="text-center pb-2">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e9e7d6f2c135f2968907d8/b84b417d1_6296293782902737811.jpg"
            alt="WorkDen"
            className="h-16 mx-auto mb-4 object-contain"
          />
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create Your Account
          </CardTitle>
          <p className="text-gray-600 text-sm mt-1">
            Fill in your details to register
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Mobile Number *
              </Label>
              <Input
                placeholder="Enter mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email (Optional)
              </Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">🔐 Create Your Login Credentials</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Choose User ID *
                  </Label>
                  <Input
                    placeholder="e.g., JOHN123"
                    value={formData.login_user_id}
                    onChange={(e) => setFormData({...formData, login_user_id: e.target.value.toUpperCase()})}
                    className="uppercase"
                    required
                  />
                  <p className="text-xs text-gray-500">Min 4 characters, letters & numbers only</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Choose Password *
                  </Label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={formData.login_password}
                    onChange={(e) => setFormData({...formData, login_password: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-500">Min 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Confirm Password *
                  </Label>
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Submit for Approval
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By registering, you agree to our Terms & Conditions
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
