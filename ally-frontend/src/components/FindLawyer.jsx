import React, { useState } from 'react';
import { SearchPanel } from './SearchPanel';

const FindLawyer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    specialty: 'All Specialties',
    location: 'All Locations',
    availability: 'Any Day',
    rating: 'Any Rating'
  });

  const handleLawyerSelect = (lawyer) => {
    console.log('Selected lawyer:', lawyer);
    // Handle lawyer selection - navigate to profile, open modal, etc.
    // You can add your custom logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl py-8 mx-auto">
        <SearchPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          onLawyerSelect={handleLawyerSelect}
        />
      </div>
    </div>
  );
};

export default FindLawyer;