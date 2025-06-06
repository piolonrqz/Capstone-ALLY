import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Shield, Users, FileOutput, Trash2, Upload, Download } from 'lucide-react';
import Section from './shared/Section';
import InputField from './shared/InputField';
import Button from './shared/Button';



const LawyerSettings = () => {
  const [profile, setProfile] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const token = localStorage.getItem('token');
  const userID = 2;

  const practiceAreas = [
    { id: 1, name: 'Family Law' },
    { id: 2, name: 'Criminal Defense' },
    { id: 3, name: 'Real Estate' },
    { id: 4, name: 'Business Law' },
    { id: 5, name: 'Personal Injury' },
    { id: 6, name: 'Estate Planning' },
    { id: 7, name: 'Immigration' }
  ];

  const [selectedAreas, setSelectedAreas] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8080/users/getUser/${userID}`, {
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
        setProfilePicture(data.profilePhoto);
        setSelectedAreas(data.specialization || []);

        setPersonalInfo(prev => ({
          ...prev,
          firstName: data.Fname,
          lastName: data.Lname,
          email: data.email,
          phone: data.phoneNumber || '',
          experience: data.experience || '',
          barNumber: data.barNumber || '',
          address: data.address || '',
          province: data.province || '',
          city: data.city || '',
          zipCode: data.zip || '',
          credentials: data.credentials || [],
        }));
      })
      .catch(error => {
        console.error('Failed to fetch user:', error);
      });
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      const formData = new FormData();
      formData.append('profilePhoto', file);

      fetch(`http://localhost:8080/users/updatePhoto/${userID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        setProfilePicture(data.profilePhoto);
      })
      .catch(error => {
        console.error('Failed to update photo:', error);
      });
    } else {
      alert('File size should not exceed 5MB');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('Fname', personalInfo.firstName);
    formData.append('Lname', personalInfo.lastName);
    formData.append('email', personalInfo.email);
    formData.append('phoneNumber', personalInfo.phone);

    try {
      await fetch(`http://localhost:8080/users/updateUser/${userID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePracticeAreasUpdate = async () => {
    try {
      await fetch(`http://localhost:8080/users/updateSpecialization/${userID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ specialization: selectedAreas })
      });
      alert('Practice areas updated successfully');
    } catch (error) {
      console.error('Failed to update practice areas:', error);
      alert('Failed to update practice areas');
    }
  };

  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'John',
    lastName: 'John',
    email: 'john.doe@example.com',
    phone: '+1(3) 999 3438 324',
    bio: 'john.doe@example.com',
    ssn: '3101834414126124',
    experience: '12 years',
    barNumber: '',
    familyLaw: true
  });

  const [address, setAddress] = useState({
    line1: 'Sacramento, Westland',
    country: 'Cebu City',
    zipCode: '6032',
    cityState: 'Cebu City'
  });

  const [documents] = useState([
    { name: 'Bar_Certification.pdf', uploaded: 'May 1, 2024', status: 'verified' },
  
  ]);
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header - Only visible on mobile */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white border-b border-gray-200 md:hidden">
        <Link to="/">
          <img src="/small_logo.png" alt="ALLY Logo" className="h-8" />
        </Link>
        <button className="p-2 text-gray-600 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar - Hidden on mobile by default */}
      <aside className="fixed top-0 left-0 z-40 flex-col hidden w-64 h-screen bg-white shadow-lg md:flex">
        <div className="p-6 border-b border-gray-200">
          <Link to="/">
            <img src="/small_logo.png" alt="ALLY Logo" className="h-8" />
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
            <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/settings/team' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
              <Link to="/settings/team" className={`flex items-center ${path === '/settings/team' ? 'text-blue-600' : 'text-gray-700'}`}>
                <Users className="w-5 h-5 mr-3" />
                <span className={path === '/settings/team' ? 'font-medium' : ''}>Team</span>
              </Link>
            </li>
            <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/settings/team-member' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
              <Link to="/settings/team-member" className={`flex items-center ${path === '/settings/team-member' ? 'text-blue-600' : 'text-gray-700'}`}>
                <User className="w-5 h-5 mr-3" />
                <span className={path === '/settings/team-member' ? 'font-medium' : ''}>Team Member</span>
              </Link>
            </li>
            <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/settings/data-export' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>              <Link to="/settings/data-export" className={`flex items-center ${path === '/settings/data-export' ? 'text-blue-600' : 'text-gray-700'}`}>
                <FileOutput className="w-5 h-5 mr-3" />
                <span className={path === '/settings/data-export' ? 'font-medium' : ''}>Data Export</span>
              </Link></li>
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

      {/* Main Content Area */}
      <main className="flex-1 w-full min-h-screen md:ml-64 bg-gray-50">
        {/* Content wrapper with proper spacing */}
        <div className="px-4 py-20 md:py-6 md:px-8">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>
          
          {/* Settings Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Settings Card */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Profile</h2>
              <form className="space-y-4" onSubmit={handleProfileUpdate}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 overflow-hidden rounded-full">
                      <img 
                        src={profilePicture || "/add_profile.png"} 
                        alt="Profile" 
                        className="object-cover w-full h-full" 
                      />
                    </div>
                    <label className="px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-md cursor-pointer hover:bg-blue-50">
                      Change Photo
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Practice Areas Card */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Practice Areas</h2>
              <div className="space-y-3">
                {practiceAreas.map((area) => (
                  <div key={area.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`area-${area.id}`}
                      checked={selectedAreas.includes(area.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAreas(prev => [...prev, area.name]);
                        } else {
                          setSelectedAreas(prev => prev.filter(a => a !== area.name));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`area-${area.id}`} className="ml-2 text-sm text-gray-700">
                      {area.name}
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handlePracticeAreasUpdate}
                  className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Practice Areas
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LawyerSettings;