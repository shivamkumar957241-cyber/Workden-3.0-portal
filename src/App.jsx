import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { TaskLockProvider } from '@/lib/TaskLockContext'
import VisualEditAgent from '@/lib/VisualEditAgent'
import { pagesConfig } from './pages.config'
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import CreateUser from './pages/CreateUser';
import Feedback from './pages/Feedback';
import UserLogin from './pages/UserLogin';
import DataEntry from './pages/DataEntry';
import FormFilling from './pages/FormFilling';
import GrammarCorrection from './pages/GrammarCorrection';
import ChatSupport from './pages/ChatSupport';
import EbookTyping from './pages/EbookTyping';
import PdfToWordTyping from './pages/PdfToWordTyping';
import Typing from './pages/Typing';
import CaptchaFilling from './pages/CaptchaFilling';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ContactUs from './pages/ContactUs';
import SupportTickets from './pages/SupportTickets';


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#ffebee', color: '#c62828', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Frontend Crash Detected</h2>
          <p style={{ marginBottom: '20px' }}>An error occurred during rendering. Please copy this error and share it.</p>
          <div style={{ background: '#fff', padding: '15px', border: '1px solid #ef5350', overflowX: 'auto' }}>
            <strong>{this.state.error?.toString()}</strong>
            <br />
            <pre style={{ marginTop: '10px', fontSize: '12px' }}>{this.state.errorInfo?.componentStack}</pre>
          </div>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClientInstance}>
      <TaskLockProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <LayoutWrapper currentPageName={mainPageKey}>
              <MainPage />
            </LayoutWrapper>
          } />
          {Object.entries(Pages).map(([path, Page]) => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              }
            />
          ))}
          <Route path="/CreateUser" element={<LayoutWrapper currentPageName="CreateUser"><CreateUser /></LayoutWrapper>} />
          <Route path="/Feedback" element={<LayoutWrapper currentPageName="Feedback"><Feedback /></LayoutWrapper>} />
          <Route path="/DataEntry" element={<LayoutWrapper currentPageName="DataEntry"><DataEntry /></LayoutWrapper>} />
          <Route path="/FormFilling" element={<LayoutWrapper currentPageName="FormFilling"><FormFilling /></LayoutWrapper>} />
          <Route path="/GrammarCorrection" element={<LayoutWrapper currentPageName="GrammarCorrection"><GrammarCorrection /></LayoutWrapper>} />
          <Route path="/ChatSupport" element={<LayoutWrapper currentPageName="ChatSupport"><ChatSupport /></LayoutWrapper>} />
          <Route path="/EbookTyping" element={<LayoutWrapper currentPageName="EbookTyping"><EbookTyping /></LayoutWrapper>} />
          <Route path="/PdfToWordTyping" element={<LayoutWrapper currentPageName="PdfToWordTyping"><PdfToWordTyping /></LayoutWrapper>} />
          <Route path="/Typing" element={<LayoutWrapper currentPageName="Typing"><Typing /></LayoutWrapper>} />
          <Route path="/CaptchaFilling" element={<LayoutWrapper currentPageName="CaptchaFilling"><CaptchaFilling /></LayoutWrapper>} />
          <Route path="/RecruiterDashboard" element={<RecruiterDashboard />} />
          <Route path="/ContactUs" element={<LayoutWrapper currentPageName="ContactUs"><ContactUs /></LayoutWrapper>} />
          <Route path="/SupportTickets" element={<LayoutWrapper currentPageName="SupportTickets"><SupportTickets /></LayoutWrapper>} />
          <Route path="/UserLogin" element={<UserLogin />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
      <Toaster />
      <VisualEditAgent />
      </TaskLockProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
