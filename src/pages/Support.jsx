import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  HelpCircle, 
  Mail, 
  Send,
  FileQuestion,
  ArrowRight,
  Loader2,
  CheckCircle,
  Phone,
  MapPin
} from "lucide-react";

export default function Support() {
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('workden_3_user');
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch(e) {}
    }
  }, []);

  const [queryFormData, setQueryFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    subject: "",
    message: ""
  });
  const [callFormData, setCallFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    address: "",
    subject: "",
    issue: ""
  });
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [submittingCall, setSubmittingCall] = useState(false);
  const [querySubmitted, setQuerySubmitted] = useState(false);
  const [callSubmitted, setCallSubmitted] = useState(false);
  const [showCallForm, setShowCallForm] = useState(false);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    
    if (!queryFormData.fullName || !queryFormData.email || !queryFormData.mobile || !queryFormData.subject || !queryFormData.message) {
      alert("⚠️ Please fill all fields");
      return;
    }

    setSubmittingQuery(true);
    try {
      await base44.entities.HelpTicket.create({
        user_id: currentUser?.id || "",
        user_name: queryFormData.fullName,
        user_email: queryFormData.email,
        user_phone: queryFormData.mobile,
        subject: queryFormData.subject,
        description: queryFormData.message,
        message: queryFormData.message,
        status: "open"
      });

      setQuerySubmitted(true);
      setTimeout(() => {
        setQueryFormData({ fullName: "", email: "", mobile: "", subject: "", message: "" });
        setQuerySubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Query submission error:", error);
      alert("❌ Failed to submit query. Please try again.");
    } finally {
      setSubmittingQuery(false);
    }
  };

  const handleCallSubmit = async (e) => {
    e.preventDefault();
    
    if (!callFormData.fullName || !callFormData.mobile || !callFormData.subject || !callFormData.issue) {
      alert("⚠️ Please fill all required fields");
      return;
    }

    setSubmittingCall(true);
    try {
      await base44.entities.CallRequest.create({
        user_id: currentUser?.id || "",
        full_name: callFormData.fullName,
        mobile: callFormData.mobile,
        email: callFormData.email,
        address: callFormData.address,
        subject: callFormData.subject,
        issue: callFormData.issue,
        status: "pending"
      });

      setCallSubmitted(true);
      setTimeout(() => {
        setCallFormData({ fullName: "", email: "", mobile: "", address: "", subject: "", issue: "" });
        setCallSubmitted(false);
        setShowCallForm(false);
      }, 3000);
    } catch (error) {
      console.error("Call request error:", error);
      alert("❌ Failed to submit request. Please try again.");
    } finally {
      setSubmittingCall(false);
    }
  };

  const faqs = [
    {
      question: "How do I submit my work?",
      answer: "You can submit your completed tasks from the Submit Tasks section after following the given instructions."
    },
    {
      question: "When will my task be approved?",
      answer: "Task approval depends on quality checks. Approval timelines may vary based on task volume."
    },
    {
      question: "What happens if my task is rejected?",
      answer: "If a task does not meet the required guidelines, it may be rejected. Repeated low-quality submissions can affect your account."
    },
    {
      question: "Is copy-paste allowed in tasks?",
      answer: "No. Copy-paste or automated submissions are strictly not allowed and may lead to account restrictions."
    },
    {
      question: "How does the subscription refund work?",
      answer: "If you complete 30 approved tasks within 30 days from subscription activation, the subscription amount will be refunded to your wallet."
    },
    {
      question: "How can I earn through referrals?",
      answer: "You can earn ₹100 per successful referral by sharing your referral link with new users."
    },
    {
      question: "Where can I download task-related files?",
      answer: "All task-related files are available in the Downloads section."
    },
    {
      question: "How can I contact support for help?",
      answer: "You can contact us via email or Telegram from the support options provided above."
    },
    {
      question: "Can my account be suspended?",
      answer: "Yes. Violation of guidelines, fake work, or misuse of the platform may lead to suspension."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <HelpCircle className="w-10 h-10 text-indigo-600" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Help & Support
            </h1>
          </div>
          <p className="text-gray-600">We're here to help you succeed</p>
        </div>

        {/* Support Contact Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <a 
            href="mailto:support@workden.online"
            className="block"
          >
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Email Support</h3>
                    <p className="text-sm text-blue-700 font-medium">support@workden.online</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>

          <a 
            href="mailto:info@workden.online"
            className="block"
          >
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">More Information</h3>
                    <p className="text-sm text-green-700 font-medium">info@workden.online</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>

          <a 
            href="https://t.me/workden567"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                    <Send className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Trainer Support</h3>
                    <p className="text-sm text-purple-700 font-medium">@workden567</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>

          <a 
            href="https://t.me/tripathi_anshikaaaaa"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-xl transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                    <Send className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Query Support</h3>
                    <p className="text-sm text-orange-700 font-medium">@tripathi_anshikaaaaa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* FAQs */}
        <Card className="mb-8 border-2 border-indigo-300 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b-2 border-indigo-200">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <FileQuestion className="w-6 h-6" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details key={index} className="group border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors rounded-lg">
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ArrowRight className="w-5 h-5 text-indigo-500 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="p-4 pt-2 text-gray-700 text-sm border-t-2 border-gray-200 bg-gray-50">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Request a Call Button */}
        {!showCallForm && (
          <Card className="mb-6 border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
            <CardContent className="p-6 text-center">
              <Phone className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Need a Call from Our Team?</h3>
              <p className="text-gray-700 mb-4">Get personalized support over a phone call</p>
              <Button
                onClick={() => setShowCallForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
              >
                <Phone className="w-5 h-5 mr-2" />
                Request a Call
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Request a Call Form */}
        {showCallForm && (
          <Card className="mb-6 border-2 border-green-300 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-200">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Phone className="w-6 h-6" />
                Request a Call
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {callSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Call Request Submitted!</h3>
                  <p className="text-gray-600">Our team will contact you soon.</p>
                  <Button 
                    onClick={() => setShowCallForm(false)}
                    variant="outline"
                    className="mt-4"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCallSubmit} className="space-y-4">
                  <div>
                    <Label className="text-gray-900">Full Name *</Label>
                    <Input
                      value={callFormData.fullName}
                      onChange={(e) => setCallFormData({...callFormData, fullName: e.target.value})}
                      placeholder="Enter your full name"
                      required
                      className="border-2 border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900">Mobile Number *</Label>
                    <Input
                      type="tel"
                      value={callFormData.mobile}
                      onChange={(e) => setCallFormData({...callFormData, mobile: e.target.value})}
                      placeholder="Enter your mobile number"
                      required
                      className="border-2 border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900">Email Address</Label>
                    <Input
                      type="email"
                      value={callFormData.email}
                      onChange={(e) => setCallFormData({...callFormData, email: e.target.value})}
                      placeholder="Enter your email (optional)"
                      className="border-2 border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900">Address</Label>
                    <Textarea
                      value={callFormData.address}
                      onChange={(e) => setCallFormData({...callFormData, address: e.target.value})}
                      placeholder="Enter your address (optional)"
                      rows={2}
                      className="border-2 border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900">Subject *</Label>
                    <Input
                      value={callFormData.subject}
                      onChange={(e) => setCallFormData({...callFormData, subject: e.target.value})}
                      placeholder="What is this call about?"
                      required
                      className="border-2 border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900">Issue / Message *</Label>
                    <Textarea
                      value={callFormData.issue}
                      onChange={(e) => setCallFormData({...callFormData, issue: e.target.value})}
                      placeholder="Describe your issue in detail"
                      rows={4}
                      required
                      className="border-2 border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCallForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submittingCall}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {submittingCall ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Request a Call'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Support Query Form */}
        <Card className="border-2 border-purple-300 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b-2 border-purple-200">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <MessageCircle className="w-6 h-6" />
              Send a Query
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {querySubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Query Submitted Successfully!</h3>
                <p className="text-gray-600">Our support team will contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleQuerySubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-900">Full Name *</Label>
                  <Input
                    value={queryFormData.fullName}
                    onChange={(e) => setQueryFormData({...queryFormData, fullName: e.target.value})}
                    placeholder="Enter your full name"
                    required
                    className="border-2 border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div>
                  <Label className="text-gray-900">Registered Email *</Label>
                  <Input
                    type="email"
                    value={queryFormData.email}
                    onChange={(e) => setQueryFormData({...queryFormData, email: e.target.value})}
                    placeholder="Enter your email"
                    required
                    className="border-2 border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div>
                  <Label className="text-gray-900">Mobile Number *</Label>
                  <Input
                    type="tel"
                    value={queryFormData.mobile}
                    onChange={(e) => setQueryFormData({...queryFormData, mobile: e.target.value})}
                    placeholder="Enter your mobile number"
                    required
                    className="border-2 border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div>
                  <Label className="text-gray-900">Subject *</Label>
                  <Input
                    value={queryFormData.subject}
                    onChange={(e) => setQueryFormData({...queryFormData, subject: e.target.value})}
                    placeholder="Enter subject"
                    required
                    className="border-2 border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div>
                  <Label className="text-gray-900">Message *</Label>
                  <Textarea
                    value={queryFormData.message}
                    onChange={(e) => setQueryFormData({...queryFormData, message: e.target.value})}
                    placeholder="Describe your query in detail"
                    rows={5}
                    required
                    className="border-2 border-purple-200 focus:border-purple-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submittingQuery}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                >
                  {submittingQuery ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Query'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
