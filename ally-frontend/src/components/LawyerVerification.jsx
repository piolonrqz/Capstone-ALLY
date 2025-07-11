import React from 'react';
import LawyerVerificationTable from './LawyerVerificationTable';
import LawyerVerificationStats from './LawyerVerificationStats';

const LawyerVerification = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lawyer Verification</h1>
      </div>
      
      <LawyerVerificationStats />
      
      <div className="mt-8">
        <LawyerVerificationTable />
      </div>
    </div>
  );
};

export default LawyerVerification; 