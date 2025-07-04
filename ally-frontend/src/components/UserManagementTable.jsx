import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, MoreVertical, Trash2, UserCheck, UserX, Download, UserPlus, RefreshCw, Edit, Key, Ban, Mail, AlertTriangle } from 'lucide-react';
import { userService } from '../services/userService';
import { adminService } from '../services/adminService';

const UserManagementTable = ({ onAddUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    verificationStatus: 'all'
  });
  const [sort, setSort] = useState({ field: 'joinDate', direction: 'desc' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Create a ref for the fetchUsers function
  const fetchUsersRef = useRef(null);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      const formattedUsers = data.map(user => ({
        id: user.userId,
        name: `${user.fname} ${user.lname}`,
        email: user.email,
        role: user.accountType?.toLowerCase() || 'client',
        joinDate: user.createdAt || new Date().toISOString(),
        status: user.status || 'active',
        verificationStatus: user.credentialsVerified ? 'verified' : 'pending',
        avatar: `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`
      }));
      setUsers(formattedUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load users. Please try again later.');
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Store the fetchUsers function in the ref
  fetchUsersRef.current = fetchUsers;

  // Make the fetchUsers function available globally for the modal
  useEffect(() => {
    window.userTableRef = { current: { fetchUsers } };
    return () => {
      delete window.userTableRef;
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (e) => {
    setSelectedUsers(e.target.checked ? users.map(user => user.id) : []);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async (action) => {
    try {
      switch (action) {
        case 'activate':
          await userService.bulkUpdateStatus(selectedUsers, 'active');
          break;
        case 'deactivate':
          await userService.bulkUpdateStatus(selectedUsers, 'inactive');
          break;
        case 'delete':
          await Promise.all(selectedUsers.map(id => userService.deleteUser(id)));
          break;
        case 'export':
          await userService.exportUsers({ userIds: selectedUsers });
          break;
        default:
          break;
      }
      fetchUsers(); // Refresh the list
      setSelectedUsers([]); // Clear selection
    } catch (err) {
      console.error(`Failed to perform bulk action ${action}:`, err);
      setError(`Failed to perform bulk ${action}. Please try again later.`);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'LAWYER':
        return 'bg-blue-100 text-blue-800';
      case 'CLIENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAction = async (action, userId) => {
    try {
      switch (action) {
        case 'edit':
          // TODO: Implement edit action when form is ready
          console.log('Edit user:', userId);
          break;
        case 'resetPassword':
          // TODO: Implement reset password when endpoint is available
          console.log('Reset password for user:', userId);
          break;
        case 'activate':
          await userService.updateUserStatus(userId, 'active');
          break;
        case 'deactivate':
          await userService.updateUserStatus(userId, 'inactive');
          break;
        case 'delete':
          await userService.deleteUser(userId);
          break;
        default:
          break;
      }
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error(`Failed to perform action ${action}:`, err);
      setError(`Failed to perform ${action}. Please try again later.`);
    }
    setActiveDropdown(null);
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filters.role === 'all' || user.role.toLowerCase() === filters.role.toLowerCase();
      const matchesStatus = filters.status === 'all' || user.status === filters.status;
      const matchesVerification = filters.verificationStatus === 'all' || 
                                 (user.role.toLowerCase() === 'lawyer' ? user.verificationStatus === filters.verificationStatus : true);
      
      return matchesSearch && matchesRole && matchesStatus && matchesVerification;
    })
    .sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1;
      if (sort.field === 'name') {
        return direction * a.name.localeCompare(b.name);
      }
      if (sort.field === 'joinDate') {
        return direction * (new Date(a.joinDate) - new Date(b.joinDate));
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">Users</h2>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
              {users.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onAddUser}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </button>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${refreshing ? 'opacity-50' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="lawyer">Lawyers</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filters.verificationStatus}
              onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Verification Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
            <span className="text-sm text-blue-700 font-medium">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <UserX className="w-4 h-4 mr-1" />
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  User
                  {sort.field === 'name' && (
                    sort.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('joinDate')}
              >
                <div className="flex items-center">
                  Join Date
                  {sort.field === 'joinDate' && (
                    sort.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center`}>
                      <span className="text-sm font-medium text-white">{user.avatar}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.joinDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    {activeDropdown === user.id && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveDropdown(null)}
                        />
                        
                        {/* Dropdown menu */}
                        <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => handleAction('edit', user.id)}
                            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-2 text-gray-400" />
                            Edit Details
                          </button>
                          
                          <button
                            onClick={() => handleAction('resetPassword', user.id)}
                            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <Key className="w-4 h-4 mr-2 text-gray-400" />
                            Reset Password
                          </button>

                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleAction('deactivate', user.id)}
                              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Ban className="w-4 h-4 mr-2 text-red-400" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction('activate', user.id)}
                              className="w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center"
                            >
                              <UserCheck className="w-4 h-4 mr-2 text-green-400" />
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() => handleAction('delete', user.id)}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center border-t border-gray-100"
                          >
                            <Trash2 className="w-4 h-4 mr-2 text-red-400" />
                            Delete User
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <UserX className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;
