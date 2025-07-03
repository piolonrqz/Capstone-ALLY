import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { LawyerCard } from './LawyerCard';

export const SearchPanel = ({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters, 
  lawyers,
  onLawyerSelect
}) => {
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [yearsOptions, setYearsOptions] = useState([]); // <-- Add this
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const experienceRanges = [
  { label: "All Years", value: "All Years" },
  { label: "1-3 years", value: "1-3" },
  { label: "4-7 years", value: "4-7" },
  { label: "8+ years", value: "8+" }
];

  // Initialize filtered lawyers and extract unique specializations, locations, and years of experience
  
useEffect(() => {
  if (lawyers && lawyers.length > 0) {
    setFilteredLawyers(lawyers);

    // Extract unique specializations
    const specs = [...new Set(lawyers.map(lawyer => lawyer.specialty).filter(Boolean))];
    setSpecializations(specs);

    // Extract unique locations
    const locs = [...new Set(lawyers.map(lawyer => lawyer.location).filter(Boolean))];
    setLocations(locs);

    // Extract unique years of experience
    const years = [
  ...new Set(
    lawyers
      .map(lawyer => lawyer.experience)
      .filter(val => val !== undefined && val !== null && val !== '')
  ),
].sort((a, b) => a - b);
    setYearsOptions(years);

    // Print the years to the console for debugging
    console.log('Extracted experience:', years);
  }
}, [lawyers]);

  // Apply filters function
  const applyFilters = () => {
    if (!lawyers || lawyers.length === 0) {
      setFilteredLawyers([]);
      return;
    }

      const isDefault =
    (!searchQuery || searchQuery.trim() === '') &&
    (!filters.specialty || filters.specialty === 'All Specialties') &&
    (!filters.location || filters.location === 'All Locations') &&
    (!filters.experience || filters.experience === 'All Years') &&
    (!filters.availability || filters.availability === 'Any Day');

  let filtered = [...lawyers];

  if (isDefault) {
    filtered.sort((a, b) => {
      const aYears = Number(typeof a.experience === 'string' ? a.experience.replace(/\D/g, '') : a.experience);
      const bYears = Number(typeof b.experience === 'string' ? b.experience.replace(/\D/g, '') : b.experience);
      return bYears - aYears;
    });
    setFilteredLawyers(filtered);
    return;
  }


    // Apply search query filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(lawyer => 
        lawyer.name?.toLowerCase().includes(query) ||
        lawyer.specialty?.toLowerCase().includes(query) ||
        lawyer.location?.toLowerCase().includes(query) ||
        (lawyer.experience && lawyer.experience.toString().includes(query))
      );
    }

    // Apply specialty filter
    if (filters.specialty && filters.specialty !== 'All Specialties') {
      filtered = filtered.filter(lawyer => 
        lawyer.specialty?.includes(filters.specialty)
      );
    }

    // Apply location filter
    if (filters.location && filters.location !== 'All Locations' && filters.location !== '') {
      filtered = filtered.filter(lawyer => 
        lawyer.location?.includes(filters.location)
      );
    }

    // Apply years of experience filter
  if (filters.experience && filters.experience !== 'All Years') {
  filtered = filtered.filter(lawyer => {
    // Extract the number from "5 years", "1 years", etc.
    const years = Number(
      typeof lawyer.experience === 'string'
        ? lawyer.experience.replace(/\D/g, '')
        : lawyer.experience
    );
    if (filters.experience === '1-3') return years >= 1 && years <= 3;
    if (filters.experience === '4-7') return years >= 4 && years <= 7;
    if (filters.experience === '8+') return years >= 8;
    return true;
  });
}

    setFilteredLawyers(filtered);
  };

  // Auto-apply filters when search query or filters change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, lawyers]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      specialty: 'All Specialties',
      location: 'All Locations',
      experience: 'All Years',
      availability: 'Any Day',
    });
  };

  return (
    <div className="p-8 bg-white shadow-sm rounded-xl">
      <h1 className="mb-3 text-2xl font-bold text-gray-900">Find the Right Lawyer for Your Case</h1>
      <p className="mb-8 text-gray-600">Search our network of verified legal professionals or let our AI match you with the perfect attorney</p>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-red-600 underline text-sm hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="relative mb-6">
        <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
        <input
          type="text"
          placeholder="Search by name, specialty, or location"
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-6 space-y-4">
        <h3 className="font-semibold">Filter Lawyers</h3>
        
        <div>
  <label className="block mb-1 text-sm font-medium text-gray-700">Specialty</label>
  <select 
    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    value={filters.specialty}
    onChange={(e) => setFilters({...filters, specialty: e.target.value})}
  >
    <option value="All Specialties">All Specialties</option>
    <option value="familyLaw">Family Law</option>
    <option value="realEstate">Real Estate</option>
    <option value="businessLaw">Business Law</option>
    <option value="estatePlanning">Estate Planning</option>
    <option value="criminalDefense">Criminal Defense</option>
  </select>
</div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          >
            <option value="All Locations">All Locations</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* Years of Experience Filter */}
        <div>
  <label className="block mb-1 text-sm font-medium text-gray-700">Years of Experience</label>
  <select
    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    value={filters.experience || 'All Years'}
    onChange={(e) => setFilters({...filters, experience: e.target.value})}
  >
    {experienceRanges.map((range) => (
      <option key={range.value} value={range.value}>{range.label}</option>
    ))}
  </select>
</div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Availability</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.availability}
            onChange={(e) => setFilters({...filters, availability: e.target.value})}
          >
            <option>Any Day</option>
            <option>Weekdays</option>
            <option>Weekends</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button 
            className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            onClick={applyFilters}
          >
            Apply Filters
          </button>
          <button 
            className="px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>
      </div>
      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredLawyers.length} lawyer{filteredLawyers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Lawyers list */}
      <div className="space-y-4">
        {filteredLawyers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No lawyers found matching your criteria.</p>
            <button 
              onClick={resetFilters}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Reset filters to see all lawyers
            </button>
          </div>
        ) : (
          filteredLawyers.map((lawyer) => (
            <LawyerCard 
              key={lawyer.id} 
              lawyer={lawyer} 
              onClick={onLawyerSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};