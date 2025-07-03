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


  const token = localStorage.getItem('token');
  

  useEffect(() => {
    fetch(`http://localhost:8080/users/getUser/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        setProfile({
          name: `${data.Fname} ${data.Lname}`,
        });
        console.log('Profile data:', data);
        setPersonalInfo(prev => ({
          ...prev,
          firstName: data.Fname || '',
          lastName: data.Lname || '',
          email: data.email || '',
          phone: data.phoneNumber || '',
          experience: data.experience || '',
          barNumber: data.barNumber || '',
          // If backend returns an array, join to string for display
          practiceAreas: Array.isArray(data.practiceAreas) ? data.practiceAreas.join(', ') : (data.practiceAreas || ''),
          educationInstitution: data.educationInstitution || '',
        }));
        setAddress(prev => ({
          ...prev,
          line1: data.address || '',
          province: data.province || '',
          zipCode: data.zipCode || data.zip || '',
          cityState: data.cityState || data.city || '',
        }));
      })
      .catch(error => {
        console.error('Failed to fetch user:', error);
      });
  }, []);

const handleUpdate = async () => {
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
    practiceAreas: personalInfo.practiceAreas,
    educationInstitution: personalInfo.educationInstitution,
  };

  console.log('Updated user data:', updatedUserData);

  try {
    const response = await fetch(`http://localhost:8080/users/lawyerUpdate/${user.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedUserData),
      }
    );

    if (response.ok) {
      alert('Profile updated successfully!');
    } else {
      alert('Update failed.');
    }
  } catch (error) {
    console.error('Update error:', error);
    alert('Something went wrong.');
  }
};
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

  // Fetch available practice areas from backend
  const [practiceAreaOptions, setPracticeAreaOptions] = useState([]);
  useEffect(() => {
    fetch('http://localhost:8080/users/specializations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        setPracticeAreaOptions(data || []);
      })
      .catch(error => {
        console.error('Failed to fetch practice areas:', error);
      });
  }, []);

  console.log('User object:', user);

  // Remove sidebar and just render the settings content as a component
  if (loading) {
    return (
      <>
        <NavigationBar />
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
          list="practice-areas-list"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <datalist id="practice-areas-list">
          {options.map((option, idx) => (
            <option value={option} key={idx} />
          ))}
        </datalist>
      </div>
    );
  };

  // In main component body, convert practiceAreas to array for chips
  const [practiceAreasChips, setPracticeAreasChips] = useState(() => {
    if (Array.isArray(personalInfo.practiceAreas)) return personalInfo.practiceAreas;
    if (typeof personalInfo.practiceAreas === 'string' && personalInfo.practiceAreas.trim()) {
      return personalInfo.practiceAreas.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  });
  // Keep chips and personalInfo.practiceAreas in sync
  useEffect(() => {
    setPersonalInfo((prev) => ({ ...prev, practiceAreas: practiceAreasChips }));
    // eslint-disable-next-line
  }, [practiceAreasChips]);

  // Custom AutocompleteInputField for practice areas
  const AutocompleteInputField = ({ label, value, onChange, options, placeholder }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        list="practice-areas-list"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <datalist id="practice-areas-list">
        {options.map((option, idx) => (
          <option value={option} key={idx} />
        ))}
      </datalist>
    </div>
  );

  return (
    <>
      <NavigationBar />
      <div className="w-full max-w-4xl p-8 pt-16 mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Account Settings</h1>

        {/* Profile Section */}
        <Section title="My Profile">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-blue-100 rounded-full">
              {user?.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
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
              <h4 className="font-semibold text-gray-800">{profile.name}</h4>
              <p className="text-gray-600">{profile.title}</p>
              <p className="text-gray-500">{profile.location}</p>
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
    </>
  );
};

export default LawyerSettings;