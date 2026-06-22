/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AboutUs from './pages/AboutUs';
import Feedback from './pages/Feedback';
import AdminPanel from './pages/AdminPanel';
import Analytics from './pages/Analytics';
import Articles from './pages/Articles';
import CaptchaFilling from './pages/CaptchaFilling';
import Chat from './pages/Chat';
import ChatSupport from './pages/ChatSupport';
import CopyPaste from './pages/CopyPaste';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import DownloadFiles from './pages/DownloadFiles';
import EarningProof from './pages/EarningProof';
import EbookTyping from './pages/EbookTyping';
import EmailQuestions from './pages/EmailQuestions';
import EmailReplies from './pages/EmailReplies';
import EnglishHindiTranslation from './pages/EnglishHindiTranslation';
import FormFilling from './pages/FormFilling';
import Gamification from './pages/Gamification';
import GrammarCorrection from './pages/GrammarCorrection';
import Guidelines from './pages/Guidelines';
import HelpTickets from './pages/HelpTickets';
import Holidays from './pages/Holidays';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Notifications from './pages/Notifications';
import PdfToWordTyping from './pages/PdfToWordTyping';
import Profile from './pages/Profile';
import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterDashboardView from './pages/RecruiterDashboardView';
import RecruiterLogin from './pages/RecruiterLogin';
import RecruiterPortal from './pages/RecruiterPortal';
import Referral from './pages/Referral';
import ReferralPartner from './pages/ReferralPartner';
import Referrals from './pages/Referrals';
import RoleManagement from './pages/RoleManagement';
import SavedWork from './pages/SavedWork';
import Settings from './pages/Settings';
import SubmittedWork from './pages/SubmittedWork';
import Support from './pages/Support';
import SupportHistory from './pages/SupportHistory';
import TaskWorkspace from './pages/TaskWorkspace';
import Tasks from './pages/Tasks';
import TermsConditions from './pages/TermsConditions';
import TrainingModule from './pages/TrainingModule';
import TranscriptionAudioToText from './pages/TranscriptionAudioToText';
import UserDetailPage from './pages/UserDetailPage';
import UserLogin from './pages/UserLogin';
import UserSignup from './pages/UserSignup';
import Wallet from './pages/Wallet';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "Feedback": Feedback,
    "AdminPanel": AdminPanel,
    "Analytics": Analytics,
    "Articles": Articles,
    "CaptchaFilling": CaptchaFilling,
    "Chat": Chat,
    "ChatSupport": ChatSupport,
    "CopyPaste": CopyPaste,
    "Dashboard": Dashboard,
    "DataEntry": DataEntry,
    "DownloadFiles": DownloadFiles,
    "EarningProof": EarningProof,
    "EbookTyping": EbookTyping,
    "EmailQuestions": EmailQuestions,
    "EmailReplies": EmailReplies,
    "EnglishHindiTranslation": EnglishHindiTranslation,
    "FormFilling": FormFilling,
    "Gamification": Gamification,
    "GrammarCorrection": GrammarCorrection,
    "Guidelines": Guidelines,
    "HelpTickets": HelpTickets,
    "Holidays": Holidays,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "Notifications": Notifications,
    "PdfToWordTyping": PdfToWordTyping,
    "Profile": Profile,
    "RecruiterDashboard": RecruiterDashboard,
    "RecruiterDashboardView": RecruiterDashboardView,
    "RecruiterLogin": RecruiterLogin,
    "RecruiterPortal": RecruiterPortal,
    "Referral": Referral,
    "ReferralPartner": ReferralPartner,
    "Referrals": Referrals,
    "RoleManagement": RoleManagement,
    "SavedWork": SavedWork,
    "Settings": Settings,
    "SubmittedWork": SubmittedWork,
    "Support": Support,
    "SupportHistory": SupportHistory,
    "TaskWorkspace": TaskWorkspace,
    "Tasks": Tasks,
    "TermsConditions": TermsConditions,
    "TrainingModule": TrainingModule,
    "TranscriptionAudioToText": TranscriptionAudioToText,
    "UserDetailPage": UserDetailPage,
    "UserSignup": UserSignup,
    "Wallet": Wallet,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};