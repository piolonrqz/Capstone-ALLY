import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Shield, Users, FileOutput, Trash2 } from 'lucide-react';
import Section from './shared/Section';
import InputField from './shared/InputField';
import NavigationBar from './NavigationBar';

// Accept user prop from AccountSettings
const LawyerSettings = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Initialize state from user prop
  const [profile, setProfile] = useState({
    name:
      user?.fullName ||
      `${user?.firstName || user?.Fname || ''} ${user?.lastName || user?.Lname || ''}`.trim() ||
      'Lawyer',
    title: 'Lawyer',
    location: user?.location || user?.city || '',
  });

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || user?.Fname || '',
    lastName: user?.lastName || user?.Lname || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    experience: user?.experience || '',
    barNumber: user?.barNumber || '',
    bio: user?.bio || '',
  });

  const [address, setAddress] = useState({
    line1: user?.address || '',
    province: user?.province || '',
    zipCode: user?.zipCode || user?.zip || '',
    cityState: user?.cityState || user?.city || '',
  });

  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState(null);

  // Optionally, update state if user prop changes
  useEffect(() => {
    if (!user) {
      setError(null); // Don't show error immediately, just show loading
      setLoading(true);
      return;
    }
    setProfile({
      name:
        user?.fullName ||
        `${user?.firstName || user?.Fname || ''} ${user?.lastName || user?.Lname || ''}`.trim() ||
        'Lawyer',
      title: 'Lawyer',
      location: user?.location || user?.city || '',
    });
    setPersonalInfo({
      firstName: user?.firstName || user?.Fname || '',
      lastName: user?.lastName || user?.Lname || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      experience: user?.experience || '',
      barNumber: user?.barNumber || '',
      bio: user?.bio || '',
    });
    setAddress({
      line1: user?.address || '',
      province: user?.province || '',
      zipCode: user?.zipCode || user?.zip || '',
      cityState: user?.cityState || user?.city || '',
    });
    setError(null);
    setLoading(false);
  }, [user]);

  // Remove sidebar and just render the settings content as a component
  if (loading) {
    return (
      <>
        <NavigationBar />
        {location.pathname !== '/lawyer-settings' && (
          <div className="flex justify-end w-full max-w-4xl mx-auto mt-4">
            <button
              className="px-4 py-2 mb-2 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
              onClick={() => navigate('/lawyer-settings')}
            >
              Go to Lawyer Settings
            </button>
          </div>
        )}
        <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
          <div className="flex items-center justify-center py-20">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <span className="ml-3 text-gray-600">Loading your profile...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavigationBar />
        {location.pathname !== '/lawyer-settings' && (
          <div className="flex justify-end w-full max-w-4xl mx-auto mt-4">
            <button
              className="px-4 py-2 mb-2 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
              onClick={() => navigate('/lawyer-settings')}
            >
              Go to Lawyer Settings
            </button>
          </div>
        )}
        <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
          <div className="container max-w-5xl px-4 py-8 mx-auto">
            <div className="p-6 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      {location.pathname !== '/lawyer-settings' && (
        <div className="flex justify-end w-full max-w-4xl mx-auto mt-4">
          <button
            className="px-4 py-2 mb-2 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
            onClick={() => navigate('/lawyer-settings')}
          >
            Go to Lawyer Settings
          </button>
        </div>
      )}
      <div className="w-full max-w-4xl p-8 pt-16 mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Account Settings</h1>

        {/* Profile Section */}
        <Section title="My Profile">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
              <span className="text-xl font-semibold text-blue-600">
                {(
                  (personalInfo.firstName?.charAt(0) || '') +
                  (personalInfo.lastName?.charAt(0) || '')
                ).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{profile.name}</h4>
              <p className="text-gray-600">{profile.title}</p>
              <p className="text-gray-500">{profile.location}</p>
            </div>
          </div>
        </Section>

        {/* Personal Information */}
        <Section title="Personal Information">
          <div className="grid grid-cols-2 gap-6">
            <InputField label="First Name" value={personalInfo.firstName} />
            <InputField label="Last Name" value={personalInfo.lastName} />
            <InputField label="Email address" value={personalInfo.email} />
            <InputField label="Phone" value={personalInfo.phone} />
            <InputField label="Experience" value={personalInfo.experience} />
            <InputField label="Bar Number" value={personalInfo.barNumber} />
          </div>
        </Section>

        {/* Address */}
        <Section title="Address">
          <div className="grid grid-cols-2 gap-6">
            <InputField label="Address Line 1" value={address.line1} />
            <InputField label="Province" value={address.province} />
            <InputField label="ZIP Code" value={address.zipCode} />
            <InputField label="City/State" value={address.cityState} />
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
    </>
  );
};

export default LawyerSettings;