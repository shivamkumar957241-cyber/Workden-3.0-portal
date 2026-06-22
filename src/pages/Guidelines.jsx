import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  FileText, 
  Upload, 
  CreditCard, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  HelpCircle
} from "lucide-react";

export default function Guidelines() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    base44.entities.Task.list().then(setTasks).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            📋 WorkDen Guidelines
          </h1>
          <p className="text-gray-600">Complete guide to using WorkDen platform</p>
        </div>

        {/* Working Hours */}
        <Card className="mb-6 shadow-xl border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Clock className="w-6 h-6" />
              ⏰ Working Hours & Timings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4 p-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg">
              <h3 className="font-bold text-indigo-900 mb-2 text-lg">📅 Working Days</h3>
              <p className="text-xl font-bold text-indigo-700">Monday to Saturday</p>
              <p className="text-sm text-red-600 font-semibold mt-1">⛔ Sunday: Non-working day (OFF)</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <h3 className="font-bold text-blue-900 mb-2">⏰ Tasks Active Time</h3>
                <p className="text-2xl font-bold text-blue-700">9:00 AM - 11:30 PM</p>
                <p className="text-sm text-blue-600">Tasks can only be started during these hours</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2">Task Approval</h3>
                <p className="text-2xl font-bold text-green-700">7:00 PM - 10:00 PM</p>
                <p className="text-sm text-green-600">Admin reviews submissions</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-bold text-purple-900 mb-2">Withdrawal Approval</h3>
                <p className="text-2xl font-bold text-purple-700">8:00 PM - 11:00 PM</p>
                <p className="text-sm text-purple-600">Payment processing time</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-bold text-orange-900 mb-2">ID Verification</h3>
                <p className="text-2xl font-bold text-orange-700">7:00 PM - 10:00 PM</p>
                <p className="text-sm text-orange-600">Account activation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Submission */}
        <Card className="mb-6 shadow-xl border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Upload className="w-6 h-6" />
              📤 How to Submit Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Badge className="bg-green-600 w-8 h-8 flex items-center justify-center rounded-full">1</Badge>
                <div>
                  <h4 className="font-bold">Complete Your Task</h4>
                  <p className="text-sm text-gray-600">Finish all the work assigned to you within the time limit</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-green-600 w-8 h-8 flex items-center justify-center rounded-full">2</Badge>
                <div>
                  <h4 className="font-bold">Download File</h4>
                  <p className="text-sm text-gray-600">Click the "Download File" button at the top of your task page</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-green-600 w-8 h-8 flex items-center justify-center rounded-full">3</Badge>
                <div>
                  <h4 className="font-bold">Upload to Google Drive</h4>
                  <p className="text-sm text-gray-600">Upload the downloaded file to your Google Drive</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-green-600 w-8 h-8 flex items-center justify-center rounded-full">4</Badge>
                <div>
                  <h4 className="font-bold">Make Link Shareable</h4>
                  <p className="text-sm text-gray-600">Click 3 dots → Manage Access → Anyone with the link can view</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-green-600 w-8 h-8 flex items-center justify-center rounded-full">5</Badge>
                <div>
                  <h4 className="font-bold">Submit in App</h4>
                  <p className="text-sm text-gray-600">Go to Menu → Submit Your Work → Paste link → Submit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ID Verification */}
        <Card className="mb-6 shadow-xl border-l-4 border-l-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <CreditCard className="w-6 h-6" />
              🆔 ID Card Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Your account must be verified before you can start working. 
                  You need to submit the ID card provided by WorkDen.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <p className="text-sm">Take a clear photo of your ID card</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <p className="text-sm">Upload to Google Drive</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <p className="text-sm">Set access to "Anyone with the link can view"</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <p className="text-sm">Go to Profile → Paste the link in ID Card section</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <p className="text-sm">Admin will verify within 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="mb-6 shadow-xl border-l-4 border-l-teal-500">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-teal-900">
              <Shield className="w-6 h-6" />
              💰 Payment & Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-teal-50 rounded-lg">
                <h3 className="font-bold text-teal-900 mb-2">Minimum Withdrawal</h3>
                <p className="text-2xl font-bold text-teal-700">₹500</p>
                <p className="text-sm text-teal-600">Minimum amount to withdraw</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <h3 className="font-bold text-cyan-900 mb-2">Processing Time</h3>
                <p className="text-2xl font-bold text-cyan-700">2-3 Hours</p>
                <p className="text-sm text-cyan-600">Fast bank transfer</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">Withdrawal Fee</h3>
                <p className="text-2xl font-bold text-blue-700">FREE</p>
                <p className="text-sm text-blue-600">No charges on withdrawal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Types */}
        <Card className="mb-6 shadow-xl border-l-4 border-l-orange-500">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <FileText className="w-6 h-6" />
              💼 Available Work Types
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {tasks.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {tasks.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded-lg border">
                    <p className="font-medium text-gray-900">{task.name}</p>
                    {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Loading available tasks...</p>
            )}
          </CardContent>
        </Card>

        {/* Activity Monitoring */}
        <Card className="mb-6 shadow-xl border-l-4 border-l-indigo-500">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Shield className="w-6 h-6" />
              🔍 Activity Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-sm text-indigo-800">
                <strong>Note:</strong> All user activities are monitored to ensure fair work practices and platform security.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                <p className="text-sm"><strong>Session Tracking:</strong> Your login sessions and active time are recorded</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                <p className="text-sm"><strong>Task Progress:</strong> Time spent on each task is tracked</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                <p className="text-sm"><strong>Task Timer:</strong> Each task has 8 hours time limit</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                <p className="text-sm"><strong>IP Logging:</strong> Login locations are monitored for security</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                <p className="text-sm"><strong>Copy-Paste Disabled:</strong> Except for Copy-Paste task pages</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                <p className="text-sm"><strong>Right-Click Disabled:</strong> To protect platform content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Start Process */}
        <Card className="mb-6 shadow-xl border-l-4 border-l-cyan-500">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <CardTitle className="flex items-center gap-2 text-cyan-900">
              <Clock className="w-6 h-6" />
              🚀 "I'm Starting The Task" Feature
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <h3 className="font-bold text-cyan-900 mb-2">How Task Starting Works:</h3>
                <ol className="text-sm text-cyan-800 space-y-2 list-decimal list-inside">
                  <li><strong>Preview Mode:</strong> First you'll see task details (read-only)</li>
                  <li><strong>Click "I'm Starting The Task":</strong> This enables input and starts 8-hour countdown</li>
                  <li><strong>Timer Starts:</strong> You have exactly 8 hours to complete</li>
                  <li><strong>No Going Back:</strong> Once started, leaving will lock task until tomorrow 9:00 AM</li>
                </ol>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Make sure you have enough time before clicking "I'm Starting The Task". 
                    Once clicked, the countdown begins and you cannot pause or go back.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="shadow-xl border-l-4 border-l-red-500">
          <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-6 h-6" />
              ⚠️ Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>8 Hour Time Limit:</strong> Each task must be completed within 8 hours of clicking "I'm Starting The Task"
                </p>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Time-Based Lock:</strong> Tasks are active only between 9:00 AM and 11:30 PM. If you start a task and leave it incomplete, you will be able to continue the task only on the next day between 9:00 AM and 11:30 PM.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Copy-Paste Disabled:</strong> Paste is blocked on all tasks except Copy-Paste Work. You must type manually.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Google Drive Link:</strong> Must be set to "Anyone with the link can view" or submission will be rejected
                </p>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>ID Verification:</strong> Account must be verified before withdrawing money
                </p>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Quality Work:</strong> Low quality submissions may be rejected
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}