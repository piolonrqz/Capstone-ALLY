import React, { useState, useEffect } from 'react';
import { SearchPanel } from '../components/SearchPanel';
import { LawyerProfile } from '../components/LawyerProfile';
import { AIMatching } from '../components/AIMatching';

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
  const [fetchedLawyers, setFetchedLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerifiedLawyers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/lawyers/verified');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Assuming the API returns an array of lawyer objects
        // And we need to map them to the structure expected by LawyerCard and LawyerProfile
        const transformedData = data.map(lawyer => ({
          id: lawyer.userId, // Assuming 'userId' from backend maps to 'id'
          name: `${lawyer.Fname} ${lawyer.Lname}`, // Combine Fname and Lname
          specialty: lawyer.specialization && lawyer.specialization.length > 0 ? lawyer.specialization.join(', ') : 'Not specified', // Join specializations or provide default
          location: `${lawyer.city}, ${lawyer.province}`, // Combine city and province
          rating: lawyer.rating || 0, // Provide default if not present
          experience: lawyer.experience ? `${lawyer.experience} years` : 'N/A',
          // caseType: 'N/A', // This field is not directly available from the backend snippet
          fee: lawyer.consultationFee ? `₱${lawyer.consultationFee}/hour` : 'N/A', // Assuming consultationFee exists
          image: `${lawyer.Fname ? lawyer.Fname[0] : ''}${lawyer.Lname ? lawyer.Lname[0] : ''}`.toUpperCase(), // Initials for image
          about: lawyer.bio || 'No biography available.', // Assuming bio exists
          education: lawyer.education || 'Not specified', // Assuming education exists
          areas: lawyer.specialization || [], // Assuming specialization is an array
          // Add other fields as necessary, mapping from backend lawyer entity
        }));
        setFetchedLawyers(transformedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch verified lawyers:", err);
        setError(err.message);
        setFetchedLawyers([]); // Set to empty array on error to avoid issues with map
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedLawyers();
  }, []);

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
                lawyers={fetchedLawyers} // Use fetchedLawyers
                onLawyerSelect={handleLawyerSelect}
              />
            ) : (
              <AIMatching 
                lawyers={fetchedLawyers} // Use fetchedLawyers
                onLawyerSelect={handleLawyerSelect}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};