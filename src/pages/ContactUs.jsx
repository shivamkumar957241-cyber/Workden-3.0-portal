import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Mail, Send, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

const TelegramIcon = () => (
  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const faqs = [
  { q: "How do I submit my work?", a: "Go to the sidebar and click 'Submit Tasks'. Select your task, upload your work file to Google Drive, make it shareable, and paste the link. Click Submit Work." },
  { q: "When will my task be approved?", a: "Tasks are typically reviewed within 24-48 hours. You'll receive a notification once approved or rejected." },
  { q: "What happens if my task is rejected?", a: "You'll receive a notification with the rejection reason. Review the feedback, correct your work, and resubmit." },
  { q: "Is copy-paste allowed in tasks?", a: "Copy-paste is only allowed in the 'Copy-Paste Work' task type. Other tasks must be completed independently." },
  { q: "How does the subscription refund work?", a: "Subscription fees are non-refundable once the account is activated. Please contact support for special cases." },
  { q: "How can I earn through referrals?", a: "Share your referral link from the Referral section. When your referred user completes tasks, you earn referral bonuses." },
  { q: "Where can I download task-related files?", a: "Go to 'Download Work File' in the sidebar to download task files assigned to you by admin." },
  { q: "How can I contact support for help?", a: "Use this Contact Us page to email us or reach out via Telegram. You can also submit a support ticket from the Support section." },
  { q: "Can my account be suspended?", a: "Yes, accounts can be suspended for violations of our terms of service, including submitting fake work or fraudulent activities." },
];

export default function ContactUs() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.mobile || !form.subject || !form.message) {
      alert("⚠️ Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const userId = localStorage.getItem('workden_login_id') || 'guest';
      await base44.entities.HelpTicket.create({
        user_id: userId,
        user_name: form.name,
        user_email: form.email,
        user_phone: form.mobile,
        subject: form.subject,
        message: form.message,
        description: form.message,
        status: "open",
      });
      setSubmitted(true);
      setForm({ name: "", email: "", mobile: "", subject: "", message: "" });
    } catch (err) {
      alert("❌ Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6 pb-28">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center pt-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Contact Us</h1>
          </div>
          <p className="text-gray-500 text-sm">We're here to help you succeed</p>
        </div>

        {/* Social Media Links */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">Follow Us on Social Media</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
            <a href="https://www.facebook.com/people/Workden-India/61583820256534/" target="_blank" rel="noopener noreferrer">
              <Card className="border-2 border-blue-300 hover:shadow-lg transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FacebookIcon />
                  </div>
                  <p className="font-bold text-sm text-gray-900">Facebook</p>
                </CardContent>
              </Card>
            </a>
            <a href="https://www.instagram.com/workden_wfh" target="_blank" rel="noopener noreferrer">
              <Card className="border-2 border-pink-300 hover:shadow-lg transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <InstagramIcon />
                  </div>
                  <p className="font-bold text-sm text-gray-900">Instagram</p>
                </CardContent>
              </Card>
            </a>
            <a href="https://www.linkedin.com/in/workden-india-315391383/" target="_blank" rel="noopener noreferrer">
              <Card className="border-2 border-sky-300 hover:shadow-lg transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <LinkedInIcon />
                  </div>
                  <p className="font-bold text-sm text-gray-900">LinkedIn</p>
                </CardContent>
              </Card>
            </a>
            <a href="https://t.me/+f_s3cLM1WwYxNjE1" target="_blank" rel="noopener noreferrer">
              <Card className="border-2 border-cyan-300 hover:shadow-lg transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TelegramIcon />
                  </div>
                  <p className="font-bold text-sm text-gray-900">Telegram</p>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>

        {/* Support Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="mailto:support@workden.online">
            <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Email Support</p>
                  <p className="text-xs text-indigo-600">support@workden.online</p>
                </div>
              </CardContent>
            </Card>
          </a>
          <a href="mailto:info@workden.online">
            <Card className="border-2 border-blue-200 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">More Information</p>
                  <p className="text-xs text-blue-600">info@workden.online</p>
                </div>
              </CardContent>
            </Card>
          </a>
          <a href="https://t.me/workden567" target="_blank" rel="noopener noreferrer">
            <Card className="border-2 border-cyan-200 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 bg-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TelegramIcon />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Trainer Support</p>
                  <p className="text-xs text-cyan-600">@workden567</p>
                </div>
              </CardContent>
            </Card>
          </a>
          <a href="https://t.me/tripathi_anshikaaaaa" target="_blank" rel="noopener noreferrer">
            <Card className="border-2 border-purple-200 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TelegramIcon />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Query Support</p>
                  <p className="text-xs text-purple-600">@tripathi_anshikaaaaa</p>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" /> Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <Card key={i} className="border border-gray-200 overflow-hidden">
                <button
                  className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-sm text-gray-800">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-indigo-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-gray-600 bg-indigo-50 border-t border-indigo-100">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Send Query Form */}
        <Card className="border-2 border-indigo-200 shadow-lg">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-t-xl flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">Send a Query</h2>
          </div>
          <CardContent className="p-5">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-xl font-bold text-green-700 mb-1">Query Submitted!</p>
                <p className="text-gray-500 text-sm mb-4">We'll get back to you soon.</p>
                <Button onClick={() => setSubmitted(false)} className="bg-indigo-600">Send Another Query</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input placeholder="Enter your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Registered Email *</Label>
                  <Input type="email" placeholder="Enter your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label>Mobile Number *</Label>
                  <Input placeholder="Enter your mobile number" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
                </div>
                <div>
                  <Label>Subject *</Label>
                  <Input placeholder="Enter subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div>
                  <Label>Message *</Label>
                  <Textarea placeholder="Describe your query in detail" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-11">
                  {submitting ? "Submitting..." : <><Send className="w-4 h-4 mr-2" />Submit Query</>}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}