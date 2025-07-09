import React, { useState, useEffect } from 'react';
import { SearchPanel } from '../components/SearchPanel';
import { LawyerProfile } from '../components/LawyerProfile';
import { AIMatching } from '../components/AIMatching';
import CasesList from '@/components/CasesList';

export const LawyerDirectoryPage = () => {
  const [activeView, setActiveView] = useState('search');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    specialty: 'All Specialties',
    location: '',
    experience: 'All Years',
    availability: 'Any Day',
    casesHandled: 'All Cases',
    rating: 'Any Rating'
  });
  const [fetchedLawyers, setFetchedLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const lawyersPerPage = 8;

  // Filtering logic moved here
  const filteredLawyers = fetchedLawyers.filter(lawyer => {
    // Search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      if (
        !(
          lawyer.name?.toLowerCase().includes(query) ||
          lawyer.specialty?.toLowerCase().includes(query) ||
          lawyer.location?.toLowerCase().includes(query) ||
          (lawyer.experience && lawyer.experience.toString().includes(query))
        )
      ) return false;
    }
    // Specialty
    if (filters.specialty && filters.specialty !== 'All Specialties' && !lawyer.specialty?.includes(filters.specialty)) return false;
    // Location
    if (filters.location && filters.location !== 'All Locations' && filters.location !== '' && !lawyer.location?.includes(filters.location)) return false;
    // Years of experience
    if (filters.experience && filters.experience !== 'All Years') {
      const years = Number(
        typeof lawyer.experience === 'string'
          ? lawyer.experience.replace(/\D/g, '')
          : lawyer.experience
      );
      if (filters.experience === '1-3' && !(years >= 1 && years <= 3)) return false;
      if (filters.experience === '4-7' && !(years >= 4 && years <= 7)) return false;
      if (filters.experience === '8+' && !(years >= 8)) return false;
    }
    // Cases handled
    if (filters.casesHandled && filters.casesHandled !== 'All Cases') {
      const cases = Number(lawyer.casesHandled);
      if (filters.casesHandled === '1-10' && !(cases >= 1 && cases <= 10)) return false;
      if (filters.casesHandled === '11-50' && !(cases >= 11 && cases <= 50)) return false;
      if (filters.casesHandled === '51+' && !(cases >= 51)) return false;
    }
    // Availability (if you have logic for this, add here)
    return true;
  });

  // Sort by cases handled, then experience (descending)
  filteredLawyers.sort((a, b) => {
    const aCases = Number(a.casesHandled) || 0;
    const bCases = Number(b.casesHandled) || 0;
    if (bCases !== aCases) {
      return bCases - aCases;
    }
    const aYears = Number(typeof a.experience === 'string' ? a.experience.replace(/\D/g, '') : a.experience) || 0;
    const bYears = Number(typeof b.experience === 'string' ? b.experience.replace(/\D/g, '') : b.experience) || 0;
    return bYears - aYears;
  });

  // Paginate the filtered lawyers
  const totalPages = Math.ceil(filteredLawyers.length / lawyersPerPage);
  const paginatedLawyers = filteredLawyers.slice(
    (currentPage - 1) * lawyersPerPage,
    currentPage * lawyersPerPage
  );

  useEffect(() => {
    const fetchVerifiedLawyers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/lawyers/verified');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const transformedData = data.map(lawyer => ({
          id: lawyer.userId,
          name: `${lawyer.Fname} ${lawyer.Lname}`,
          specialty: lawyer.specialization && lawyer.specialization.length > 0 ? lawyer.specialization.join(', ') : 'Not specified',
          location: `${lawyer.city}, ${lawyer.province}`,
          rating: lawyer.rating || 0,
          experience: lawyer.experience ? `${lawyer.experience} years` : 'N/A',
          fee: lawyer.consultationFee ? `₱${lawyer.consultationFee}/hour` : 'N/A',
          image: `${lawyer.Fname ? lawyer.Fname[0] : ''}${lawyer.Lname ? lawyer.Lname[0] : ''}`.toUpperCase(),
          about: lawyer.bio || 'No biography available.',
          education: lawyer.educationInstitution|| 'Not specified',
          areas: lawyer.specialization || [],
          casesHandled: lawyer.casesHandled || 0,
        }));
        setFetchedLawyers(transformedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setFetchedLawyers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVerifiedLawyers();
  }, []);

  const handleLawyerSelect = (lawyer) => {
    setSelectedLawyer(lawyer);
  };

  // Reset to page 1 if filters/search change or lawyers list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, fetchedLawyers.length]);

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
      {selectedLawyer && (
        <LawyerProfile 
          lawyer={selectedLawyer}
          onClose={() => setSelectedLawyer(null)}
        />
      )}

      <div className="container max-w-5xl px-4 mx-auto">        
        <div className="p-4 bg-white shadow-sm sm:p-6 md:p-8 rounded-xl">
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:mb-3 sm:text-2xl">Find the Right Lawyer for Your Case</h1>
          <p className="mb-6 text-sm text-gray-600 sm:mb-8 sm:text-base">Search our network of verified legal professionals and submit your case to get started with legal assistance</p>
          {/* Responsive button group */}
          <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:gap-0 sm:mb-8">
            <button 
              className={`py-2 px-4 text-sm sm:text-base font-medium transition-colors ${
                activeView === 'search' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${
                'rounded-lg sm:rounded-none sm:rounded-l-lg'
              }`}
              onClick={() => setActiveView('search')}
            >
              Search Lawyers
            </button>
            <button 
              className={`py-2 px-4 text-sm sm:text-base font-medium transition-colors ${
                activeView === 'ai-matching' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${
                'rounded-lg sm:rounded-none sm:rounded-r-lg'
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
                lawyers={paginatedLawyers}
                onLawyerSelect={handleLawyerSelect}
                totalLawyers={filteredLawyers.length}
              />
            ) : (
              <AIMatching 
                lawyers={paginatedLawyers}
                onLawyerSelect={handleLawyerSelect}
              />
            )}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                className="px-3 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};