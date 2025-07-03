import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import StatsOverview from '../components/StatsOverview';
import UserManagementTable from '../components/UserManagementTable';
import { userService } from '../services/userService';

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);
        // Initial data loading can be done here if needed
        setLoading(false);
      } catch (error) {
        console.error('Error initializing user management page:', error);
        setError('Failed to load user management data');
        toast.error('Failed to load user management data');
        setLoading(false);
      }
    };

    initializePage();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>
      
      <StatsOverview />
      
      <div className="mt-8">
        <UserManagementTable />
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
