import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRole }) => {
  // Temporarily disabled authentication check for development
  // const user = JSON.parse(localStorage.getItem('user'))
  // if (!user) {
  //   return <Navigate to="/login" replace />
  // }
  // if (allowedRole && user.role !== allowedRole) {
  //   return <Navigate to="/" replace />
  // }

  return children
}

export default ProtectedRoute
