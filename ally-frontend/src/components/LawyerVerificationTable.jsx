import React, { useState, useEffect } from 'react';
import LawyerDetailsModal from './LawyerDetailsModal';
import { Eye, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../services/adminService';

const LawyerVerificationTable = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState('All Requests');
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  const fetchLawyers = async () => {
  try {
    setIsLoading(true);
    setError(null);
    const data = await adminService.getAllLawyers();
    const mapped = data.map(lawyer => {
      const hasCredentials = lawyer.credentials && lawyer.credentials.trim() !== '';
      return {
        id: lawyer.userId,
        firstName: lawyer.firstName || lawyer.Fname,
        lastName: lawyer.lastName || lawyer.Lname,
        name: `${lawyer.firstName || lawyer.Fname} ${lawyer.lastName || lawyer.Lname}`,
        email: lawyer.email,
        barNumber: lawyer.barNumber,
        practiceAreas: lawyer.specialization || [],
        submittedDate: lawyer.createdAt || '',
        status: !hasCredentials ? 'rejected' : (lawyer.status || 'pending'),
        phoneNumber: lawyer.phoneNumber,
        address: lawyer.address,
        city: lawyer.city,
        province: lawyer.province,
        zipCode: lawyer.zipCode,
        experience: lawyer.experience,
        credentials: lawyer.credentials,
        profilePhoto: lawyer.profilePhoto
      };
    });
    setVerificationRequests(mapped);
  } catch (error) {
    console.error('Failed to fetch lawyers:', error);
    setError('Failed to load lawyer verification requests. Please try again later.');
    toast.error('Failed to load lawyer verification requests');
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchLawyers();
  }, []);

  const handleViewLawyer = (lawyer) => {
    setSelectedLawyer(lawyer);
    setIsModalOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      setProcessingIds(prev => new Set([...prev, id]));
      await adminService.verifyLawyer(id);
      
      // Update local state
      setVerificationRequests(requests =>
        requests.map(request =>
          request.id === id ? { ...request, status: 'approved' } : request
        )
      );
      
      toast.success('Lawyer verification approved successfully');
      
      // Refresh the list after a short delay
      setTimeout(() => {
        fetchLawyers();
      }, 1000);
    } catch (error) {
      console.error('Error approving lawyer:', error);
      toast.error('Failed to approve lawyer verification');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingIds(prev => new Set([...prev, id]));
      await adminService.rejectLawyer(id);
      
      // Update local state
      setVerificationRequests(requests =>
        requests.map(request =>
          request.id === id ? { ...request, status: 'rejected' } : request
        )
      );
      
      toast.success('Lawyer verification rejected');
      
      // Refresh the list after a short delay
      setTimeout(() => {
        fetchLawyers();
      }, 1000);
    } catch (error) {
      console.error('Error rejecting lawyer:', error);
      toast.error('Failed to reject lawyer verification');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  
  const setFilterOption = (option) => {
    setFilter(option);
    setDropdownOpen(false);
  };

  const filteredRequests = verificationRequests.filter(request => {
    if (filter === 'All Requests') return true;
    return request.status.toLowerCase() === filter.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading verification requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchLawyers}
          className="mt-2 px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4">
                    Lawyer
                  </th>
                  <th className="hidden px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 sm:table-cell">
                    Bar Number
                  </th>
                  <th className="hidden px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 md:table-cell">
                    Practice Areas
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4">
                    Status
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-2 py-3 sm:px-4">
                      <div>
                        <div className="text-sm font-medium">{request.name}</div>
                        <div className="text-xs text-gray-500">{request.email}</div>
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
                              disabled={processingIds.has(request.id)}
                              className={`w-full px-2 py-1 text-xs text-white rounded sm:w-auto flex items-center justify-center
                                ${processingIds.has(request.id) 
                                  ? 'bg-green-300 cursor-not-allowed' 
                                  : 'bg-green-500 hover:bg-green-600'}`}
                            >
                              {processingIds.has(request.id) ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Processing...
                                </>
                              ) : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={processingIds.has(request.id)}
                              className={`w-full px-2 py-1 text-xs text-white rounded sm:w-auto flex items-center justify-center
                                ${processingIds.has(request.id) 
                                  ? 'bg-red-300 cursor-not-allowed' 
                                  : 'bg-red-500 hover:bg-red-600'}`}
                            >
                              {processingIds.has(request.id) ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Processing...
                                </>
                              ) : 'Reject'}
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

      <LawyerDetailsModal
        lawyer={selectedLawyer}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLawyer(null);
        }}
        onApprove={async () => {
          await handleApprove(selectedLawyer.id);
          setIsModalOpen(false);
          setSelectedLawyer(null);
        }}
        onReject={async () => {
          await handleReject(selectedLawyer.id);
          setIsModalOpen(false);
          setSelectedLawyer(null);
        }}
      />
    </>
  );
};

export default LawyerVerificationTable;
