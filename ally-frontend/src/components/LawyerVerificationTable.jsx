import React, { useState } from 'react';

const LawyerVerificationTable = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState('All Requests');
  
  // Sample data
  const [verificationRequests, setVerificationRequests] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      barNumber: 'CA87654321',
      practiceAreas: ['Family Law', 'Immigration'],
      submittedDate: '2025-05-10',
      status: 'approved'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      email: 'michael@example.com',
      barNumber: 'TX12345678',
      practiceAreas: ['Criminal Defense', 'Civil Rights'],
      submittedDate: '2025-05-10',
      status: 'pending'
    }
  ]);

  const handleApprove = (id) => {
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

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Verification Requests</h2>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="px-3 py-1.5 border rounded-md flex items-center text-sm"
            >
              {filter} <span className="ml-2">▼</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-10">
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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bar Number</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Practice Areas</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {verificationRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">{request.name}</div>
                      <div className="text-xs text-gray-500">{request.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{request.barNumber}</td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LawyerVerificationTable;
