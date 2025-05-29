import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Shield, Trash2, Bell } from 'lucide-react';
import Section from './shared/Section';
import InputField from './shared/InputField';

const ClientSettings = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    title: 'Client',
    location: 'New York, NY'
  });

  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1(3) 999 3438 324',
    bio: 'A brief description about me.'
  });

  const [address, setAddress] = useState({
    line1: 'Sacramento, Westland',
    country: 'Cebu City',
    zipCode: '6032',
    cityState: 'Cebu City'
  });

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
            <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/settings/notifications' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
              <Link to="/settings/notifications" className={`flex items-center ${path === '/settings/notifications' ? 'text-blue-600' : 'text-gray-700'}`}>
                <Bell className="w-5 h-5 mr-3" />
                <span className={path === '/settings/notifications' ? 'font-medium' : ''}>Notifications</span>
              </Link>            </li>
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
              <InputField label="Last Name" value={personalInfo.lastName} />
              <InputField label="Email address" value={personalInfo.email} />
              <InputField label="Phone" value={personalInfo.phone} />
              <div className="col-span-2">
                <InputField label="Bio" value={personalInfo.bio} />
              </div>
            </div>
          </Section>

          {/* Address */}
          <Section title="Address" onEdit={() => {}}>
            <div className="grid grid-cols-2 gap-6">
              <InputField label="Address Line 1" value={address.line1} />
              <InputField label="Country" value={address.country} />
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
      </div>
    </div>
  );
};

export default ClientSettings;
