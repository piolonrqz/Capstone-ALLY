import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { LawyerCard } from './LawyerCard';

export const SearchPanel = ({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters, 
  onLawyerSelect
}) => {
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:8080/users';

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch all lawyers
        const lawyersResponse = await fetch(`${API_BASE_URL}/all`);
        if (!lawyersResponse.ok) throw new Error('Failed to fetch lawyers');
        const lawyersData = await lawyersResponse.json();
        
        // Fetch specializations for dropdown
        const specializationsResponse = await fetch(`${API_BASE_URL}/specializations`);
        if (!specializationsResponse.ok) throw new Error('Failed to fetch specializations');
        const specializationsData = await specializationsResponse.json();
        
        // Fetch locations for dropdown
        const locationsResponse = await fetch(`${API_BASE_URL}/locations`);
        if (!locationsResponse.ok) throw new Error('Failed to fetch locations');
        const locationsData = await locationsResponse.json();
        
        setLawyers(lawyersData);
        setFilteredLawyers(lawyersData);
        setSpecializations(specializationsData);
        setLocations(locationsData);
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Apply filters function
  const applyFilters = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      // Add search query as name parameter
      if (searchQuery && searchQuery.trim()) {
        params.append('name', searchQuery.trim());
      }
      
      // Add specialty filter
      if (filters.specialty && filters.specialty !== 'All Specialties') {
        params.append('specialization', filters.specialty);
      }
      
      // Add location filter
      if (filters.location && filters.location !== 'All Locations' && filters.location !== '') {
        // If location contains comma, split into city and province
        const locationParts = filters.location.split(', ');
        if (locationParts.length > 1) {
          params.append('city', locationParts[0]);
          params.append('province', locationParts[1]);
        } else {
          params.append('city', filters.location);
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to search lawyers');
      
      const searchResults = await response.json();
      setFilteredLawyers(searchResults);
      
    } catch (err) {
      setError(err.message);
      console.error('Error applying filters:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-apply filters when search query changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery !== '') {
        applyFilters();
      } else {
        setFilteredLawyers(lawyers);
      }
    }, 500); // 500ms delay for debouncing

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      specialty: 'All Specialties',
      location: 'All Locations',
      availability: 'Any Day',
      rating: 'Any Rating'
    });
    setFilteredLawyers(lawyers);
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
        </div>

        <div className="flex space-x-2">
          <button 
            className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={applyFilters}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Apply Filters'}
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
          {loading && ' (Loading...)'}
        </p>
      </div>

      {/* Lawyers list */}
      <div className="space-y-4">
        {loading && filteredLawyers.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading lawyers...</p>
          </div>
        ) : filteredLawyers.length === 0 ? (
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