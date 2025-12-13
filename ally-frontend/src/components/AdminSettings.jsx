import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Bell, Menu, ChevronDown } from 'lucide-react';
import Section from './shared/Section';
import InputField from './shared/InputField';
import { userService } from '../services/userService';
import { toast } from 'react-toastify';
import useCurrentUser from '../hooks/useCurrentUser';

const AdminSettings = ({ user, onMenuClick }) => {
  const location = useLocation();
  const path = location.pathname;
  const profilePhoto = localStorage.getItem('profilePhoto');
  const token = localStorage.getItem('token');
  const { currentUser, loading: userLoading } = useCurrentUser();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize state from user prop
  const [profile, setProfile] = useState({
    name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin',
    title: 'Admin',
    location: user?.location || user?.city || '',
  });

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
  });

  const [address, setAddress] = useState({
    line1: user?.address || '',
    province: user?.province || '',
    zipCode: user?.zipCode || user?.zip || '',
    cityState: user?.cityState || user?.city || '',
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/getUser/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        // Update the profile state with the fetched data
        setProfile({
          name: `${data.Fname} ${data.Lname}`,
        });
        console.log('Profile data:', data);

        setPersonalInfo(prev => ({
          ...prev,
          firstName: data.Fname,
          lastName: data.Lname,
          email: data.email,
          phone: data.phoneNumber || '',
        }));
      })
      .catch(error => {
        console.error('Failed to fetch user:', error);
        toast.error('Failed to load user data');
      });
  }, [user.id, token]);

  const handleUpdate = async () => {
    const updatedUserData = {
      ...personalInfo,
      ...address,
      phoneNumber: personalInfo.phone,
      address: address.line1,
      province: address.province,
      zip: address.zipCode,
      Fname: personalInfo.firstName,
      Lname: personalInfo.lastName,
      city: address.cityState,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/adminUpdate/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedUserData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Update failed.');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Something went wrong.');
    }
  };

  // Handler for profile photo change
  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { storage } = await import('../firebase/config');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const storageRef = ref(storage, `profile_pictures/${user.id}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      localStorage.setItem('profilePhoto', url);
      window.location.reload();
    } catch (err) {
      toast.error('Failed to upload profile photo.');
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="fixed top-0 left-0 flex flex-col w-64 h-screen bg-white border-r border-gray-200">
        <div className="flex items-center gap-2 p-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/small_logo.png" alt="ALLY Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold text-blue-600">Admin Portal</span>
          </Link>
        </div>
        <nav className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex flex-col flex-1 pt-5">
            <div className="px-3">
              <h2 className="mb-2 px-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Settings</h2>
              <div className="space-y-1">
                <Link
                  to="/admin/settings"
                  className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg group"
                >
                  <Settings className="flex-shrink-0 w-5 h-5 mr-3" />
                  Account Settings
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between h-full px-4">
            {/* Left Section: Mobile Menu */}
            <div className="flex items-center">
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-600 lg:hidden hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Right Section: Notifications + Profile */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-50 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm text-gray-800">New lawyer verification request</p>
                        <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {userLoading ? 'A' : currentUser?.name?.[0] || 'A'}
                  </div>
                  <div className="ml-3 pr-2">
                    <h2 className="text-sm font-semibold text-gray-800">
                      {userLoading ? 'Loading...' : currentUser?.name || 'Admin'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {userLoading ? '' : currentUser?.accountType?.toUpperCase() || 'ADMIN'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <Link
                      to="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Account Settings
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content with padding for header */}
        <div className="pt-16 px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">Account Settings</h1>

            {/* Profile Section */}
            <Section title="My Profile">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-blue-100 rounded-full">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-blue-600">
                        {(
                          (personalInfo.firstName?.charAt(0) || '') +
                          (personalInfo.lastName?.charAt(0) || '')
                        ).toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="ml-4 font-semibold text-gray-800">{profile.name}</h4>
                  </div>
                </div>
                <div>
                  <input
                    id="profile-photo-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleProfilePhotoChange}
                  />
                  <button
                    className="px-4 py-3 mb-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    onClick={() => document.getElementById('profile-photo-input').click()}
                    type="button"
                  >
                    Change Profile
                  </button>
                </div>
              </div>
            </Section>

            {/* Personal Information */}
            <Section title="Personal Information">
              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                />
                <InputField
                  label="Last Name"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                />
                <InputField
                  label="Email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                />
                <InputField
                  label="Phone"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                />
              </div>
            </Section>

            {/* Address */}
            <Section title="Address">
              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Address Line 1"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                />
                <InputField
                  label="Province"
                  value={address.province}
                  onChange={(e) => setAddress({ ...address, province: e.target.value })}
                />
                <InputField
                  label="ZIP Code"
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                />
                <InputField
                  label="City/State"
                  value={address.cityState}
                  onChange={(e) => setAddress({ ...address, cityState: e.target.value })}
                />
              </div>
            </Section>

            <div className="mt-6">
              <button
                onClick={handleUpdate}
                className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Update Profile
              </button>
            </div>

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
    </div>
  );
};

export default AdminSettings; 