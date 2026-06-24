import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  AlertTriangle, 
  Shield, 
  CreditCard, 
  Ban, 
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Lock,
  Mail
} from "lucide-react";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-gray-900 bg-clip-text text-transparent mb-2">
            📜 WorkDen - Terms & User Agreement
          </h1>
          <p className="text-gray-600">Please read carefully before using WorkDen</p>
        </div>

        {/* Terms & Conditions */}
        <Card className="mb-6 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-gray-800 text-white">
            <CardTitle className="text-2xl">WORKDEN – TERMS & CONDITIONS</CardTitle>
            <p className="text-sm text-gray-300">Terms of Use / Terms of Service | Last Updated: 2025</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-gray-700">
              Welcome to WorkDen ("WorkDen", "we", "our", "us"). These Terms & Conditions ("Terms") govern your access to and use of the WorkDen mobile application, website, and services ("Platform"). By accessing, registering, subscribing, or using the Platform, you agree to these Terms.
            </p>
            <p className="text-gray-700 font-medium">
              If you do not agree, please discontinue use of the Platform.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1) About WorkDen (Platform Purpose)</h3>
                <p className="text-gray-700">
                  WorkDen is a digital platform designed to provide a structured work ecosystem including:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>task/work management tools</li>
                  <li>staff/workforce support tools</li>
                  <li>digital services and subscription-based access</li>
                  <li>updates, notifications, and productivity features</li>
                </ul>
                <p className="text-green-700 font-medium mt-2">
                  ✅ WorkDen aims to create a genuine and user-friendly platform for people who want to work, learn, and grow through performance and consistency.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2) Eligibility (No Strict Age Limit)</h3>
                <p className="text-gray-700">
                  WorkDen services can be used by individuals of all age groups. However, if you are not legally eligible to enter into contracts or make online payments under applicable laws, you should use the Platform under the guidance/consent of a parent or legal guardian.
                </p>
                <p className="text-green-700 font-medium mt-2">
                  ✅ By using WorkDen, you confirm that your usage complies with applicable laws.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">3) User Account & Security</h3>
                <p className="text-gray-700">
                  To use certain features, you may need to create an account. You agree that:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>all information shared during registration must be true and correct</li>
                  <li>you will keep your user ID/password confidential</li>
                  <li>you will not share your account with others</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  WorkDen will always support users, but WorkDen cannot be responsible for misuse caused due to:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>sharing login details</li>
                  <li>device misuse or hacking at user end</li>
                  <li>negligence in account security</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">4) Subscription, Plans & Payments</h3>
                <p className="text-gray-700">
                  Certain features may be available through paid subscriptions. By purchasing a plan:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>you agree to pay applicable fees (including taxes if any)</li>
                  <li>you agree that subscription provides digital service access</li>
                  <li>you understand that features may be updated or improved from time to time</li>
                </ul>
                <p className="text-green-700 font-medium mt-2">
                  ✅ WorkDen works with trusted payment gateway providers to ensure secure transactions.
                </p>
                
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500">
                  <h4 className="font-bold text-red-900 mb-2">4.1 No Refund Policy (Digital Services)</h4>
                  <p className="text-red-800">
                    Since subscriptions provide digital access and services, payments are generally non-refundable. However, genuine issues can be raised to WorkDen support and will be reviewed fairly.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">5) Earnings / Income Disclaimer (Performance Based)</h3>
                <p className="text-gray-700">
                  WorkDen provides a platform to help users work and progress.
                </p>
                <p className="text-green-700 font-medium mt-2">
                  ✅ Users understand that income/earnings (if applicable) depend on:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>user performance</li>
                  <li>skills and learning</li>
                  <li>task quality and completion</li>
                  <li>consistency and dedication</li>
                  <li>availability of platform features</li>
                  <li>compliance with WorkDen guidelines</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  WorkDen does not promise fixed income, but WorkDen is focused on building a system where sincere and consistent users can benefit through their efforts.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">6) Proper Usage & User Responsibilities</h3>
                <p className="text-gray-700">You agree:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>to use WorkDen honestly and respectfully</li>
                  <li>not to misuse task features</li>
                  <li>not to mislead other users or staff</li>
                  <li>to follow guidelines and instructions provided inside the Platform</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  WorkDen may update rules or improve policies to maintain a clean and safe community.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">7) Prohibited Activities</h3>
                <p className="text-gray-700">Users must NOT:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>create fake accounts or impersonate others</li>
                  <li>submit false details or fake proof/screenshots</li>
                  <li>misuse tasks/subscriptions</li>
                  <li>abuse, threaten, harass, or use offensive language</li>
                  <li>attempt hacking, reverse-engineering, scraping</li>
                  <li>copy/reuse WorkDen content, designs, videos, or database</li>
                </ul>
                <p className="text-green-700 font-medium mt-2">
                  ✅ If misuse is detected, WorkDen may suspend access and take appropriate action.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">8) Third-Party Services (Friendly + Trustworthy)</h3>
                <p className="text-gray-700">
                  WorkDen may use trusted third-party services to provide smooth and secure user experience, such as:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>payment gateways (for processing payments)</li>
                  <li>messaging services (SMS/WhatsApp/email notifications)</li>
                  <li>analytics and security tools (to improve performance and prevent misuse)</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  We choose reliable service providers, but since these services are operated by third-party companies, occasional delays, downtime, or technical issues may occur beyond our control.
                </p>
                <p className="text-green-700 font-medium mt-2">
                  ✅ In such cases, WorkDen will provide support and take reasonable steps to resolve issues quickly, but uninterrupted availability of third-party services cannot be guaranteed at all times.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">9) Platform Updates & Maintenance</h3>
                <p className="text-gray-700">To improve user experience, WorkDen may:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>update features</li>
                  <li>modify UI/UX</li>
                  <li>add/remove modules</li>
                  <li>fix bugs and security issues</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  WorkDen may temporarily pause services for maintenance.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">10) Support & Complaints</h3>
                <p className="text-gray-700">If you face issues:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>contact official WorkDen support</li>
                  <li>share valid details (screenshots/order IDs if needed)</li>
                </ul>
                <p className="text-green-700 font-medium mt-2">
                  ✅ WorkDen is committed to resolving genuine complaints fairly.
                </p>
                <p className="text-red-700 font-medium mt-2">
                  ⚠️ False complaints, harassment, or misuse of complaint system may lead to account restrictions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">11) Account Suspension / Termination</h3>
                <p className="text-gray-700">WorkDen may suspend/terminate accounts if:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>user violates terms</li>
                  <li>fraud/misuse is detected</li>
                  <li>user creates disturbance or harms platform integrity</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  WorkDen aims to keep the platform safe for genuine users.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">12) Limitation of Liability (Real Platform Tone)</h3>
                <p className="text-gray-700">
                  WorkDen strives to provide a genuine, stable, and helpful platform. However, as a digital service, there may be situations beyond our control such as internet/network issues, payment gateway delays, scheduled maintenance, or technical glitches.
                </p>
                <p className="text-gray-700 mt-2">
                  To the maximum extent permitted under applicable law, WorkDen will not be responsible for indirect or consequential losses arising due to such events, including loss of opportunity due to downtime, delays caused by third-party services, or data loss caused by device issues or unauthorized access at user end.
                </p>
                <p className="text-green-700 font-medium mt-2">
                  ✅ WorkDen will always make reasonable efforts to maintain service quality and resolve issues quickly.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">13) Intellectual Property</h3>
                <p className="text-gray-700">
                  All content, branding, logo, UI, designs, and system structure belong to WorkDen. No user may copy, reuse, reproduce, resell, or distribute WorkDen materials without written permission.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">14) Governing Law & Jurisdiction</h3>
                <p className="text-gray-700">
                  These Terms are governed by laws of India. All disputes shall be subject to courts of India.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  15) Contact
                </h3>
                <p className="text-blue-800">
                  Support Email: <strong>workdenindia567@gmail.com</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Agreement */}
        <Card className="mb-6 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
            <CardTitle className="text-2xl">WORKDEN – USER AGREEMENT</CardTitle>
            <p className="text-sm text-gray-200">User Consent & Contract | Last Updated: 2026</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-gray-700">
              This User Agreement ("Agreement") is a legal contract between WorkDen ("Company") and the user ("User", "you"). By registering, subscribing, clicking "I Agree", or using the Platform, you accept this Agreement.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1) User Confirmation</h3>
                <p className="text-gray-700">By using WorkDen, you confirm that:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>the information you provide is genuine and accurate</li>
                  <li>you will use the platform responsibly</li>
                  <li>you will follow WorkDen rules and guidelines</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2) User Conduct</h3>
                <p className="text-gray-700">You agree:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>to maintain respectful behaviour on the Platform</li>
                  <li>to not harm WorkDen's community and systems</li>
                  <li>to complete work/tasks honestly (if applicable)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">3) Communication Consent</h3>
                <p className="text-gray-700">You agree that WorkDen may contact you through:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>SMS / WhatsApp</li>
                  <li>email</li>
                  <li>app notifications</li>
                </ul>
                <p className="text-gray-700 mt-2">for:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>account and security alerts</li>
                  <li>subscription updates</li>
                  <li>platform notices</li>
                  <li>important changes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">4) Subscription Consent</h3>
                <p className="text-gray-700">If you purchase any plan, you agree that:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>subscription is for digital access/services</li>
                  <li>payment confirmation may take some time depending on banks/payment gateways</li>
                  <li>misuse/fraudulent payment disputes are strictly prohibited</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">5) Income & Results Understanding</h3>
                <p className="text-green-700 font-medium">
                  ✅ You understand that your results/income depend mainly on your personal skills, performance, consistency, and task quality.
                </p>
                <p className="text-gray-700 mt-2">
                  WorkDen may guide, provide system/features, and improve services, but final results depend on user's effort.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">6) Fraud / Misuse Policy</h3>
                <p className="text-gray-700">If user is found involved in:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                  <li>fake payments</li>
                  <li>chargeback misuse</li>
                  <li>fake complaints</li>
                  <li>fake screenshots/proofs</li>
                  <li>illegal/abusive activity</li>
                </ul>
                <p className="text-gray-700 mt-2">WorkDen may take actions including:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-green-700 space-y-1">
                  <li>✅ account suspension/termination</li>
                  <li>✅ permanent access restriction</li>
                  <li>✅ reporting where legally required</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">7) Agreement Updates</h3>
                <p className="text-gray-700">
                  WorkDen may modify this Agreement to improve services and policies. Continued use means acceptance of the updated version.
                </p>
              </div>

              <div className="p-4 bg-green-50 border-l-4 border-green-500">
                <h3 className="text-lg font-bold text-green-900 mb-2">8) Final Consent</h3>
                <p className="text-green-800">By clicking "I Agree", you confirm that:</p>
                <ul className="list-none ml-4 mt-2 text-green-700 space-y-1">
                  <li>✅ you have read and understood these Terms & User Agreement</li>
                  <li>✅ you accept the rules and responsibilities</li>
                  <li>✅ you will use WorkDen fairly and lawfully</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Agreement Card */}
        <Card className="shadow-xl bg-gradient-to-r from-slate-700 to-gray-800 text-white">
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">Acceptance of Terms & User Agreement</h3>
            <p className="text-gray-300">
              By using WorkDen platform, subscribing to our services, or clicking "I Agree", you acknowledge that you have read, understood, and agree to be bound by all the terms, conditions, and agreements mentioned above.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-400">
                Last updated: January 2026 | WorkDen India
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
