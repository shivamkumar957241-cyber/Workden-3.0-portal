import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send, CheckCircle, Loader2 } from "lucide-react";

const CATEGORIES = ["Task Quality", "Payment Speed", "App Experience", "Support Quality", "General Feedback"];

export default function Feedback() {
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('workden_3_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch(e) {}
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { alert("⚠️ Please select a rating"); return; }
    if (!category) { alert("⚠️ Please select a category"); return; }
    if (!message.trim()) { alert("⚠️ Please write your feedback"); return; }

    setSubmitting(true);
    try {
      await base44.entities.UserFeedback.create({
        user_id: user?.id || "guest",
        user_name: user?.full_name || "Anonymous",
        rating,
        category,
        message: message.trim(),
        submitted_date: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (error) {
      alert("❌ Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl text-center p-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your feedback has been submitted successfully.</p>
          <Button onClick={() => { setSubmitted(false); setRating(0); setCategory(""); setMessage(""); }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500">
            Submit Another
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Star className="w-10 h-10 text-yellow-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Share Feedback
            </h1>
          </div>
          <p className="text-gray-600">Help us improve your experience</p>
        </div>

        <Card className="shadow-xl border-2 border-yellow-200">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-yellow-200">
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Your Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div>
                <Label className="text-gray-800 font-semibold text-base mb-3 block">Overall Rating *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoveredRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-yellow-700 mt-1 font-medium">
                    {rating === 1 ? "😞 Poor" : rating === 2 ? "😐 Fair" : rating === 3 ? "🙂 Good" : rating === 4 ? "😊 Very Good" : "🤩 Excellent"}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <Label className="text-gray-800 font-semibold text-base mb-3 block">Category *</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                        category === cat
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <Label className="text-gray-800 font-semibold text-base mb-2 block">Your Feedback *</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your experience, suggestions, or any issues..."
                  rows={5}
                  className="border-2 border-yellow-200 focus:border-yellow-400"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || rating === 0 || !category || !message.trim()}
                className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-base"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</>
                ) : (
                  <><Send className="w-5 h-5 mr-2" />Submit Feedback</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
