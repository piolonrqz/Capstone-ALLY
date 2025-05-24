import React from 'react';
import StatsOverview from '../components/StatsOverview';
import UserManagementTable from '../components/UserManagementTable';

const UserManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 mt-8">User Management</h1>
      </div>
      
      <div>
        <StatsOverview />
      </div>
      
      <div className="mt-8">
        <UserManagementTable />
      </div>
    </div>
  );
};

export default UserManagement;
