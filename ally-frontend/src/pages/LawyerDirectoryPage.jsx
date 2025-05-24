import React, { useState } from 'react';
import { SearchPanel } from '../components/SearchPanel';
import { LawyerProfile } from '../components/LawyerProfile';
import { AIMatching } from '../components/AIMatching';

// Mock lawyer data
const lawyers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    specialty: 'Family Law',
    location: 'Manila',
    rating: 4.8,
    experience: '15 years',
    caseType: 'Divorce',
    fee: '₱5,000/hour',
    image: 'SJ',
    about: 'Specialized in family law with over 15 years of experience handling divorce, custody, and child support cases.',
    education: 'University of the Philippines College of Law',
    areas: ['Divorce', 'Civil Custody', 'Alimony', 'Prenuptial Agreements']
  },
  {
    id: 2,
    name: 'Miguel Santos',
    specialty: 'Criminal Law',
    location: 'Quezon City',
    rating: 4.9,
    experience: '20 years',
    caseType: 'Criminal Defense',
    fee: '₱6,000/hour',
    image: 'MS',
    about: 'Expert criminal defense attorney with extensive trial experience and a track record of successful cases.',
    education: 'Ateneo Law School',
    areas: ['Criminal Defense', 'White Collar Crime', 'Appeals', 'Drug Cases']
  },
  {
    id: 3,
    name: 'Anna Reyes',
    specialty: 'Corporate Law',
    location: 'Makati',
    rating: 4.7,
    experience: '12 years',
    caseType: 'Business Law',
    fee: '₱4,500/hour',
    image: 'AR',
    about: 'Specializing in corporate law, mergers and acquisitions, and business formation.',
    education: 'San Beda College of Law',
    areas: ['Corporate Law', 'Mergers & Acquisitions', 'Business Formation', 'Contracts']
  },
  {
    id: 4,
    name: 'James Tan',
    specialty: 'Immigration Law',
    location: 'Pasig',
    rating: 4.6,
    experience: '10 years',
    caseType: 'Immigration',
    fee: '₱4,000/hour',
    image: 'JT',
    about: 'Dedicated to helping clients navigate complex immigration processes and requirements.',
    education: 'Far Eastern University Institute of Law',
    areas: ['Immigration', 'Visa Applications', 'Citizenship', 'Deportation Defense']
  }
];

export const LawyerDirectoryPage = () => {
  const [activeView, setActiveView] = useState('search');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    specialty: 'All Specialties',
    location: '',
    availability: 'Any Day',
    rating: 'Any Rating'
  });

  const handleLawyerSelect = (lawyer) => {
    setSelectedLawyer(lawyer);
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {selectedLawyer && (
        <LawyerProfile 
          lawyer={selectedLawyer}
          onClose={() => setSelectedLawyer(null)}
        />
      )}

      <div className="container max-w-5xl px-4 mx-auto">
        <div className="p-8 bg-white shadow-sm rounded-xl">
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Find the Right Lawyer for Your Case</h1>
          <p className="mb-8 text-gray-600">Search our network of verified legal professionals or let our AI match you with the perfect attorney</p>
          
          <div className="flex mb-8">
            <button 
              className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
                activeView === 'search' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveView('search')}
            >
              Search Lawyers
            </button>
            <button 
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
                activeView === 'ai-matching' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveView('ai-matching')}
            >
              AI Matching
            </button>
          </div>

          <div className="transition-opacity duration-200 ease-in-out">
            {activeView === 'search' ? (
              <SearchPanel 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
                lawyers={lawyers}
                onLawyerSelect={handleLawyerSelect}
              />
            ) : (
              <AIMatching 
                lawyers={lawyers}
                onLawyerSelect={handleLawyerSelect}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};