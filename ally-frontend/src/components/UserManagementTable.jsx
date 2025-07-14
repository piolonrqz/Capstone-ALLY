import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Trash2, UserCheck, UserX, Download, UserPlus, RefreshCw, Edit, Eye, AlertTriangle, X } from 'lucide-react';
import { userService } from '../services/userService';
import { adminService } from '../services/adminService';
import useDebounce from '../hooks/useDebounce';
import UserProfileModal from './UserProfileModal';
import { toast } from 'react-toastify';

// Text formatting helpers
const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatName = (name) => {
  if (!name) return 'No Name Provided';
  return name.split(' ')
    .map(word => capitalizeFirstLetter(word))
    .join(' ');
};

const formatLocation = (city, province) => {
  const formattedCity = city?.split(' ')
    .map(word => capitalizeFirstLetter(word))
    .join(' ');
  const formattedProvince = province?.split(' ')
    .map(word => capitalizeFirstLetter(word))
    .join(' ');

  return [formattedCity, formattedProvince].filter(Boolean).join(', ');
};

const formatRole = (role) => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

const formatStatus = (status) => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const formatSpecialization = (spec) => {
  if (!spec) return '';
  return spec.split(/(?=[A-Z])/).map(word => capitalizeFirstLetter(word)).join(' ');
};

// Modal Components
const ViewUserModal = ({ user, onClose }) => {
  if (!user) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">User Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Role</label>
            <p className="font-medium capitalize">{user.role}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Join Date</label>
            <p className="font-medium">
              {new Date(user.joinDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <p className="font-medium capitalize">{user.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditUserModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'client',
    status: user?.status || 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      onClose();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit User</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="client">Client</option>
              <option value="lawyer">Lawyer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ user, onClose, onConfirm }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-center">Delete User</h2>
        <p className="mb-6 text-center text-gray-500">
          Are you sure you want to delete {user.name}? This action cannot be undone.
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  // Replace viewUser state with selectedUser for profile view
  const [selectedUser, setSelectedUser] = useState(null);

  // Debounced values
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);

  // Create a ref for the fetchUsers function
  const fetchUsersRef = useRef(null);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllUsers();
      const formattedUsers = data.map(user => ({
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName,
        email: user.email,
        role: user.accountType?.toLowerCase() || 'client',
        joinDate: user.createdAt || new Date().toISOString(),
        status: user.status || (user.isVerified ? 'active' : 'inactive'),
        verificationStatus: user.verificationStatus || (user.credentialsVerified ? 'verified' : 'pending'),
        // Additional fields
        phoneNumber: user.phoneNumber || user.phone,
        address: user.address,
        city: user.city,
        province: user.province,
        zipCode: user.zipCode,
        // Lawyer specific fields
        barNumber: user.barNumber,
        yearsOfExperience: user.yearsOfExperience || user.experience,
        specialization: user.specialization,
        practiceAreas: user.specialization || [],
        credentials: user.credentials,
        educationInstitution: user.educationInstitution,
        casesHandled: user.casesHandled,
        // Image
        image: user.profilePhoto || user.image,
        accountStatus: user.status,
        // Full details flag
        fullDetails: user.fullDetails
      }));
      setUsers(formattedUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load users. Please try again later.');
      setUsers([]); // Set empty array on error
      // Show toast notification
      toast.error(err.message || 'Failed to load users');
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
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      switch (action) {
        case 'view':
          setSelectedUser(user);
          break;
        case 'edit':
          setEditUser(user);
          break;
        case 'delete':
          setDeleteUser(user);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Failed to perform action ${action}:`, err);
      setError(`Failed to perform ${action}. Please try again later.`);
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      // Split the name into first and last name
      const [fname, ...lastNames] = formData.name.split(' ');
      const lname = lastNames.join(' ');

      await userService.updateUser(editUser.id, {
        fname,
        lname,
        email: formData.email,
        accountType: formData.role.toUpperCase(),
        isVerified: formData.status === 'active'
      });

      await fetchUsers(); // Refresh the list
      setError(null);
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user. Please try again later.');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteUser(deleteUser.id);
      await fetchUsers(); // Refresh the list
      setDeleteUser(null);
      setError(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user. Please try again later.');
    }
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
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="mb-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">Unable to Load Users</h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={fetchUsers}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reload Page
            </button>
          </div>
        </div>
        <div className="w-full max-w-2xl p-4 text-sm text-gray-600 rounded-lg bg-gray-50">
          <p className="mb-2 font-medium">Troubleshooting Tips:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Check your internet connection</li>
            <li>Verify that the backend server is running</li>
            <li>Make sure you're logged in with valid credentials</li>
            <li>If the problem persists, contact technical support</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-800">Users</h2>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                {users.length} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onAddUser}
                className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
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
          <div className="flex flex-col gap-4 mt-6 lg:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm !== debouncedSearchTerm && (
                  <span className="absolute text-xs text-gray-400 transform -translate-y-1/2 right-3 top-1/2">
                    Searching...
                  </span>
                )}
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
              {JSON.stringify(filters) !== JSON.stringify(debouncedFilters) && (
                <span className="self-center text-xs text-gray-400">
                  Updating...
                </span>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between p-3 mt-4 border border-blue-100 rounded-lg bg-blue-50">
              <span className="text-sm font-medium text-blue-700">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-green-700 rounded-lg bg-green-50 hover:bg-green-100"
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-red-700 rounded-lg bg-red-50 hover:bg-red-100"
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
                    className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th
                  className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    User
                    {sort.field === 'name' && (
                      sort.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Role</th>
                <th className="hidden px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell">Bar Number</th>
                <th className="hidden px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:table-cell">Location</th>
                <th
                  className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                  onClick={() => handleSort('joinDate')}
                >
                  <div className="flex items-center">
                    Join Date
                    {sort.field === 'joinDate' && (
                      sort.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center`}>
                        {user.image ? (
                          <img src={user.image} alt="Profile" className="object-cover w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatName(user.name)}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                      {formatRole(user.role)}
                    </span>
                    {user.role === 'lawyer' && user.specialization && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.specialization.slice(0, 2).map((area, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                            {formatSpecialization(area)}
                          </span>
                        ))}
                        {user.specialization.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                            +{user.specialization.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.role === 'lawyer' ? (user.barNumber || 'Not Provided') : '-'}
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 lg:table-cell whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatLocation(user.city, user.province) || 'No Location'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(user.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${user.status === 'active' || user.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {formatStatus(user.status)}
                    </span>
                    {user.role === 'lawyer' && (
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs
                          ${user.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 
                            user.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {formatStatus(user.verificationStatus)}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleAction('view', user.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-blue-600"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleAction('edit', user.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        title="Edit User"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleAction('delete', user.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-red-600"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center">
              <UserX className="w-12 h-12 mb-4 text-gray-400" />
              <h3 className="mb-1 text-lg font-medium text-gray-900">No users found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </div>

      {/* Replace ViewUserModal with UserProfileModal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          isAdminView={true}
          onEdit={(user) => handleAction('edit', user.id)}
          onDelete={(user) => handleAction('delete', user.id)}
          onStatusChange={(user, status) => handleAction(status === 'active' ? 'activate' : 'deactivate', user.id)}
          onResetPassword={(user) => handleAction('resetPassword', user.id)}
        />
      )}
      
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdate={handleUpdateUser}
        />
      )}
      
      {deleteUser && (
        <DeleteConfirmationModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default UserManagementTable;
