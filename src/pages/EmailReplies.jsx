
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Save, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function EmailReplies() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(5 * 60 * 60);
  const [savedReplies, setSavedReplies] = useState([]);

  const TASK_DURATION = 5 * 60 * 60; // 5 hours

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      const remaining = Math.max(0, TASK_DURATION - elapsed);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateEmails = () => {
    const scenarios = [];
    const subjects = [
      "Order Delivery Delay Issue", "Product Return Request", "Billing Error Inquiry", "Technical Support Needed",
      "Account Access Problem", "Refund Status Query", "Product Information Request", "Complaint About Service",
      "Shipping Cost Question", "Payment Method Issue", "Invoice Not Received", "Product Defect Report",
      "Subscription Cancellation", "Order Modification Request", "Tracking Number Missing", "Gift Card Problem",
      "Warranty Claim Inquiry", "Discount Code Not Working", "Email Verification Issue", "Profile Update Request",
      "Partnership Proposal", "Bulk Order Inquiry", "Feedback Submission", "Meeting Schedule Request",
      "Job Application Follow-up", "Event Registration Confirm", "Newsletter Unsubscribe", "Privacy Policy Question",
      "Data Export Request", "Account Deletion Request", "Service Upgrade Inquiry", "Custom Order Request",
      "Price Match Request", "Installation Help Needed", "Product Compatibility Question", "Exchange Policy Query",
      "Pre-order Availability", "Backorder Status Check", "International Shipping Query", "Gift Wrapping Request",
      "Corporate Account Setup", "Wholesale Pricing Inquiry", "Affiliate Program Interest", "Sponsorship Request",
      "Media Inquiry", "Press Release Request", "Interview Request", "Content Collaboration", "Guest Post Proposal",
      "Review Product Sample", "Testimonial Request", "Case Study Participation", "Survey Invitation Response"
    ];

    const contents = [
      "I ordered product two weeks ago but haven't received it yet. The tracking shows no movement for 5 days. Please investigate and update me urgently.",
      "The item I received is not what I ordered. I need to return it and get the correct product. How do I proceed with the return?",
      "My credit card was charged twice for the same order. Please refund the duplicate charge immediately and confirm the correction.",
      "I'm unable to login to my account despite using the correct password. The system keeps saying invalid credentials. Please help.",
      "I need detailed specifications for your premium product including dimensions, materials, and compatibility with existing systems.",
      "The product arrived damaged with a broken component. I'm very disappointed and would like a replacement or full refund.",
      "I want to cancel my subscription but can't find the option in my account settings. Please cancel it immediately.",
      "I need to change the delivery address for my order before it ships. The current address is incorrect. Can this be updated?",
      "I haven't received the tracking number for my order placed 5 days ago. When will my package ship and arrive?",
      "The coupon code you sent me isn't working at checkout. It shows as expired but the email says valid until next month.",
      "I registered for your webinar but didn't receive confirmation or joining instructions. The event is tomorrow. Please assist.",
      "I applied for the position two weeks ago and would like to know the status of my application and next steps.",
      "I want to unsubscribe from your promotional emails but the link in the email doesn't work. Please remove me from the list.",
      "What data do you collect and how is it used? I need clarification on your privacy practices before making a purchase.",
      "I need to export all my data from your platform. How can I download a complete copy of my account information?",
      "I'm interested in becoming a reseller of your products. What are the requirements and wholesale pricing structures?",
      "Do you offer corporate accounts with volume discounts? We need to purchase for our 200-employee organization.",
      "I'm interested in your affiliate program. What are the commission rates and how does the payment system work?",
      "Our company would like to sponsor your upcoming event. Please send information about sponsorship packages.",
      "I'm a journalist writing about your industry. Can I interview someone from your leadership team this week?"
    ];

    for (let i = 0; i < 200; i++) {
      const subjectIndex = i % subjects.length;
      const contentIndex = i % contents.length;
      scenarios.push({
        id: i + 1,
        subject: `[Email #${i + 1}] ${subjects[subjectIndex]}`,
        from: `customer${i + 1}@example.com`,
        content: contents[contentIndex],
        guidelines: "Respond professionally, address concerns, provide solution"
      });
    }
    return scenarios;
  };

  const emails = generateEmails();

  const handleSave = (emailId, reply) => {
    if (!reply || reply.trim().length < 50) {
      alert("Reply must be at least 50 characters!");
      return;
    }

    const email = emails.find(e => e.id === emailId);
    const newReply = {
      emailId,
      subject: email.subject,
      originalEmail: email.content,
      reply,
      savedAt: new Date().toISOString()
    };

    setSavedReplies(prev => [...prev, newReply]);
    alert(`Email ${emailId} reply saved!\n\n💡 Complete all emails, download CSV, then submit via Menu → "Submit Your Work"`);
    
    const textarea = document.getElementById(`reply-${emailId}`);
    if (textarea) textarea.value = '';
  };

  const generateCSV = () => {
    let csv = 'Email No,Subject,Original Email,Reply,Saved At\n';
    savedReplies.forEach((item) => {
      const escapeCsv = (str) => `"${String(str).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      csv += `${item.emailId},${escapeCsv(item.subject)},${escapeCsv(item.originalEmail)},${escapeCsv(item.reply)},${escapeCsv(item.savedAt)}\n`;
    });
    return csv;
  };

  const downloadCSV = () => {
    if (savedReplies.length === 0) {
      alert("No replies saved yet!");
      return;
    }

    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-replies-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert(`✅ CSV Downloaded!\n\n📤 Submit via Menu (☰) → "Submit Your Work"`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 text-white p-6 rounded-2xl mb-6 shadow-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => navigate(createPageUrl("Dashboard"))}
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Email Replies</h1>
                <p className="text-blue-100 text-sm">200 Emails • Payment: ₹440</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl">
              <p className="text-xs text-blue-100">Saved Replies</p>
              <p className="text-2xl font-bold">{savedReplies.length}/200</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur rounded-xl">
              <Clock className="w-6 h-6 text-blue-200" />
              <div>
                <p className="text-xs text-blue-200">Time Elapsed</p>
                <p className="text-xl font-bold text-white">{formatTime(elapsedTime)}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-3 backdrop-blur rounded-xl ${remainingTime < 1800 ? 'bg-red-500/30' : 'bg-white/10'}`}>
              <Clock className="w-6 h-6 text-orange-200" />
              <div>
                <p className="text-xs text-orange-200">Time Remaining</p>
                <p className="text-xl font-bold text-white">{formatTime(remainingTime)}</p>
              </div>
            </div>
          </div>

          <Button onClick={downloadCSV} variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-semibold py-4" disabled={savedReplies.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download CSV ({savedReplies.length})
          </Button>
          {savedReplies.length > 0 && (
            <p className="text-xs text-center text-blue-100 mt-2 bg-white/10 px-3 py-2 rounded-lg">
              💡 Submit via Menu (☰) → "Submit Your Work"
            </p>
          )}
        </div>

        <div className="grid gap-6">
          {emails.map((email) => (
            <Card key={email.id} className="shadow-lg hover:shadow-xl transition-all border-2 border-indigo-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                    {email.id}
                  </span>
                  <div className="flex-1">
                    <CardTitle className="text-indigo-900 text-base">
                      📧 {email.subject}
                    </CardTitle>
                    <p className="text-sm text-indigo-600 mt-1">From: {email.from}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4 p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Original Email:</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{email.content}</p>
                </div>
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Guidelines:</p>
                  <p className="text-xs text-blue-600">{email.guidelines}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-700 mb-3">Your Reply:</p>
                  <Textarea
                    id={`reply-${email.id}`}
                    placeholder="Write a professional reply..."
                    className="min-h-44 border-2 border-indigo-300 focus:border-indigo-500 shadow-sm"
                    rows={7}
                  />
                  <Button
                    onClick={() => {
                      const textarea = document.getElementById(`reply-${email.id}`);
                      if (textarea) handleSave(email.id, textarea.value);
                    }}
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold py-6 shadow-lg"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Reply #{email.id}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
