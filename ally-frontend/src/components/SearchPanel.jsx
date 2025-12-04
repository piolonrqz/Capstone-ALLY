import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { LawyerCard } from './LawyerCard';

export const SearchPanel = ({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  lawyers,
  onLawyerSelect,
  totalLawyers // <-- add this prop for count
}) => {
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [yearsOptions, setYearsOptions] = useState([]);
  const [error, setError] = useState('');
  const experienceRanges = [
    { label: "All Years", value: "All Years" },
    { label: "1-3 years", value: "1-3" },
    { label: "4-7 years", value: "4-7" },
    { label: "8+ years", value: "8+" }
  ];
  const casesHandledRanges = [
    { label: "All Cases", value: "All Cases" },
    { label: "1-10 cases", value: "1-10" },
    { label: "11-50 cases", value: "11-50" },
    { label: "51+ cases", value: "51+" }
  ];

  // Extract unique specializations, locations, and years of experience for dropdowns
  useEffect(() => {
    if (lawyers && lawyers.length > 0) {
      const specs = [...new Set(lawyers.map(lawyer => lawyer.specialty).filter(Boolean))];
      setSpecializations(specs);

      const locs = [...new Set(lawyers.map(lawyer => lawyer.location).filter(Boolean))];
      setLocations(locs);

      const years = [
        ...new Set(
          lawyers
            .map(lawyer => lawyer.experience)
            .filter(val => val !== undefined && val !== null && val !== '')
        ),
      ].sort((a, b) => a - b);
      setYearsOptions(years);
    }
  }, [lawyers]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      specialty: 'All Specialties',
      location: 'All Locations',
      experience: 'All Years',
      availability: 'Any Day',
      casesHandled: 'All Cases',
    });
  };

  return (
    <div className="p-6 bg-white shadow-sm rounded-xl">

      {error && (
        <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-sm text-red-600">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-red-600 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-end">
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, specialty, or location"
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end">
          <button
            className="px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Specialty</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.specialty}
              onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="All Locations">All Locations</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Experience</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.experience || 'All Years'}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            >
              <option>Any Day</option>
              <option>Weekdays</option>
              <option>Weekends</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Cases Handled</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.casesHandled || 'All Cases'}
              onChange={(e) => setFilters({ ...filters, casesHandled: e.target.value })}
            >
              {casesHandledRanges.map((range) => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Showing {totalLawyers} lawyer{totalLawyers !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lawyers list */}
      <div className="space-y-4">
        {lawyers.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-600">No lawyers found matching your criteria.</p>
            <button
              onClick={resetFilters}
              className="mt-2 text-blue-600 underline hover:text-blue-800"
            >
              Reset filters to see all lawyers
            </button>
          </div>
        ) : (
          lawyers.map((lawyer) => (
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