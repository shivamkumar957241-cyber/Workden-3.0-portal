import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send } from "lucide-react";

export default function DailyFeedbackSurvey() {
  const [showSurvey, setShowSurvey] = useState(false);
  const [rating, setRating] = useState(0);
  const [experience, setExperience] = useState("good");
  const [issues, setIssues] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAndShowSurvey();
  }, []);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const checkAndShowSurvey = async () => {
    const lastSurvey = localStorage.getItem('last_feedback_survey');
    const now = new Date().getTime();
    
    // Check if already shown today (same calendar day)
    if (lastSurvey) {
      const lastDate = new Date(parseInt(lastSurvey));
      const today = new Date();
      
      // If last shown on the same day, don't show again
      if (lastDate.getDate() === today.getDate() && 
          lastDate.getMonth() === today.getMonth() && 
          lastDate.getFullYear() === today.getFullYear()) {
        return; // Already shown today
      }
    }
    
    // Don't show if dismissed in this session
    const surveyDismissed = sessionStorage.getItem('survey_dismissed_session');
    if (surveyDismissed) {
      return;
    }
    
    // Don't show if tasks are locked (user not subscribed)
    const cachedUser = localStorage.getItem('workden_3_user');
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        if (userData.role !== 'admin' && !userData.is_subscribed && !userData.free_unlock) {
          return; // Tasks locked, don't show survey
        }
      } catch (e) {}
    }
    
    // Show only once per day
    setTimeout(() => setShowSurvey(true), 3000);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please provide a rating");
      return;
    }

    setSubmitting(true);
    try {
      // Get user from localStorage first (works for AppUser too)
      const cachedUser = localStorage.getItem('workden_3_user');
      let userId = 'anonymous';
      let userName = 'User';

      if (cachedUser) {
        try {
          const u = JSON.parse(cachedUser);
          userId = u.id || u.login_user_id || 'anonymous';
          userName = u.full_name || u.email || u.login_user_id || 'User';
        } catch (e) {}
      }

      await base44.entities.UserFeedback.create({
        user_id: userId,
        user_name: userName,
        rating: rating,
        experience: experience,
        issues_faced: issues,
        suggestions: suggestions
      });

      localStorage.setItem('last_feedback_survey', new Date().getTime().toString());
      setShowSurvey(false);
      alert("✅ Thank you for your feedback!");
    } catch (error) {
      console.error("Feedback error:", error);
      // Still mark as submitted so it doesn't keep popping up
      localStorage.setItem('last_feedback_survey', new Date().getTime().toString());
      setShowSurvey(false);
      alert("✅ Feedback noted! Thank you.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    sessionStorage.setItem('survey_dismissed_session', 'true');
    setShowSurvey(false);
  };

  return (
    <Dialog open={showSurvey} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">📋 Daily Feedback</DialogTitle>
          <DialogDescription>Help us improve your experience</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-semibold mb-2 block">Rate your experience today</Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">Overall Experience</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'excellent', label: '😊 Excellent', color: 'from-green-500 to-emerald-600' },
                { value: 'good', label: '🙂 Good', color: 'from-blue-500 to-cyan-600' },
                { value: 'average', label: '😐 Average', color: 'from-yellow-500 to-orange-600' },
                { value: 'poor', label: '😞 Poor', color: 'from-red-500 to-pink-600' }
              ].map((exp) => (
                <button
                  key={exp.value}
                  type="button"
                  onClick={() => setExperience(exp.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    experience === exp.value 
                      ? `bg-gradient-to-r ${exp.color} text-white border-transparent` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Any issues faced? (Optional)</Label>
            <Textarea
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="Describe any problems..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Suggestions for improvement? (Optional)</Label>
            <Textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="Share your ideas..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {submitting ? "Submitting..." : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
