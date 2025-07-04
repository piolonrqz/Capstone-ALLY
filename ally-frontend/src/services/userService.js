import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Add request interceptor for authentication
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

export const userService = {
  async getUserStats() {
    try {
      // Get all users first
      const response = await axios.get(`${API_URL}/users/all`);
      const users = response.data;

      // Calculate statistics
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.isVerified).length,
        inactiveUsers: users.filter(user => !user.isVerified).length,
        totalLawyers: users.filter(user => user.accountType === 'LAWYER').length,
        totalClients: users.filter(user => user.accountType === 'CLIENT').length
      };

      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  async getUsers() {
    try {
      const response = await axios.get(`${API_URL}/users/all`);
      return response.data.map(user => ({
        userId: user.id,
        fname: user.Fname || user.firstName,
        lname: user.Lname || user.lastName,
        email: user.email,
        accountType: user.accountType,
        createdAt: user.createdAt,
        isVerified: user.isVerified,
        status: user.isVerified ? 'active' : 'inactive',
        credentialsVerified: user.credentialsVerified
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getUserById(id) {
    try {
      const response = await axios.get(`${API_URL}/users/getUser/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await axios.put(`${API_URL}/users/update/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      const response = await axios.delete(`${API_URL}/users/deleteUser/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const response = await axios.post(`${API_URL}/users/create`, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUserStatus(userId, status) {
    try {
      const response = await axios.put(`${API_URL}/users/updateStatus/${userId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  async bulkUpdateStatus(userIds, status) {
    try {
      const response = await axios.put(`${API_URL}/users/bulkUpdateStatus`, { userIds, status });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      throw error;
    }
  }
}; 