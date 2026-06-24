import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, MapPin, FileText, Shield, Target, Eye, Users, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AboutUs() {
  const [showGSTDialog, setShowGSTDialog] = useState(false);
  const [showMSMEDialog, setShowMSMEDialog] = useState(false);

  const convertDriveUrl = (url) => {
    if (!url) return "";
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  const gstCertUrl = convertDriveUrl("https://drive.google.com/file/d/1ldPjwehoVHyyL1wgqiCb7csXwQBJ_-c5/view");
  const msmeCertUrl = convertDriveUrl("https://drive.google.com/file/d/1TReHTCmWvwlVbJmD_Ff_wncueyDJJEPR/view");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Building2 className="w-10 h-10 text-indigo-600" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              About WorkDen
            </h1>
          </div>
          <p className="text-gray-600">A trusted digital task facilitation platform</p>
        </div>

        <div className="space-y-6">
          {/* Company Overview */}
          <Card className="border-2 border-blue-300 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 border-b-2 border-blue-200">
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                WorkDen is a verified digital platform designed to help users access genuine work-from-home opportunities. We provide a structured system where individuals can manage tasks, track earnings, and grow professionally through a transparent and user-friendly approach.
              </p>
            </CardContent>
          </Card>

          {/* Purpose */}
          <Card className="border-2 border-green-300 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-200">
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Our Purpose
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                To create a safe, transparent, and accessible platform for people who want to work remotely, earn genuine income, and improve their skills through structured digital tasks and professional guidance.
              </p>
            </CardContent>
          </Card>

          {/* How WorkDen Works */}
          <Card className="border-2 border-purple-300 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b-2 border-purple-200">
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                How WorkDen Works
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="text-gray-700 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Registration:</strong> Users sign up and complete profile setup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Task Access:</strong> Subscription provides access to various earning tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Work Submission:</strong> Users complete and submit tasks following guidelines</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Quality Check:</strong> Admin reviews submissions for accuracy and completeness</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Payment:</strong> Approved tasks are credited to wallet for withdrawal</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-orange-300 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 border-b-2 border-orange-200">
                <CardTitle className="text-orange-900 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  To empower individuals by providing legitimate remote work opportunities with transparent operations, fair rewards, and continuous support for skill development.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-teal-300 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-teal-100 to-cyan-100 border-b-2 border-teal-200">
                <CardTitle className="text-teal-900 flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  To become India's most trusted digital platform for remote work, known for integrity, user satisfaction, and sustainable earning opportunities.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Why Choose WorkDen */}
          <Card className="border-2 border-pink-300 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-100 to-rose-100 border-b-2 border-pink-200">
              <CardTitle className="text-pink-900 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Why Choose WorkDen?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-2">✅ Verified Business</h4>
                  <p className="text-sm text-gray-700">Legally registered with MSME & GST compliance</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-gray-900 mb-2">💰 Transparent Payments</h4>
                  <p className="text-sm text-gray-700">Clear reward structure and timely wallet credits</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-2">📚 Training Support</h4>
                  <p className="text-sm text-gray-700">Step-by-step guidance for all task types</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
                  <h4 className="font-bold text-gray-900 mb-2">🛡️ Secure Platform</h4>
                  <p className="text-sm text-gray-700">Data protection and account security measures</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust & Compliance */}
          <Card className="border-2 border-indigo-300 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b-2 border-indigo-200">
              <CardTitle className="text-indigo-900 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Commitment to Trust and Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                WorkDen operates with full transparency and adheres to legal standards. We maintain proper business registrations and comply with Indian government regulations. Your trust is our priority, and we are committed to maintaining the highest standards of professionalism.
              </p>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card className="border-2 border-gray-400 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-100 to-slate-100 border-b-2 border-gray-300">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Company Name</h4>
                <p className="text-gray-700">WorkDen</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">Website</h4>
                <p className="text-blue-600 font-medium">www.workden.online</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-700" />
                  Official Email Communication
                </h4>
                <div className="space-y-1">
                  <p className="text-gray-700"><strong>Support:</strong> support@workden.online</p>
                  <p className="text-gray-700"><strong>Info:</strong> info@workden.online</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-700" />
                  Office Addresses
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">Office 1</p>
                    <p className="text-sm text-gray-700 mt-1">Ashok Nagar, MG Road,</p>
                    <p className="text-sm text-gray-700">Bangalore, Karnataka, India – 560001</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">Office 2</p>
                    <p className="text-sm text-gray-700 mt-1">Parsuram Pur, Motihari,</p>
                    <p className="text-sm text-gray-700">Bihar, India – 845416</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-700" />
                  Business Registrations
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div 
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setShowGSTDialog(true)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-900">GST Certificate</p>
                        <p className="text-xs text-green-700">Click to view</p>
                      </div>
                    </div>
                    <p className="font-mono text-sm text-gray-800 bg-white p-2 rounded border-2 border-green-200">GSTIN: 10KEJPM6504N1Z7</p>
                  </div>

                  <div 
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setShowMSMEDialog(true)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">MSME Certificate</p>
                        <p className="text-xs text-blue-700">Click to view</p>
                      </div>
                    </div>
                    <p className="font-mono text-sm text-gray-800 bg-white p-2 rounded border-2 border-blue-200">MSME (Udyam): UDYAM-KR-03-0640514</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* GST Certificate Dialog */}
      <Dialog open={showGSTDialog} onOpenChange={setShowGSTDialog}>
        <DialogContent className="max-w-4xl h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              GST Certificate
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full">
            <iframe
              src={gstCertUrl}
              className="w-full h-full rounded-lg border-2 border-gray-300"
              frameBorder="0"
              title="GST Certificate"
              allow="autoplay"
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>

      {/* MSME Certificate Dialog */}
      <Dialog open={showMSMEDialog} onOpenChange={setShowMSMEDialog}>
        <DialogContent className="max-w-4xl h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              MSME Certificate
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full">
            <iframe
              src={msmeCertUrl}
              className="w-full h-full rounded-lg border-2 border-gray-300"
              frameBorder="0"
              title="MSME Certificate"
              allow="autoplay"
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
