import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';

const LawyerDetailsModal = ({ lawyer, isOpen, onClose, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState('basic');
  
  if (!isOpen) return null;

  // Format the full name for the header
  const fullName = `${lawyer.firstName || ''} ${lawyer.lastName || ''}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-end p-4">
            <button
              onClick={onClose}
              className="p-1 ml-auto text-gray-600 transition-colors duration-200 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-8 pb-8">
            {/* Profile Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-3">
                <div className="w-24 h-24 overflow-hidden bg-blue-500 rounded-full">
                  {lawyer.profilePhoto ? (
                    <img 
                      src={lawyer.profilePhoto} 
                      alt={fullName} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-2xl text-white">
                      {fullName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                {fullName}
                <span className="px-2 py-0.5 text-sm text-yellow-800 bg-yellow-100 rounded-full">Pending</span>
              </h2>
              <div className="mt-2 text-sm text-green-600">
                <span className="inline-block w-2 h-2 mr-2 bg-green-600 rounded-full"></span>
                Available
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === 'basic'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#EDEDED] text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('basic')}
              >
                Basic Information
              </button>
              <button
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === 'credentials'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#EDEDED] text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('credentials')}
              >
                Credentials
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'basic' ? (
                <div className="p-6 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">First Name</label>
                      <div className="mt-1">{lawyer.firstName}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email Address</label>
                      <div className="mt-1">{lawyer.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Name</label>
                      <div className="mt-1">{lawyer.lastName}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                      <div className="mt-1">{lawyer.phoneNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Address</label>
                      <div className="mt-1">{lawyer.address}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">City</label>
                      <div className="mt-1">{lawyer.city}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Province</label>
                      <div className="mt-1">{lawyer.province}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">ZIP Code</label>
                      <div className="mt-1">{lawyer.zipCode}</div>
                    </div>
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
                          <div className="mt-1">{lawyer.yearsOfExperience} years</div>
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
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 mt-8">
              <button
                onClick={onReject}
                className="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDetailsModal; 