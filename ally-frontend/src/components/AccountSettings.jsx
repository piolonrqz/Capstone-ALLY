import React, { useState, useEffect } from 'react';
import LawyerSettings from './LawyerSettings';
import ClientSettings from './ClientSettings';
import { getAuthData, fetchUserDetails } from '../utils/auth';

const AccountSettings = () => {
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const auth = getAuthData();
        if (!auth || !auth.userId) {
          setError('You are not authenticated. Please log in.');
          setLoading(false);
          return;
        }
        const data = await fetchUserDetails(auth.userId);
        if (!data.accountType || (data.accountType.toLowerCase() !== 'lawyer' && data.accountType.toLowerCase() !== 'client')) {
          setError('Unable to determine your account type.');
          setLoading(false);
          return;
        }
        setUserType(data.accountType.toLowerCase());
        setUserData(data);
      } catch (err) {
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 text-center bg-white rounded shadow">
          <p className="mb-2 text-lg font-semibold text-red-600">{error}</p>
          <p className="text-gray-700">If the problem persists, please log out and log in again, or contact support.</p>
        </div>
      </div>
    );
  }

  if (userType === 'lawyer') {
    return <LawyerSettings user={userData} />;
  } else if (userType === 'client') {
    return <ClientSettings user={userData} />;
  } else {
    return null;
  }
};

export default AccountSettings;