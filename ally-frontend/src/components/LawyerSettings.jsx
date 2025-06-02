import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Shield, Users, FileOutput, Trash2, Upload, Download } from 'lucide-react';
import Section from './shared/Section';
import InputField from './shared/InputField';
import Button from './shared/Button';



const LawyerSettings = () => {
  const [profile, setProfile] = useState({
  });
  const token = localStorage.getItem('token');
  const userID = 3

useEffect(() => {
  fetch(`http://localhost:8080/users/getUser/${userID}`, {
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

      // You can also update personalInfo or address if needed
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
        zipCode: data.zip || '',
        city: data.city || '',
        credentials: data.credentials || [],
      }));
    })
    .catch(error => {
      console.error('Failed to fetch user:', error);
    });
}, []);


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
      {/* Sidebar */}      <aside className="fixed top-0 left-0 flex flex-col w-64 h-screen bg-white shadow-lg">
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

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-2xl font-bold text-gray-800">Account Settings</h1>

          {/* Profile Section */}
          <Section title="My Profile" onEdit={() => {}}>
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <span className="text-xl font-semibold text-blue-600">JD</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{profile.name}</h4>
                <p className="text-gray-600">{profile.title}</p>
                <p className="text-gray-500">{profile.location}</p>
              </div>
            </div>
          </Section>

          {/* Personal Information */}
          <Section title="Personal Information" onEdit={() => {}}>
            <div className="grid grid-cols-2 gap-6">
              <InputField label="First Name" value={personalInfo.firstName} />
              <InputField label="First Name" value={personalInfo.lastName} />
              <InputField label="Email address" value={personalInfo.email} />
              <InputField label="Phone" value={personalInfo.phone} />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input
                  type="text"
                  value={personalInfo.experience}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Bar Number</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={personalInfo.barNumber}
                    placeholder="Family Law"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="px-2 py-1 text-sm text-blue-800 bg-blue-100 rounded">Immigration</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Address */}
          <Section title="Address" onEdit={() => {}}>
            <div className="grid grid-cols-2 gap-6">
              <InputField label="Address Line 1" value={personalInfo.address} />
              <InputField label="Country" value={personalInfo.province} />
              <InputField label="ZIP Code" value={personalInfo.zipCode} />
              <InputField label="City/State" value={personalInfo.city} />
            </div>
          </Section>

          {/* Credentials & Documents */}
          <Section title="Credentials & Documents" onEdit={() => {}}>
            <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-blue-50">
                      <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{personalInfo.credentials}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    
                    <Button variant="secondary" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="danger" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                
        
              <Button variant="primary" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </div>
          </Section>

          {/* Footer */}
          <footer className="pt-8 mt-12 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800">ALLY</h5>
                  <p className="text-xs text-gray-500">Making legal help accessible to everyone through our innovative platform that connects clients with qualified legal professionals and AI.</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8 mt-8">
              <div>
                <h6 className="mb-3 font-semibold text-gray-800">Company</h6>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-800">About</a></li>
                  <li><a href="#" className="hover:text-gray-800">Careers</a></li>
                  <li><a href="#" className="hover:text-gray-800">Press</a></li>
                  <li><a href="#" className="hover:text-gray-800">Blog</a></li>
                  <li><a href="#" className="hover:text-gray-800">Partners</a></li>
                </ul>
              </div>
              <div>
                <h6 className="mb-3 font-semibold text-gray-800">Resources</h6>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-800">Help Center</a></li>
                  <li><a href="#" className="hover:text-gray-800">Documentation</a></li>
                  <li><a href="#" className="hover:text-gray-800">Guides</a></li>
                  <li><a href="#" className="hover:text-gray-800">Legal Resources</a></li>
                  <li><a href="#" className="hover:text-gray-800">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h6 className="mb-3 font-semibold text-gray-800">Legal</h6>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-800">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-gray-800">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-gray-800">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-gray-800">Data Protection</a></li>
                  <li><a href="#" className="hover:text-gray-800">Disclaimer</a></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 mt-8 text-sm text-center text-gray-500 border-t border-gray-200">
              © 2024 ALLY. All rights reserved
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LawyerSettings;