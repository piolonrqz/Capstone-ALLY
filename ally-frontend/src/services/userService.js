import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const userService = {
  // Get all users with optional filters
  async getUsers(filters = {}) {
    try {
      const response = await axios.get(`${API_URL}/users/getAll`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
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