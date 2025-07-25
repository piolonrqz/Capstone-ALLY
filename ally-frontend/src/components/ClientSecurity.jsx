import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Shield, Trash2, Bell, Lock, Eye, EyeOff } from 'lucide-react';
import Section from './shared/Section';
import InputField from './shared/InputField';

const ClientSecurity = ({ user }) => {
  const location = useLocation();
  const path = location.pathname;
  const token = localStorage.getItem('token');

  // Password change states
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isLoading: false,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const handlePasswordChange = async () => {
    if (!passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    if (passwordChange.newPassword.length < 8) {
      alert('New password must be at least 8 characters long.');
      return;
    }

    if (passwordChange.currentPassword === passwordChange.newPassword) {
      alert('New password must be different from current password.');
      return;
    }

    setPasswordChange(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('http://localhost:8080/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordChange({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          isLoading: false,
          showCurrentPassword: false,
          showNewPassword: false,
          showConfirmPassword: false
        });
        alert('Password changed successfully!');
      } else {
        alert(`Password change failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('Password change failed. Please try again.');
    } finally {
      setPasswordChange(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 flex flex-col w-64 h-screen bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <Link to="/">
            <img src="/small_logo.png" alt="ALLY Logo" className="h-8 cursor-pointer" />
          </Link>
        </div>
        <nav className="flex flex-col justify-between flex-1">
          <ul className="mt-6">
            <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/settings' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
              <Link to="/settings" className={`flex items-center ${path === '/settings' ? 'text-blue-600' : 'text-gray-700'}`}>
                <User className="w-5 h-5 mr-3" />
                <span className={path === '/settings' ? 'font-medium' : ''}>My Profile</span>
              </Link>
            </li>
            <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/settings/security' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
              <Link to="/settings/security" className={`flex items-center ${path === '/settings/security' ? 'text-blue-600' : 'text-gray-700'}`}>
                <Shield className="w-5 h-5 mr-3" />
                <span className={path === '/settings/security' ? 'font-medium' : ''}>Security</span>
              </Link>
            </li>
            <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/settings/notifications' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
              <Link to="/settings/notifications" className={`flex items-center ${path === '/settings/notifications' ? 'text-blue-600' : 'text-gray-700'}`}>
                <Bell className="w-5 h-5 mr-3" />
                <span className={path === '/settings/notifications' ? 'font-medium' : ''}>Notifications</span>
              </Link>
            </li>
          </ul>
          <ul className="mb-6">
            <li className={`mx-2 px-4 py-3 rounded-lg hover:bg-red-50`}>
              <Link to="/settings/delete-account" className="flex items-center text-red-600">
                <Trash2 className="w-5 h-5 mr-3" />
                <span>Delete Account</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-2xl font-bold text-gray-800">Security Settings</h1>

          {/* Change Password Section */}
          <Section title="Change Password">
            <div className="space-y-4">
              <div className="relative">
                <InputField
                  label="Current Password"
                  type={passwordChange.showCurrentPassword ? "text" : "password"}
                  value={passwordChange.currentPassword}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordChange(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {passwordChange.showCurrentPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <InputField
                  label="New Password"
                  type={passwordChange.showNewPassword ? "text" : "password"}
                  value={passwordChange.newPassword}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordChange(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {passwordChange.showNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <InputField
                  label="Confirm New Password"
                  type={passwordChange.showConfirmPassword ? "text" : "password"}
                  value={passwordChange.confirmPassword}
                  onChange={(e) => setPasswordChange(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordChange(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {passwordChange.showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Password Requirements:</strong>
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  <li>At least 8 characters long</li>
                  <li>Must be different from current password</li>
                  <li>Recommended: Include uppercase, lowercase, numbers, and special characters</li>
                </ul>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={passwordChange.isLoading}
                className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordChange.isLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </Section>

          {/* Security Tips */}
          <Section title="Security Tips">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Keep Your Account Secure</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use a strong, unique password for your account</li>
                  <li>• Don't share your login credentials with anyone</li>
                  <li>• Regularly update your password</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Footer */}
          <footer className="pt-8 mt-12 border-t border-gray-200">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded">
                  <span className="font-bold text-white">A</span>
                </div>
                <div>
                  <h5 className="text-lg font-semibold text-gray-800">ALLY</h5>
                  <p className="max-w-md text-sm text-gray-500">Making legal help accessible to everyone through our innovative platform that connects clients with qualified legal professionals and AI.</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ClientSecurity;