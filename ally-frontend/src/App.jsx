import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
import NavigationBar from './components/NavigationBar'
import MyCasesPage from './pages/MyCasesPage'
import { shouldShowNavigation } from './utils/navigation.js'
import LawyerSettings from './components/LawyerSettings'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler'
import AllyConsultationChat from './components/AllyConsultationChat'
import ClientSecurity from './components/ClientSecurity'

// Custom hook to determine if navigation bar should be visible
const useNavigationVisibility = () => {
  const location = useLocation();
  return shouldShowNavigation(location.pathname);
};

function AppContent() {
  const showNavigation = useNavigationVisibility();
  
  return (
    <>
      <NavigationBar />
      <div className={showNavigation ? "pt-[104px]" : ""}>
        <Routes>

        <Route path="/oauth2-redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/client" element={<ClientRegistrationForm />} />
        <Route path="/signup/lawyer" element={<LawyerRegistrationForm />} />        
        <Route path="/signup/verifyClient" element={<VerifyClient/>} />
        <Route path="/signup/verifyLawyer" element={<VerifyLawyer/>} />
        <Route path="/login" element={<Login />} />          
        <Route path="/lawyers" element={<LawyerDirectoryPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/my-cases" element={<MyCasesPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/documents/:caseId" element={<DocumentsPage />} />
        <Route path="/settings" element={<AccountSettings />} />
        <Route path="/settings/security" element={<ClientSecurity />} />
        <Route path="/lawyer-settings" element={<LawyerSettings />} />
        <Route path="/consult" element={<AllyConsultationChat />} />
                  {/* Chat Routes */}
          <Route path="/chat" element={<ChatContainer />} />
          <Route path="/messages/:chatroomId" element={<ChatContainer />} />


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
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
