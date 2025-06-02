import React from 'react';
import StatsOverview from '../components/StatsOverview';
import UserManagementTable from '../components/UserManagementTable';

const UserManagement = () => {
  return (
    <div className="px-4 mx-auto space-y-4 sm:px-6 lg:px-8 sm:space-y-6 max-w-7xl">
      <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
        <h1 className="mt-4 text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl sm:mt-8">User Management</h1>
      </div>
      
      <div className="w-full overflow-hidden">
        <StatsOverview />
      </div>
      
      <div className="w-full overflow-x-auto">
        <UserManagementTable />
      </div>
    </div>
  );
};

export default UserManagement;
