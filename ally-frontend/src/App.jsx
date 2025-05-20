import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import SignUpPage from './pages/SignupPage'
import ClientRegistrationForm from './components/ClientRegistrationForm'
import LawyerRegistrationForm from './components/LawyerRegistrationForm'
import VerifyLawyer from './components/VerifyLawyer'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/client" element={<ClientRegistrationForm />} />
        <Route path="/signup/lawyer" element={<LawyerRegistrationForm />} />
        <Route path="/signup/lawyer/verify-lawyer" element={<VerifyLawyer />} />
      </Routes>
    </Router>
  )
}

export default App;