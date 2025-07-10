import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Shield, Trash2, Bell } from 'lucide-react';
import Section from './shared/Section';
import InputField from './shared/InputField';

const ClientSettings = ({ user }) => {
  // Initialize state from user prop
  const [profile, setProfile] = useState({
    name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Client',
    title: 'Client',
    location: user?.location || user?.city || '',
  });

  // State for selected profile photo file and preview
  const [selectedProfileFile, setSelectedProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const profilePhoto = localStorage.getItem('profilePhoto');
  const token = localStorage.getItem('token');

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    bio: user?.bio || '',
  });

  const [address, setAddress] = useState({
    line1: user?.address || '',
    province: user?.province || '',
    zipCode: user?.zipCode || user?.zip || '',
    cityState: user?.cityState || user?.city || '',
  });

  const location = useLocation();
  const path = location.pathname;

  // Fetch user data on component mount
  useEffect(() => {
    fetch(`http://localhost:8080/users/getUser/${user.id}`, {
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
          title: 'Client',
          location: user?.location || user?.city || '',
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
      });
  }, [user.id, token]);

  // Update state when user prop changes
  useEffect(() => {
    setProfile({
      name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Client',
      title: 'Client',
      location: user?.location || user?.city || '',
    });
    setPersonalInfo({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      bio: user?.bio || '',
    });
    setAddress({
      line1: user?.address || '',
      province: user?.province || '',
      zipCode: user?.zipCode || user?.zip || '',
      cityState: user?.cityState || user?.city || '',
    });
  }, [user]);

  // Clean up preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handler for profile photo selection (not upload)
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Store the selected file for later upload
    setSelectedProfileFile(file);
    
    // Create preview URL for immediate display
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    
    console.log('Profile photo selected:', file.name);
  };

  // Helper function to upload profile photo
  const uploadProfilePhoto = async (file) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Get current profile photo URL from localStorage to delete old one
      const currentProfilePhoto = localStorage.getItem('profilePhoto');

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id.toString());
      formData.append('accountType', 'CLIENT');
      
      // Add old profile photo URL if it exists
      if (currentProfilePhoto) {
        formData.append('oldProfilePhotoUrl', currentProfilePhoto);
      }

      console.log('Uploading profile photo:', file.name, 'for user:', user.id);
      console.log('Current profile photo to delete:', currentProfilePhoto);

      // Upload to your backend API
      const response = await fetch('http://localhost:8080/api/upload-profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const downloadUrl = await response.text();
      console.log('Profile photo upload successful, URL:', downloadUrl);
      return downloadUrl;
      
    } catch (error) {
      console.error('Profile photo upload failed:', error);
      throw error;
    }
  };

  // Modified handleUpdate function
  const handleUpdate = async () => {
    try {
      let profilePhotoUrl = null;
      
      // If a new profile photo was selected, upload it first
      if (selectedProfileFile) {
        console.log('Uploading new profile photo...');
        profilePhotoUrl = await uploadProfilePhoto(selectedProfileFile);
        
        // Update localStorage with new profile photo URL
        localStorage.setItem('profilePhoto', profilePhotoUrl);
      }

      // Prepare user data for update
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
        // Include profile photo URL if it was uploaded
        ...(profilePhotoUrl && { profilePhotoUrl })
      };

      // Update user profile
      const response = await fetch(`http://localhost:8080/users/clientUpdate/${user.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedUserData),
      });

      if (response.ok) {
        // Clear the selected file and preview after successful update
        setSelectedProfileFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        
        // Update profile state with new data
        setProfile(prev => ({
          ...prev,
          name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          ...(profilePhotoUrl && { profilePhoto: profilePhotoUrl })
        }));
        
        alert('Profile updated successfully!');
      } else {
        alert('Profile update failed.');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(`Update failed: ${error.message}`);
    }
  };

  // Get profile photo source for display
  const getProfilePhotoSource = () => {
    if (previewUrl) {
      return previewUrl; // Show preview of selected file
    }
    if (profilePhoto) {
      return profilePhoto; // Show current profile photo
    }
    return null; // No photo
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
          <h1 className="mb-6 text-2xl font-bold text-gray-800">Account Settings</h1>

          {/* Profile Section */}
          <Section title="My Profile">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-blue-100 rounded-full">
                  {getProfilePhotoSource() ? (
                    <img
                      src={getProfilePhotoSource()}
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-xl font-semibold text-blue-600">
                      {(
                        (personalInfo.firstName?.charAt(0) || '') +
                        (personalInfo.lastName?.charAt(0) || '')
                      ).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="ml-4 font-semibold text-gray-800">{profile.name}</h4>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleProfilePhotoChange}
                />
                <button
                  className='px-4 py-3 mb-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700'
                  onClick={() => document.getElementById('profile-photo-input').click()}
                  type="button"
                >
                  {selectedProfileFile ? 'Change Selected Photo' : 'Select Profile Photo'}
                </button>
                {selectedProfileFile && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Photo selected: {selectedProfileFile.name}
                  </p>
                )}
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
              {selectedProfileFile ? 'Update Profile & Upload Photo' : 'Update Profile'}
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
  );
};

export default ClientSettings;