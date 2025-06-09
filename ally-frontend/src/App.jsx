import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import SignUpPage from './pages/SignupPage'
import ClientRegistrationForm from './components/ClientRegistrationForm'
import LawyerRegistrationForm from './components/LawyerRegistrationForm'
import VerifyLawyer from './components/VerifyLawyer'
import Login from './components/Login'
import Admin from './pages/Admin'
import AdminDashboard from './components/AdminDashboard'
import UserManagement from './pages/UserManagement'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import SettingsDashboard from './components/SettingsDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { LawyerDirectoryPage } from './pages/LawyerDirectoryPage'
import DocumentSubmission from './components/DocumentSubmission'
import AccountSettings from './components/AccountSettings'
import ChatContainer from './components/ChatContainer'
import NavigationBar from './components/NavigationBar'
import MyCasesPage from './pages/MyCasesPage'
import { shouldShowNavigation } from './utils/navigation.js'
import LawyerSettings from './components/LawyerSettings'

// Custom hook to determine if navigation bar should be visible
const useNavigationVisibility = () => {
  const location = useLocation();
  return shouldShowNavigation(location.pathname);
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/client" element={<ClientRegistrationForm />} />
        <Route path="/signup/lawyer" element={<LawyerRegistrationForm />} />        
        <Route path="/signup/lawyer/verify-lawyer" element={<VerifyLawyer />} />
        <Route path="/login" element={<Login />} />          
        <Route path="/lawyers" element={<LawyerDirectoryPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/my-cases" element={<MyCasesPage />} />
        <Route path="/documents" element={<DocumentSubmission />} />
        <Route path="/settings" element={<AccountSettings />} />
        <Route path="/chat" element={<ChatContainer />} />
        <Route path="/lawyer-settings" element={<LawyerSettings />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="settings" element={<SettingsDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
