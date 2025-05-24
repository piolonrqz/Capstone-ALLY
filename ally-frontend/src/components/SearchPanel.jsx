import { Search } from 'lucide-react';
import { LawyerCard } from './LawyerCard';

export const SearchPanel = ({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters, 
  lawyers, 
  onLawyerSelect
}) => (
  <div className="p-8 bg-white shadow-sm rounded-xl ">
    <h1 className="mb-3 text-2xl font-bold text-gray-900">Find the Right Lawyer for Your Case</h1>
    <p className="mb-8 text-gray-600">Search our network of verified legal professionals or let our AI match you with the perfect attorney</p>
    
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
          <option>All Specialties</option>
          <option>Family Law</option>
          <option>Criminal Law</option>
          <option>Corporate Law</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
        >
          <option value="">All Locations</option>
          <option>New York</option>
          <option>California</option>
          <option>Texas</option>
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

      <button className="w-full px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
        Apply Filters
      </button>
    </div>

    <div className="space-y-4">
      {lawyers.map((lawyer) => (
        <LawyerCard 
          key={lawyer.id} 
          lawyer={lawyer} 
          onClick={onLawyerSelect}
        />
      ))}
    </div>
  </div>
);
