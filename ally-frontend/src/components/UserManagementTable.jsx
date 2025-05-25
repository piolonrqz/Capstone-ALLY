import React, { useState } from 'react';

const UserManagementTable = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState('All Users');
  
  // Sample data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'client',
      joinDate: '2025-03-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Elena Martinez',
      email: 'elena.m@example.com',
      role: 'lawyer',
      joinDate: '2025-04-20',
      status: 'active'
    }
  ]);

  const handleDeactivate = (id) => {
    setUsers(currentUsers =>
      currentUsers.map(user =>
        user.id === id ? { ...user, status: 'inactive' } : user
      )
    );
  };

  const handleActivate = (id) => {
    setUsers(currentUsers =>
      currentUsers.map(user =>
        user.id === id ? { ...user, status: 'active' } : user
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
          <h2 className="text-lg font-semibold">Users List</h2>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              Add User
            </button>
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
                    {['All Users', 'Clients', 'Lawyers', 'Active', 'Inactive'].map((option) => (
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
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      user.role === 'lawyer' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.joinDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(user.id)}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Activate
                        </button>
                      )}
                      <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                        Edit
                      </button>
                    </div>
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

export default UserManagementTable;
