import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - user doesn't have required permissions
          console.error('Access denied:', error.response.data);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data);
          break;
        default:
          console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export const userService = {
  // Get all users with optional filters
  async getUsers(filters = {}) {
    try {
      const response = await axios.get(`${API_URL}/users/all`, { 
        params: filters,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Map the response data to match the expected format
      return response.data.map(user => ({
        userId: user.userId,
        fname: user.Fname || user.fname,
        lname: user.Lname || user.lname,
        email: user.email,
        accountType: user.accountType,
        createdAt: user.createdAt,
        isVerified: user.isVerified,
        status: user.isVerified ? 'active' : 'inactive',
        credentialsVerified: user.credentialsVerified
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 404) {
        return []; // Return empty array instead of throwing error
      } else if (error.response?.status === 401) {
        throw new Error('Please log in to access this resource');
      } else if (!error.response) {
        throw new Error('Unable to connect to the server. Please check your connection and try again.');
      }
      throw error;
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const response = await axios.get(`${API_URL}/users/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  },

  // Update user status (activate/deactivate)
  async updateUserStatus(userId, status) {
    try {
      const response = await axios.put(`${API_URL}/users/status/${userId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await axios.delete(`${API_URL}/users/deleteUser${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Bulk update user status
  async bulkUpdateStatus(userIds, status) {
    try {
      const response = await axios.put(`${API_URL}/users/bulk-status`, { userIds, status });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      throw error;
    }
  },

  // Export users data
  async exportUsers(filters = {}) {
    try {
      const response = await axios.get(`${API_URL}/users/export`, {
        params: filters,
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  },

  // Get user details
  async getUserDetails(userId) {
    try {
      const response = await axios.get(`${API_URL}/users/getUser/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  // Update user verification status (for lawyers)
  async updateVerificationStatus(userId, status) {
    try {
      const response = await axios.put(`${API_URL}/users/verify/${userId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  }
};

export default userService; 