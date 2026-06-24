import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, X, Minimize2, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
        setMessages([{
          role: 'bot',
          content: `🤖 Welcome to WorkDen – Complete Guidelines & Information

Hi 👋
I'm your WorkDen AI Assistant. I'm here to help you with tasks, subscription, payments, ID verification, withdrawals, and everything related to the platform.
Please read the complete information below carefully 👇

⏰ WORKING HOURS & APPROVAL TIMINGS

🕗 Working Time: 8:00 AM – 11:30 PM (Daily)
📝 Task Approval Time: 7:00 PM – 10:00 PM
💰 Withdrawal Approval Time: 8:00 PM – 11:00 PM
⏳ Withdrawal Processing Time: 2–3 Hours Only
🆔 ID Card Generation & Verification: 7:00 PM – 10:00 PM
🎓 Training Approval: Within 4 hours of booking

💳 SUBSCRIPTION SYSTEM (₹700 One-Time)

🔓 One-time ₹700 subscription unlocks ALL tasks on the platform.

Payment Process:
1️⃣ Pay via QR Code
2️⃣ Fill payment form with Name, Mobile Number, Email, Transaction ID
3️⃣ Upload payment screenshot (optional)
4️⃣ Admin verifies and activates your account within 24 hours

✅ After activation, all tasks become available instantly

Ask me anything about tasks, payments, login, or any feature! 💬`,
          timestamp: new Date()
        }]);
      }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      const prompt = `You are WorkDen AI Assistant - the complete A-Z guide for WorkDen work-from-home platform in India.
You must help users with EVERYTHING about the app - subscription, tasks, payments, training, withdrawals, login, profile, guidelines, and more.

      USER QUESTION: ${userInput}

      🤖 COMPLETE WORKDEN GUIDELINES:

      ⏰ WORKING HOURS & APPROVAL TIMINGS

      🕗 Working Time: 8:00 AM – 11:30 PM (Daily)
      📝 Task Approval Time: 7:00 PM – 10:00 PM
      💰 Withdrawal Approval Time: 8:00 PM – 11:00 PM
      ⏳ Withdrawal Processing Time: 2–3 Hours Only
      🆔 ID Card Generation & Verification: 7:00 PM – 10:00 PM
      🎓 Training Approval: Within 4 hours of booking

      💳 SUBSCRIPTION SYSTEM (₹700 One-Time)

      🔓 One-time ₹700 subscription unlocks ALL tasks on the platform

      Payment Process:
      1️⃣ Pay via QR Code
      2️⃣ Fill payment form with:
         • Name
         • Mobile Number
         • Email
         • Transaction ID
      3️⃣ Upload payment screenshot (optional)
      4️⃣ Admin verifies and activates your account within 24 hours

      ✅ After activation, all tasks become available instantly
      
      📌 COMPLETE GUIDELINES & TIMINGS:

      ⏰ Working Time: 8:00 AM to 11:30 PM daily
      📝 Task Approving Time: 7:00 PM to 10:00 PM
      💰 Withdrawal Approval Time: 8:00 PM to 11:00 PM (Processing: 2-3 Hours Only)
      🆔 ID Card Generation & Distribution Time: 7:00 PM to 10:00 PM
      🎓 Training Approval Time: Within 4 hours of your booking
      
      💳 SUBSCRIPTION SYSTEM:
      • One-time ₹700 subscription unlocks ALL tasks
      • Pay via QR code, then fill the payment form with Name, Mobile, Email, Transaction ID
      • You can also upload payment screenshot
      • Admin will verify and activate within 24 hours
      • After subscription, all tasks become available
      
      ⏱️ TASK TIMER & LOCK SYSTEM:
      • Each task has 8 HOURS countdown timer
      • If you leave task after starting, it gets LOCKED for 24 hours
      • You can retry the task after 24 hours lock period
      • Complete tasks within the time limit to avoid issues
      
      🔐 LOGIN SYSTEM:
      • After signup, you receive User ID and User Password from admin
      • Enter these credentials on the login screen to access the app
      • Contact HR/Recruiter via WhatsApp or Email to get your credentials

      🆔 ID CARD UPLOADING GUIDELINES (STEP-BY-STEP):
      1. Upload a clear photo of your ID card (Aadhar/PAN/License) to Google Drive
      2. Tap the three dots (⋮) on the uploaded file
      3. Go to "Manage Access"
      4. Select "Anyone with the link can view"
      5. Open Workden App
      6. Go to My Profile → ID Card Section
      7. Paste the Google Drive link
      8. Your ID card upload will be successful

      📤 TASK SUBMISSION GUIDELINES (STEP-BY-STEP):
      1. Complete your task
      2. Click on the "Download CSV" button at the top of your task to download the CSV file
      3. Upload this CSV file to Google Drive
      4. Tap the three dots (⋮) and open "Manage Access"
      5. Select "Anyone with the link can view"
      6. Open the Workden App
      7. Go to Three Lines → "Submit Your Work"
      8. Select your task
      9. Paste your Google Drive CSV link
      10. Click Submit
      11. Your task will be successfully submitted

      COMPLETE PLATFORM INFORMATION:

      📌 AVAILABLE WORK TYPES & UPDATED PAYMENTS

      💼 Work Types & Earnings:
      • Copy-Paste Work – ₹350
      • Data Entry – ₹450
      • Form Filling – ₹400
      • Article Writing – ₹250
      • E-Book Typing – ₹390
      • Email Replies – ₹390
      • English-Hindi Translation – ₹410
      • Grammar Correction – ₹310
      • PDF to Word Conversion – ₹390
      • Captcha Filling – ₹300
      • Chat Support – ₹400
      • Email Questions – ₹430

      💰 Earnings are credited directly to your wallet after approval

      ⏰ TIMINGS:
      • Working Time: 8:00 AM to 11:30 PM daily
      • Task Approval: 7:00 PM to 10:00 PM
      • Withdrawal Approval: 8:00 PM to 11:00 PM
      • ID Card Verification: 7:00 PM to 10:00 PM
      • Training Approval: Within 4 hours

      💰 PAYMENT & WALLET:
      • Minimum Withdrawal: ₹1,000
      • Payment Time: 2-3 hours only via bank transfer (Fast processing!)
      • All earnings go to wallet automatically
      • Withdrawal fee: FREE

      📱 APP FEATURES:
      • Dashboard - View stats, wallet, recent tasks
      • Tasks - Browse & start available work
      • Submitted Work - Track your submissions
      • Wallet - Check balance & request withdrawal
      • Profile - Update details, upload ID card
      • Leaderboard - See top performers
      • Guidelines - Working hours & processes
      • Download Files - Get important work files from admin
      • Training Module - Access training (if admin enabled)
      • Chat with Admin - Direct support
      • Notifications - Stay updated
      • Referrals - Share & earn
      • Support - Help center

      🔐 ACCOUNT ACTIVATION:
      • Upload ID card (Aadhar/PAN/License) via Google Drive link
      • Admin verifies within 24 hours
      • Account becomes active after verification
      • Then you can access all tasks

      HOW TO SUBMIT WORK:
      1. Complete your task and download the CSV file
      2. Upload CSV to Google Drive
      3. Make it shareable (Anyone with link can view)
      4. Copy the shareable link
      5. Click Menu (☰) button → "Submit Your Work"
      6. Select your task, paste Google Drive link, and submit
      7. Wait for admin approval

      HOW TO VERIFY ID CARD (STEP-BY-STEP):
      1. Take a CLEAR PHOTO of your ID card (Aadhar/PAN/Driving License)
      2. Open Google Drive (app or drive.google.com)
      3. Click + (Plus) button and select "Upload"
      4. Select and upload your ID card photo
      5. After upload, click 3 dots (...) on the photo
      6. Click "Share" or "Get Link" option
      7. In "General access" select "Anyone with the link"
      8. Keep permission as "Viewer"
      9. Click "Copy link" to copy the link
      10. Open WorkDen app and go to Profile page
      11. Paste the link in "ID Card Verification" field
      12. Click "Save" button
      13. Admin will verify within 24 hours and activate your account ✅

      IMPORTANT: Link must be properly shareable, private links will not work!

      WALLET PASSWORD:
      • Users can set a password to protect their wallet
      • Go to Menu (☰) → Settings → Wallet Security
      • Set or change your wallet password
      • You'll need this password to view your wallet balance

      🎯 HOW TO USE APP:
      • Three Lines Menu (☰) - Access all sections
      • Bottom Navigation - Quick access to Dashboard, Tasks, Wallet, Profile
      • AI Chatbot (purple button) - Ask me anything
      • Admin Chat (blue button) - Direct admin support

      🎓 TRAINING MODULE:
      • Admin adds training video links for each task type
      • Users with training access can view all videos
      • Videos cover: How to complete tasks, upload ID, submit work, guidelines
      • Contact admin to get training access enabled
      
      📱 APP FEATURES A-Z:
      • Dashboard - View stats, wallet, recent tasks
      • Tasks - Browse & start available work (requires subscription)
      • Submitted Work - Track your submissions
      • Wallet - Check balance & request withdrawal
      • Profile - Update details, upload ID card
      • Leaderboard - See top performers
      • Guidelines - Working hours & processes
      • Download Files - Get important work files from admin
      • Training Module - Access training videos
      • Chat with Admin - Direct support
      • Notifications - Stay updated
      • Support - Help center
      • Apply for ID Card - Get your WorkDen ID

      ANSWER GUIDELINES:
      - Answer in clear English with emojis (NO star symbols like * or **)
      - Be super helpful, detailed, and friendly
      - Give complete step-by-step instructions with emojis
      - Provide specific information about work types, timings, amounts
      - If user asks about any feature, explain it fully with how to access it
      - Help with subscription process, payment, task completion, everything A-Z
      - Always encourage them and be motivating
      - Explain 8 hour timer and 24 hour lock system clearly
      - Use emojis throughout but NO markdown symbols like asterisks

      Now answer in a detailed, helpful, conversational way with emojis:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" }
          }
        }
      });

      if (response?.answer && typeof response.answer === 'string' && response.answer.length > 10) {
        const botMessage = { 
          role: 'bot', 
          content: response.answer, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("AI Error:", error);
      const fallbackAnswer = getFallbackAnswer(userInput);
      const fallbackMessage = { 
        role: 'bot', 
        content: fallbackAnswer.needsTicket ? 
          `${fallbackAnswer.message}\n\n🎫 Need more help? Raise a Help Ticket!\n\nGo to Menu (☰) → Help Tickets\nOr click the button below to raise a ticket directly.` : 
          fallbackAnswer.message, 
        timestamp: new Date(),
        showTicketButton: fallbackAnswer.needsTicket
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackAnswer = (question) => {
    const q = question.toLowerCase();
    
    if (q.includes('submit') || q.includes('how') || q.includes('upload')) {
      return { 
        message: '📤 How to Submit Work:\n\n1. Complete your task and download file\n2. Upload file to Google Drive\n3. Make link shareable (Anyone with link can view)\n4. Go to Menu (☰) → Submit Your Work\n5. Select task, paste Drive link\n6. Click Submit button\n\nAdmin will approve within 24 hours! ✅',
        needsTicket: false
      };
    }
    
    if (q.includes('id') || q.includes('verify') || q.includes('activate') || q.includes('kyc')) {
      return {
        message: '🆔 ID Card Upload Step-by-Step:\n\n1️⃣ Take a CLEAR photo of your ID card (from Workden)\n2️⃣ Open Google Drive\n3️⃣ Tap + (Plus) button → Upload\n4️⃣ Upload the photo\n5️⃣ Tap 3 dots (⋮) on photo\n6️⃣ Select Share or Get Link\n7️⃣ Enable Anyone with the link can view\n8️⃣ Keep permission as Viewer\n9️⃣ Click Copy link\n🔟 Open WorkDen → My Profile → ID Card Section\n1️⃣1️⃣ Paste link\n1️⃣2️⃣ Click Save\n\n✅ Admin will verify within 24 hours!\n\n⚠️ Link must be properly shareable!',
        needsTicket: false
      };
    }
    
    if (q.includes('payment') || q.includes('money') || q.includes('withdraw')) {
      return {
        message: '💰 Payment & Wallet:\n\n• Minimum Withdrawal: ₹1,000\n• Payment Time: 2-3 hours only\n• Payment Mode: Bank Transfer Only\n• Withdrawal Fee: FREE\n• All earnings go to wallet automatically\n\n💡 Check wallet balance on Dashboard! ✅',
        needsTicket: false
      };
    }
    
    if (q.includes('subscription') || q.includes('subscribe') || q.includes('unlock') || q.includes('700')) {
      return {
        message: '💳 Subscription Process (₹700 One-Time):\n\n1️⃣ Go to Tasks page\n2️⃣ Click on any locked task or Subscribe Now\n3️⃣ Scan QR code and pay ₹700\n4️⃣ Click I have Made the Payment\n5️⃣ Fill form: Name, Mobile, Email, Transaction ID\n6️⃣ Upload payment screenshot (optional)\n7️⃣ Submit and wait for admin approval\n8️⃣ All tasks unlock after approval! ✅\n\n💡 One-time payment unlocks ALL tasks!',
        needsTicket: false
      };
    }
    
    if (q.includes('timer') || q.includes('time limit') || q.includes('8 hour') || q.includes('lock') || q.includes('24 hour')) {
      return {
        message: '⏱️ Timer & Lock System:\n\n⏳ Each task has 8 HOURS countdown timer\n🔒 If you leave a task after starting:\n   • Task gets LOCKED for 24 hours\n   • You can retry the same task after 24 hours\n\n⚠️ Always complete your task within the time limit to avoid issues!',
        needsTicket: false
      };
    }
    
    if (q.includes('login') || q.includes('user id') || q.includes('password') || q.includes('credential')) {
      return {
        message: '🔐 LOGIN SYSTEM:\n\n🆔 After signup, you will receive:\n   • User ID\n   • User Password\n\n📩 These credentials are shared by Admin / HR / Recruiter via WhatsApp or Email\n\n➡️ Enter the credentials on the login screen to access the WorkDen app\n\n📧 Contact: workdenindia567@gmail.com',
        needsTicket: false
      };
    }
    
    if (q.includes('task') || q.includes('work')) {
      return {
        message: '💼 Available Tasks & Payments:\n\n• Copy-Paste Work – ₹350\n• Data Entry – ₹450\n• Form Filling – ₹400\n• Article Writing – ₹250\n• E-Book Typing – ₹390\n• Email Replies – ₹390\n• English-Hindi Translation – ₹410\n• Grammar Correction – ₹310\n• PDF to Word – ₹390\n• Captcha Filling – ₹300\n• Chat Support – ₹400\n• Email Questions – ₹430\n\n⏰ Each task has 8 HOURS timer\n⚠️ If you leave task midway, it locks for 24 hours',
        needsTicket: false
      };
    }
    
    return {
      message: '🤔 I could not understand your question completely.',
      needsTicket: true
    };
  };

  if (!isOpen) {
    return (
      <>
        {/* Desktop - AI Chatbot Floating Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="hidden lg:flex fixed bottom-[200px] right-4 h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 z-40 items-center justify-center transition-all"
          size="icon"
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>

        {/* Mobile - AI Chatbot (Top Right) */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-3 right-3 z-[60] hover:bg-purple-50 h-10 w-10 rounded-full"
        >
          <Bot className="w-5 h-5 text-purple-600" />
        </Button>
      </>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 w-[90vw] max-w-sm h-[480px] shadow-2xl z-[45] flex flex-col bg-white rounded-2xl overflow-hidden border-2 border-purple-200">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-6 h-6" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Assistant</h3>
              <Badge variant="secondary" className="text-xs bg-green-400 text-white px-2 py-0">
                ● Always Online
              </Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20 h-8 w-8" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-purple-50 to-pink-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className="flex flex-col gap-2">
                <div className={`p-3 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-white border border-purple-200'}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.showTicketButton && msg.role === 'bot' && (
                  <a href={createPageUrl("HelpTickets")} target="_blank">
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 w-full">
                      🎫 Raise Help Ticket
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-purple-200 p-4 rounded-2xl shadow-md">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={loading}
            className="flex-1 rounded-full border-purple-300 focus:border-purple-500"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || loading} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
