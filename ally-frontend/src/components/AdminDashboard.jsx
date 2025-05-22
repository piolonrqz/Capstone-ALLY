import React from 'react';
import LawyerVerificationTable from './LawyerVerificationTable';
import StatsOverview from './StatsOverview';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 mt-8">Admin Dashboard</h1>
      </div>
      
      <StatsOverview />
      
      <div className="mt-8">
        <LawyerVerificationTable />
      </div>
    </div>
  );
};

export default AdminDashboard;
