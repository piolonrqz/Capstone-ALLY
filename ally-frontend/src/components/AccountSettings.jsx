import React, { useState, useEffect } from 'react';
import LawyerSettings from './LawyerSettings';
import ClientSettings from './ClientSettings';
import AdminSettings from './AdminSettings';
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
        if (!data.accountType) {
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
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">Loading account settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-3xl px-4 mx-auto py-8">
        <div className="p-6 text-center bg-white border border-red-200 rounded-xl">
          <p className="mb-2 text-lg font-semibold text-red-600">{error}</p>
          <p className="text-gray-700">
            If the problem persists, please log out and log in again, or contact support.
          </p>
        </div>
      </div>
    );
  }

  switch (userType) {
    case 'lawyer':
      return (
        <div className="container max-w-5xl px-4 mx-auto py-8">
          <div className="bg-white shadow-sm rounded-2xl p-6 sm:p-8">
            <LawyerSettings user={userData} />
          </div>
        </div>
      );
    case 'client':
      return (
        <div className="container max-w-5xl px-4 mx-auto py-8">
          <div className="bg-white shadow-sm rounded-2xl p-6 sm:p-8">
            <ClientSettings user={userData} />
          </div>
        </div>
      );
    case 'admin':
      return (
        <div className="container max-w-5xl px-4 mx-auto py-8">
          <div className="bg-white shadow-sm rounded-2xl p-6 sm:p-8">
            <AdminSettings user={userData} />
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default AccountSettings;