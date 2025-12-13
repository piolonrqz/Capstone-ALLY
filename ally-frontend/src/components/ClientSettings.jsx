import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, Trash2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import Section from './shared/Section';
import InputField from './shared/InputField';

const ClientSettings = ({ user }) => {
  // Initialize state from user prop
  const [profile, setProfile] = useState({
    name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Client',
    title: 'Client',
    location: user?.location || user?.city || '',
  });

  // State for hover effect on profile photo
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);

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

  // Fetch user data on component mount
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
      toast.error('Please select a valid image file.');
      return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload-profile-picture`, {
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

  // Handler to remove profile photo
  const handleRemoveProfilePhoto = () => {
    // Clear preview URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Clear selected file
    setSelectedProfileFile(null);
    
    // Clear profile photo from localStorage
    localStorage.removeItem('profilePhoto');
    
    // Reset file input
    const fileInput = document.getElementById('profile-photo-input');
    if (fileInput) {
      fileInput.value = '';
    }
    
    toast.success('Profile photo removed successfully!');
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/clientUpdate/${user.id}`, {
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
        
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Profile update failed.');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(`Update failed: ${error.message}`);
    }
  };

  // Get profile photo source for display
  const getProfilePhotoSource = () => {
    if (previewUrl && previewUrl.trim() !== '') {
      return previewUrl; // Show preview of selected file
    }
    if (profilePhoto && profilePhoto.trim() !== '') {
      return profilePhoto; // Show current profile photo
    }
    return null; // No photo - will show initials
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-2xl font-bold text-gray-800">Account Settings</h1>

          {/* Profile Section */}
          <Section title="My Profile">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center">
                <div 
                  className="relative flex items-center justify-center w-16 h-16 overflow-hidden bg-blue-100 rounded-full cursor-pointer group"
                  onMouseEnter={() => setIsHoveringPhoto(true)}
                  onMouseLeave={() => setIsHoveringPhoto(false)}
                >
                  {getProfilePhotoSource() ? (
                    <>
                      <img
                        src={getProfilePhotoSource()}
                        alt="Profile"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          // If image fails to load, hide img and show initials
                          e.target.style.display = 'none';
                          const initialsSpan = e.target.parentElement.querySelector('.initials-fallback');
                          if (initialsSpan) {
                            initialsSpan.style.display = 'flex';
                            initialsSpan.classList.remove('hidden');
                          }
                        }}
                      />
                      {/* Hover overlay with remove button */}
                      {isHoveringPhoto && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
                          <button
                            onClick={handleRemoveProfilePhoto}
                            className="p-2 text-white hover:text-red-400 transition-colors"
                            title="Remove photo"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : null}
                  <span className={`initials-fallback absolute inset-0 flex items-center justify-center text-xl font-semibold text-blue-600 ${getProfilePhotoSource() ? 'hidden' : ''}`}>
                    {(
                      (personalInfo.firstName?.charAt(0) || '') +
                      (personalInfo.lastName?.charAt(0) || '')
                    ).toUpperCase() || 'U'}
                  </span>
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
                <p className="text-sm text-gray-500 mt-1">
                    File limit: 5MB
                  </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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