import React from 'react';
import { X, User, MapPin, Phone, Mail, Briefcase } from 'lucide-react';

// Utility function for proper text capitalization
const capitalizeText = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const LawyerDetailsModal = ({ lawyer, isOpen, onClose, onApprove, onReject }) => {
  if (!isOpen) return null;

  const fullName = `${capitalizeText(lawyer.firstName || '')} ${capitalizeText(lawyer.lastName || '')}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Lawyer Verification Details
            </h3>
            <button
              onClick={onClose}
              className="p-1 ml-auto text-gray-600 transition-colors duration-200 hover:text-gray-900 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Profile Overview */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4">
                    {lawyer.profilePhoto ? (
                      <img 
                        src={lawyer.profilePhoto} 
                        alt={fullName} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      fullName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900">{fullName}</h5>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Verification
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Location Information */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">Location Details</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              ) : (
                <div>
                  {/* Professional Information */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-500">Specialization / Expertise</label>
                          <div className="mt-1">
                            {lawyer.practiceAreas?.map((area, index) => (
                              <span
                                key={index}
                                className="inline-block px-3 py-1 mr-2 mb-2 text-sm rounded-full bg-blue-100 text-blue-800"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Bar License Number</label>
                          <div className="mt-1">{lawyer.barNumber}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Years of Experience</label>
                          <div className="mt-1">{lawyer.experience} years</div>
                        </div>
                      </div>
                    </div>

                    {/* Documentation Section - No space between sections */}
                    <div className="border-t border-gray-200">
                      <div className="p-6">
                        <h3 className="mb-4 text-lg font-semibold">Documentation</h3>
                        {lawyer.credentials ? (
                          <div className="space-y-4">
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-4">
                                <FileText className="w-6 h-6 text-blue-500" />
                                <div className="flex-1">
                                  <h4 className="font-medium">Credentials & Certifications</h4>
                                  <p className="text-sm text-gray-500">
                                    {typeof lawyer.credentials === 'string' 
                                      ? lawyer.credentials 
                                      : lawyer.credentials.name}
                                  </p>
                                </div>
                                <button 
                                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                                  onClick={() => {
                                    // Handle document view/download
                                  }}
                                >
                                  View Document
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-center text-gray-500">No documents uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Actions */}
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

export default LawyerDetailsModal; 