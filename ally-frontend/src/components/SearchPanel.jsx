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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Initialize filtered lawyers and extract unique specializations and locations
  useEffect(() => {
    if (lawyers && lawyers.length > 0) {
      setFilteredLawyers(lawyers);
      
      // Extract unique specializations
      const specs = [...new Set(lawyers.map(lawyer => lawyer.specialty).filter(Boolean))];
      setSpecializations(specs);
      
      // Extract unique locations
      const locs = [...new Set(lawyers.map(lawyer => lawyer.location).filter(Boolean))];
      setLocations(locs);
    }
  }, [lawyers]);
  // Apply filters function
  const applyFilters = () => {
    if (!lawyers || lawyers.length === 0) {
      setFilteredLawyers([]);
      return;
    }

    let filtered = [...lawyers];

    // Apply search query filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(lawyer => 
        lawyer.name?.toLowerCase().includes(query) ||
        lawyer.specialty?.toLowerCase().includes(query) ||
        lawyer.location?.toLowerCase().includes(query)
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

    // Apply rating filter
    if (filters.rating && filters.rating !== 'Any Rating') {
      const minRating = filters.rating === '4+ Stars' ? 4 : 4.5;
      filtered = filtered.filter(lawyer => 
        lawyer.rating && lawyer.rating >= minRating
      );
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
      availability: 'Any Day',
      rating: 'Any Rating'
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
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>{spec}</option>
            ))}
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

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Minimum Rating</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.rating}
            onChange={(e) => setFilters({...filters, rating: e.target.value})}
          >
            <option>Any Rating</option>
            <option>4+ Stars</option>
            <option>4.5+ Stars</option>
          </select>
        </div>        <div className="flex space-x-2">
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
      </div>      {/* Results count */}
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