import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, Users, FileOutput, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Section from './shared/Section';
import InputField from './shared/InputField';
import NavigationBar from './NavigationBar';
import { Button } from 'react-day-picker';

// Accept user prop from AccountSettings
const LawyerSettings = ({ user }) => {
  const profilePhoto = localStorage.getItem('profilePhoto');
  const token = localStorage.getItem('token');

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
    practiceAreas: user?.practiceAreas || '',
    educationInstitution: user?.educationInstitution || user?.education_institution || '',
  });

  // State for hover effect on profile photo
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);

  const [address, setAddress] = useState({
    line1: user?.address || '',
    province: user?.province || '',
    zipCode: user?.zipCode || user?.zip || '',
    cityState: user?.cityState || user?.city || '',
  });

  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState(null);
  const [practiceAreaOptions, setPracticeAreaOptions] = useState([]);
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState(profilePhoto);

  // Convert specialization to array for chips
  const [practiceAreasChips, setPracticeAreasChips] = useState(() => {
    if (Array.isArray(personalInfo.specialization)) return personalInfo.specialization;
    if (typeof personalInfo.specialization === 'string') {
      return personalInfo.specialization.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  });

  // Fetch user data
  const fetchUserData = () => {
    if (!user?.id || !token) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/getUser/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setProfile({
          name: `${data.Fname} ${data.Lname}`,
        });
        setPersonalInfo(prev => ({
          ...prev,
          firstName: data.Fname || '',
          lastName: data.Lname || '',
          email: data.email || '',
          phone: data.phoneNumber || '',
          experience: data.experience || '',
          barNumber: data.barNumber || '',
          specialization: Array.isArray(data.specialization) ? data.specialization : (typeof data.specialization === 'string' ? data.specialization.split(',').map(s => s.trim()).filter(Boolean) : []),
          educationInstitution: data.educationInstitution || '',
          credentials : data.credentials || '',
        }));
        setAddress(prev => ({
          ...prev,
          line1: data.address || '',
          province: data.province || '',
          zipCode: data.zipCode || data.zip || '',
          cityState: data.cityState || data.city || '',
        }));
        // Update practice areas chips
        if (data.specialization) {
          const areas = Array.isArray(data.specialization)
            ? data.specialization
            : data.specialization.split(',').map(s => s.trim()).filter(Boolean);
          setPracticeAreasChips(areas);
        } else {
          setPracticeAreasChips([]);
        }
      })
      .catch(error => {
        setError(`Failed to fetch user data: ${error.message}`);
      });
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line
  }, [user?.id, token]);

  // Fetch available practice areas from backend
  useEffect(() => {
    if (!token) {
      console.log('No token available for fetching specializations');
      return;
    }

    console.log('Fetching specializations...');
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/specializations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        console.log('Specializations response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Specializations data received:', data);
        // Handle different response formats
        if (Array.isArray(data)) {
          setPracticeAreaOptions(data);
        } else if (data.specializations && Array.isArray(data.specializations)) {
          setPracticeAreaOptions(data.specializations);
        } else if (data.data && Array.isArray(data.data)) {
          setPracticeAreaOptions(data.data);
        } else {
          console.warn('Unexpected specializations data format:', data);
          setPracticeAreaOptions([]);
        }
      })
      .catch(error => {
        console.error('Failed to fetch practice areas:', error);
        setError(`Failed to fetch practice areas: ${error.message}`);
        // Set some default practice areas as fallback
        setPracticeAreaOptions([
          'Criminal Law',
          'Civil Law',
          'Family Law',
          'Corporate Law',
          'Real Estate Law',
          'Immigration Law',
          'Employment Law',
          'Personal Injury',
          'Tax Law',
          'Intellectual Property'
        ]);
      });
  }, [token]);

  // Keep chips and personalInfo.specialization in sync
  useEffect(() => {
    setPersonalInfo((prev) => ({
      ...prev,
      specialization: practiceAreasChips
    }));
  }, [practiceAreasChips]);

  // Optionally, update state if user prop changes
  useEffect(() => {
    if (!user) {
      setError(null);
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
      practiceAreas: user?.practiceAreas || '',
      educationInstitution: user?.educationInstitution || user?.education_institution || '',
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

  const handleUpdate = async () => {
    const finalPracticeAreas = practiceAreasChips.length > 0 ? practiceAreasChips : [];
    const updatedUserData = {
      ...personalInfo,
      ...address,
      phoneNumber: personalInfo.phone,
      experience: personalInfo.experience,
      barNumber: personalInfo.barNumber,
      address: address.line1,
      province: address.province,
      zip: address.zipCode,
      Fname: personalInfo.firstName,
      Lname: personalInfo.lastName,
      city: address.cityState,
      specialization: finalPracticeAreas, // use 'specialization' for backend
      educationInstitution: personalInfo.educationInstitution,
      prof_pic: currentProfilePhoto,
      credentials: personalInfo.credentials, 
    };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/lawyerUpdate/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedUserData),
      });
      if (response.ok) {
        toast.success('Profile updated successfully!');
        fetchUserData(); // re-fetch user data to update UI
      } else {
        const errorData = await response.text();
        toast.error(`Update failed: ${errorData}`);
      }
    } catch {
      toast.error('Something went wrong.');
    }
  };

  const handleCredentialsUpdate = async () => {
  const credentials = document.getElementById('credentials-input').files[0];
  if (!credentials) {
    toast.error('Please select a file.');
    return;
  }
  const formData = new FormData();
  formData.append('credentials', credentials);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/lawyerUpdate/credentials/${user.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    if (response.ok) {
      toast.success('Credentials updated successfully!');
    } else {
      const errorData = await response.text();
      toast.error(`Failed to update credentials: ${errorData}`);
    }
  } catch (error) {
    console.error('Error updating credentials:', error);
    toast.error('Failed to update credentials. Please try again.');
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
      
      // Update localStorage
      localStorage.setItem('profilePhoto', url);
      
      // Update local state to immediately show the new photo
      setCurrentProfilePhoto(url);
      
      // Optionally update the user object in localStorage if you have currentUser
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.id) {
        localStorage.setItem('currentUser', JSON.stringify({
          ...currentUser,
          prof_pic: url
        }));
      }
      
      toast.success('Profile photo updated successfully!');
    } catch (err) {
      toast.error('Failed to upload profile photo.');
      console.error(err);
    }
  };

  // Handler to remove profile photo
  const handleRemoveProfilePhoto = () => {
    // Clear profile photo from localStorage
    localStorage.removeItem('profilePhoto');
    
    // Update local state to immediately hide the photo
    setCurrentProfilePhoto(null);
    
    // Clear the currentUser object's prof_pic if it exists
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id) {
      localStorage.setItem('currentUser', JSON.stringify({
        ...currentUser,
        prof_pic: null
      }));
    }
    
    // Reset file input
    const fileInput = document.getElementById('profile-photo-input');
    if (fileInput) {
      fileInput.value = '';
    }
    
    toast.success('Profile photo removed successfully!');
  };

  // Chips-style multi-select for Practice Areas
  const ChipsInput = ({ label, values, setValues, options, placeholder }) => {
    const [input, setInput] = useState('');

    const addChip = (chip) => {
      if (chip && !values.includes(chip)) {
        setValues([...values, chip]);
      }
      setInput('');
    };

    const removeChip = (chip) => {
      setValues(values.filter((v) => v !== chip));
    };

    const handleInputKeyDown = (e) => {
      if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
        e.preventDefault();
        addChip(input.trim());
      }
    };

    const handleOptionClick = (option) => {
      addChip(option);
      setInput('');
    };

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex flex-wrap gap-2 mb-1">
          {values.map((chip, idx) => (
            <span key={idx} className="flex items-center px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
              {chip}
              <button type="button" className="ml-1 text-blue-500 hover:text-red-500" onClick={() => removeChip(chip)}>
                &times;
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {/* Show available options */}
        {options.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-xs text-gray-500">Available options:</p>
            <div className="flex flex-wrap gap-1">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  disabled={values.includes(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  console.log('User object:', user);
  console.log('Practice area options:', practiceAreaOptions);
  console.log('Practice areas chips:', practiceAreasChips);

  if (loading) {
    return (
      <>
        <NavigationBar />
        <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
          <div className="flex items-center justify-center py-20">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
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
        <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
          <div className="container max-w-5xl px-4 py-8 mx-auto">
            <div className="p-6 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
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
      <div className="w-full max-w-4xl p-8 pt-16 mx-auto">
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
                {profilePhoto ? (
                  <>
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="object-cover w-full h-full"
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
            <div>
              <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfilePhotoChange}
              />
              <button
                className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
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
            <InputField 
              label="Years of Experience" 
              value={personalInfo.experience} 
              onChange={(e) => setPersonalInfo({ ...personalInfo, experience: e.target.value })}
            />
            <InputField 
              label="Bar Number" 
              value={personalInfo.barNumber} 
              onChange={(e) => setPersonalInfo({ ...personalInfo, barNumber: e.target.value })}
            />
            {/* Practice Areas with chips */}
            <ChipsInput
              label="Practice Areas"
              values={practiceAreasChips}
              setValues={setPracticeAreasChips}
              options={practiceAreaOptions}
              placeholder="Type or select and press Enter..."
            />
            <InputField
              label="Education Institution"
              value={personalInfo.educationInstitution}
              onChange={(e) => setPersonalInfo({ ...personalInfo, educationInstitution: e.target.value })}
              placeholder="e.g. Harvard Law School"
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
        <Section title="Credentials">
        <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-start">Credentials & Certifications</label>
                <div className="p-6 text-center border border-gray-300 border-dashed rounded">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  <p className="mb-2 text-gray-600">Drag and drop files here or</p>
                  <label className="px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600">
                    Browse Files
                    <input
                    id='credentials-input'
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        setPersonalInfo({
                          ...personalInfo,
                          credentials: e.target.files[0]
                        });
                      }}
                    />
                  </label>
                  {personalInfo.credentials && (
                    <p className="mt-2 text-xs text-gray-700">
                      Selected file: {personalInfo.credentials.name}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">PDF, DOC, DOCX, JPG, JPEG, PNG (max 10MB each)</p>
                </div>
                <button
                className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
                onClick={handleCredentialsUpdate}
                type="button"
              >
                Update Credentials
              </button>
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

        {/* Debug Information (remove in production) */}
        <div className="p-4 mt-6 bg-gray-100 rounded">
          <h3 className="font-semibold text-gray-800">Debug Information:</h3>
          <p className="text-sm text-gray-600">Practice Area Options: {practiceAreaOptions.length} items</p>
          <p className="text-sm text-gray-600">Available Options: {practiceAreaOptions.join(', ')}</p>
          <p className="text-sm text-gray-600">Selected Practice Areas: {practiceAreasChips.join(', ')}</p>
          <p className="text-sm text-gray-600">Personal Info Practice Areas: {Array.isArray(personalInfo.practiceAreas) ? personalInfo.practiceAreas.join(', ') : personalInfo.practiceAreas}</p>
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
                <p className="max-w-md text-sm text-gray-500">
                  Making legal help accessible to everyone through our innovative platform that connects clients with qualified legal professionals and AI.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LawyerSettings;