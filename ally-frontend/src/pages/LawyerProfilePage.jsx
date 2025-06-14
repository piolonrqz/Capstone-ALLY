import React from 'react';
import { useParams } from 'react-router-dom';
import { LawyerProfile } from '../components/LawyerProfile';

export default function LawyerProfilePage() {
  const { lawyerId } = useParams();
  
  // TODO: Add logic to fetch lawyer data using lawyerId
  const lawyer = {
    id: lawyerId,
    // Add other lawyer properties here
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <LawyerProfile lawyer={lawyer} onClose={() => window.history.back()} />
    </div>
  );
}
