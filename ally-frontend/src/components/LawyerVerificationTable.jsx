import React, { useState, useEffect } from 'react';
import { Eye, Loader2, FileText, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../services/adminService';

// Utility function for proper text capitalization
const capitalizeText = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const LawyerVerificationTable = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState('All Requests');
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchLawyers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getAllLawyers();
      const mapped = data.map(lawyer => ({
        id: lawyer.userId,
        firstName: capitalizeText(lawyer.firstName || lawyer.Fname),
        lastName: capitalizeText(lawyer.lastName || lawyer.Lname),
        name: `${capitalizeText(lawyer.firstName || lawyer.Fname)} ${capitalizeText(lawyer.lastName || lawyer.Lname)}`,
        email: lawyer.email,
        barNumber: lawyer.barNumber,
        practiceAreas: (lawyer.specialization || []).map(area => capitalizeText(area)),
        submittedDate: lawyer.createdAt || '',
        status: lawyer.status || 'pending',
        phoneNumber: lawyer.phoneNumber,
        address: capitalizeText(lawyer.address),
        city: capitalizeText(lawyer.city),
        province: capitalizeText(lawyer.province),
        zipCode: lawyer.zipCode,
        yearsOfExperience: lawyer.yearsOfExperience,
        credentials: lawyer.credentials,
        profilePhoto: lawyer.profilePhoto,
        // Additional fields for profile
        successRate: lawyer.successRate || 95,
        casesHandled: lawyer.casesHandled || 0,
        // Additional fields for credentials
        degree: lawyer.degree || 'Bachelor of Laws',
        graduationYear: lawyer.graduationYear,
        academicHonors: lawyer.academicHonors,
        yearAdmitted: lawyer.yearAdmitted,
        jurisdiction: lawyer.jurisdiction || 'Philippines'
      }));
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
      
      toast.success('Lawyer Verification Approved Successfully');
      
      // Refresh the list after a short delay
      setTimeout(() => {
        fetchLawyers();
      }, 1000);
    } catch (error) {
      console.error('Error approving lawyer:', error);
      toast.error('Failed to Approve Lawyer Verification');
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
      
      toast.success('Lawyer Verification Rejected');
      
      // Refresh the list after a short delay
      setTimeout(() => {
        fetchLawyers();
      }, 1000);
    } catch (error) {
      console.error('Error rejecting lawyer:', error);
      toast.error('Failed to Reject Lawyer Verification');
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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading Verification Requests...</span>
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
                {currentItems.map((request) => (
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
                        {capitalizeText(request.status)}
                      </span>
                    </td>
                    <td className="px-2 py-3 sm:px-4">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={() => handleViewLawyer(request)}
                          className="w-full px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 sm:w-auto flex items-center justify-center"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
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
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No Requests Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredRequests.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {indexOfFirstItem + 1} to{' '}
                  {Math.min(indexOfLastItem, filteredRequests.length)} of{' '}
                  {filteredRequests.length} results
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Combined Verification Modal */}
      {selectedLawyer && (
        <CombinedVerificationModal
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
      )}
    </>
  );
};

// Combined Verification Modal Component
const CombinedVerificationModal = ({ lawyer, isOpen, onClose, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Lawyer Verification Review
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-600 transition-colors duration-200 hover:text-gray-900 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Basic Information
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'credentials'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('credentials')}
            >
              Credentials & Documents
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {activeTab === 'details' ? (
              <LawyerDetailsContent lawyer={lawyer} />
            ) : (
              <LawyerCredentialsContent lawyer={lawyer} />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-4 border-t border-gray-200">
            <button
              onClick={onReject}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
            >
              Reject
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Components
const LawyerDetailsContent = ({ lawyer }) => {
  return (
    <div className="space-y-8">
      {/* Profile Overview */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">First Name</label>
            <p className="mt-1 text-gray-900">{capitalizeText(lawyer.firstName)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Last Name</label>
            <p className="mt-1 text-gray-900">{capitalizeText(lawyer.lastName)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email Address</label>
            <p className="mt-1 text-gray-900">{lawyer.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Phone Number</label>
            <p className="mt-1 text-gray-900">{lawyer.phoneNumber || 'Not Provided'}</p>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Address</label>
            <p className="mt-1 text-gray-900">{capitalizeText(lawyer.address) || 'Not Provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">City</label>
            <p className="mt-1 text-gray-900">{capitalizeText(lawyer.city) || 'Not Provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Province</label>
            <p className="mt-1 text-gray-900">{capitalizeText(lawyer.province) || 'Not Provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">ZIP Code</label>
            <p className="mt-1 text-gray-900">{lawyer.zipCode || 'Not Provided'}</p>
          </div>
        </div>
      </div>

      {/* Professional Overview */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Overview</h4>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Areas of Practice</label>
          <div className="flex flex-wrap gap-2">
            {lawyer.practiceAreas?.length > 0 ? (
              lawyer.practiceAreas.map((area, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {capitalizeText(area)}
                </span>
              ))
            ) : (
              <span className="text-gray-500">No areas specified</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LawyerCredentialsContent = ({ lawyer }) => {
  const handleViewDocument = (file) => {
    if (typeof file === 'string') {
      window.open(file, '_blank');
    } else if (file && file.url) {
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className="space-y-8">
      {/* Education Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Educational Background</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Institution</label>
            <p className="mt-1 text-gray-900">{lawyer.educationInstitution || 'Not Specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Degree</label>
            <p className="mt-1 text-gray-900">{lawyer.degree || 'Bachelor of Laws'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Graduation Year</label>
            <p className="mt-1 text-gray-900">{lawyer.graduationYear || 'Not Specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Academic Honors</label>
            <p className="mt-1 text-gray-900">{lawyer.academicHonors || 'None Specified'}</p>
          </div>
        </div>
      </div>

      {/* Bar License Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Bar License Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Bar License Number</label>
            <p className="mt-1 text-gray-900">{lawyer.barNumber || 'Not Provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Year Admitted</label>
            <p className="mt-1 text-gray-900">{lawyer.yearAdmitted || 'Not Specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Jurisdiction</label>
            <p className="mt-1 text-gray-900">{lawyer.jurisdiction || 'Philippines'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">License Status</label>
            <div className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h4>
        <div className="space-y-4">
          {lawyer.credentials ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">Bar License Certificate</h5>
                  <p className="text-sm text-gray-500">
                    {typeof lawyer.credentials === 'string' 
                      ? lawyer.credentials 
                      : lawyer.credentials.name}
                  </p>
                </div>
                <button 
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  onClick={() => handleViewDocument(lawyer.credentials)}
                >
                  View Document
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No Documents Uploaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerVerificationTable;
