import React, { useState, useEffect } from 'react';
import LawyerDetailsModal from './LawyerDetailsModal';
import { Eye } from 'lucide-react';

const LawyerVerificationTable = ({ initialData }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState('All Requests');
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (initialData) {
      // Map initial data to the correct format
      const mapped = initialData.map(lawyer => ({
        id: lawyer.userId,
        firstName: lawyer.firstName,
        lastName: lawyer.lastName,
        name: `${lawyer.firstName} ${lawyer.lastName}`,
        email: lawyer.email,
        barNumber: lawyer.barNumber,
        practiceAreas: lawyer.specialization || [],
        submittedDate: lawyer.createdAt || '',
        status: lawyer.status || 'pending',
        // Include all other fields needed for the modal
        phoneNumber: lawyer.phoneNumber,
        address: lawyer.address,
        city: lawyer.city,
        province: lawyer.province,
        zipCode: lawyer.zipCode,
        yearsOfExperience: lawyer.yearsOfExperience,
        credentials: lawyer.credentials,
        profilePhoto: lawyer.profilePhoto
      }));
      setVerificationRequests(mapped);
    } else {
      // Commented out API call for future use
      /* 
      fetch('http://localhost:8080/lawyers/unverified', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          const mapped = data.map(lawyer => ({  
            id: lawyer.userId,
            name: `${lawyer.firstName} ${lawyer.lastName}`,
            email: lawyer.email,
            barNumber: lawyer.barNumber,
            practiceAreas: lawyer.specialization || [],
            submittedDate: lawyer.createdAt || '',
            status: 'pending',
          }));
          setVerificationRequests(mapped);
        })
        .catch(error => {
          console.error('Failed to fetch unverified lawyers:', error);
        });
      */
    }
  }, [initialData]);

  const handleViewLawyer = (lawyer) => {
    setSelectedLawyer(lawyer);
    setIsModalOpen(true);
  };

  const handleApprove = async (id) => {
    /* Commented out API call for future use
    try {
      const response = await fetch(`http://localhost:8080/admins/lawyers/verify/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify lawyer');
      }
    } catch (error) {
      console.error(error);
      alert('Could not verify lawyer. Please try again later.');
      return;
    }
    */

    setVerificationRequests(requests =>
      requests.map(request =>
        request.id === id ? { ...request, status: 'approved' } : request
      )
    );
  };

  const handleReject = (id) => {
    setVerificationRequests(requests =>
      requests.map(request =>
        request.id === id ? { ...request, status: 'rejected' } : request
      )
    );
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  
  const setFilterOption = (option) => {
    setFilter(option);
    setDropdownOpen(false);
  };

  // Filter requests based on selected filter
  const filteredRequests = verificationRequests.filter(request => {
    if (filter === 'All Requests') return true;
    return request.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-2 sm:p-4">
          <div className="flex flex-col items-start justify-between gap-2 mb-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold">Verification Requests</h2>
            <div className="relative w-full sm:w-auto">
              <button
                onClick={toggleDropdown}
                className="w-full sm:w-auto px-3 py-1.5 border rounded-md flex items-center justify-between text-sm"
              >
                {filter} <span className="ml-2">▼</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 z-10 w-full mt-2 bg-white border rounded-md shadow-lg sm:w-40">
                  <div className="py-1">
                    {['All Requests', 'Pending', 'Approved', 'Rejected'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setFilterOption(option)}
                        className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-4">Name</th>
                    <th scope="col" className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-4 sm:table-cell">Bar Number</th>
                    <th scope="col" className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-4 md:table-cell">Practice Areas</th>
                    <th scope="col" className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-4">Status</th>
                    <th scope="col" className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-2 py-3 sm:px-4">
                        <div>
                          <div className="text-sm font-medium">{request.name}</div>
                          <div className="text-xs text-gray-500">{request.email}</div>
                          {/* Show bar number on mobile as it's hidden in table header */}
                          <div className="mt-1 text-xs text-gray-500 sm:hidden">
                            Bar: {request.barNumber}
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-2 py-3 text-sm sm:px-4 sm:table-cell">{request.barNumber}</td>
                      <td className="hidden px-2 py-3 sm:px-4 md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {request.practiceAreas.map((area) => (
                            <span
                              key={area}
                              className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-2 py-3 sm:px-4">
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-2 py-3 sm:px-4">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            onClick={() => handleViewLawyer(request)}
                            className="w-full px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 sm:w-auto flex items-center justify-center"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="w-full px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600 sm:w-auto"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="w-full px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 sm:w-auto"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <LawyerDetailsModal
        lawyer={selectedLawyer}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLawyer(null);
        }}
        onApprove={() => {
          handleApprove(selectedLawyer.id);
          setIsModalOpen(false);
          setSelectedLawyer(null);
        }}
        onReject={() => {
          handleReject(selectedLawyer.id);
          setIsModalOpen(false);
          setSelectedLawyer(null);
        }}
      />
    </>
  );
};

export default LawyerVerificationTable;
