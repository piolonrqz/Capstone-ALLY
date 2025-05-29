import React, { useState } from 'react';
import LawyerSettings from './LawyerSettings';
import ClientSettings from './ClientSettings';
import Button from './shared/Button';

const AccountSettings = () => {
  const [userType, setUserType] = useState('lawyer'); // 'lawyer' or 'client'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Type Switcher for Demo */}
      <div className="fixed z-10 top-4 right-4">
        <div className="p-3 bg-white border rounded-lg shadow-lg">
          <p className="mb-2 text-sm font-medium text-gray-700">Demo Mode:</p>
          <div className="flex space-x-2">
            <Button 
              variant={userType === 'lawyer' ? 'primary' : 'secondary'}
              onClick={() => setUserType('lawyer')}
              size="sm"
            >
              Lawyer
            </Button>
            <Button 
              variant={userType === 'client' ? 'primary' : 'secondary'}
              onClick={() => setUserType('client')}
              size="sm"
            >
              Client
            </Button>
          </div>
        </div>
      </div>

      {/* Render appropriate component based on user type */}
      {userType === 'lawyer' ? <LawyerSettings /> : <ClientSettings />}
    </div>
  );
};

export default AccountSettings;