import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import './App.css'
import LandingPage from './pages/LandingPage'
import SignUpPage from './pages/SignupPage'
import ClientRegistrationForm from './components/ClientRegistrationForm'
import LawyerRegistrationForm from './components/LawyerRegistrationForm'
import VerifyClient from './components/VerifyClient'
import VerifyLawyer from './components/VerifyLawyer'
import Login from './components/Login'
import Admin from './pages/Admin'
import DashboardOverview from './components/DashboardOverview'
import LawyerVerification from './components/LawyerVerification'
import UserManagement from './pages/UserManagement'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import SettingsDashboard from './components/SettingsDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { LawyerDirectoryPage } from './pages/LawyerDirectoryPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import DocumentsPage from './pages/DocumentsPage'
import AccountSettings from './components/AccountSettings'
import ChatContainer from './components/ChatContainer'
import MyCasesPage from './pages/MyCasesPage'
import LawyerSettings from './components/LawyerSettings'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler'
import AllyConsultationChat from './components/AllyConsultationChat'
import ClientSecurity from './components/ClientSecurity'
import { SidebarProvider } from './contexts/SidebarContext'
import PageLayout from './components/PageLayout.jsx'
import { validateAndGetAuthData } from './utils/auth.jsx'
import NotFound from './pages/NotFound'

const LayoutRoutes = () => (
  <PageLayout>
    <Outlet />
  </PageLayout>
)

function AppContent() {
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      setIsValidating(true);
      
      // Only validate if there's a token in localStorage
      const token = localStorage.getItem('token');
      if (token) {
        await validateAndGetAuthData();
      }
      
      setIsValidating(false);
    };

    validateAuth();
  }, []);

  // Show loading screen while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div>
        <Routes>
          <Route path="/oauth2-redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signup/client" element={<ClientRegistrationForm />} />
          <Route path="/signup/lawyer" element={<LawyerRegistrationForm />} />        
          <Route path="/signup/verifyClient" element={<VerifyClient/>} />
          <Route path="/signup/verifyLawyer" element={<VerifyLawyer/>} />
          <Route path="/login" element={<Login />} />          
          <Route element={<LayoutRoutes />}>
            <Route path="/lawyers" element={<ProtectedRoute><LawyerDirectoryPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><ChatContainer /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
            <Route path="/my-cases" element={<ProtectedRoute><MyCasesPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/:caseId" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
            <Route path="/settings/security" element={<ProtectedRoute><ClientSecurity /></ProtectedRoute>} />
            <Route path="/lawyer-settings" element={<ProtectedRoute><LawyerSettings /></ProtectedRoute>} />
            <Route path="/consult" element={<ProtectedRoute><AllyConsultationChat /></ProtectedRoute>} />
          </Route>
          {/* Chat Routes */}
          <Route path="/chat" element={<ProtectedRoute><ChatContainer /></ProtectedRoute>} />
          <Route path="/messages/:chatroomId" element={<ProtectedRoute><ChatContainer /></ProtectedRoute>} />


          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <Admin />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="verification" element={<LawyerVerification />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="settings" element={<SettingsDashboard />} />     
          </Route>

          {/* 404 Catch-All Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <SidebarProvider>
        <Toaster position="top-center" richColors />
        <AppContent />
      </SidebarProvider>
    </Router>
  );
}

export default App
