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

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.clear();
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - user doesn't have necessary permissions
          console.error('Access forbidden:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  // Lawyer Verification Operations
  async getUnverifiedLawyers() {
    try {
      const response = await axios.get(`${API_URL}/lawyers/unverified`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unverified lawyers:', error);
      throw error;
    }
  },

  async getVerifiedLawyers() {
    try {
      const response = await axios.get(`${API_URL}/lawyers/verified`);
      return response.data;
    } catch (error) {
      console.error('Error fetching verified lawyers:', error);
      throw error;
    }
  },

  async verifyLawyer(id) {
    try {
      // Update lawyer verification status through admin endpoint
      const response = await axios.put(`${API_URL}/admins/lawyers/verify/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying lawyer:', error);
      throw error;
    }
  },

  async rejectLawyer(id) {
    try {
      // Update lawyer verification status through admin endpoint
      const response = await axios.put(`${API_URL}/admins/lawyers/reject/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting lawyer:', error);
      throw error;
    }
  },

  async getLawyerDetails(id) {
    try {
      const response = await axios.get(`${API_URL}/lawyers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lawyer details:', error);
      throw error;
    }
  },

  // Statistics
  async getVerificationStats() {
    try {
      // Get all lawyers
      const [unverified, verified] = await Promise.all([
        axios.get(`${API_URL}/lawyers/unverified`),
        axios.get(`${API_URL}/lawyers/verified`)
      ]);

      // Calculate statistics
      return {
        pending: unverified.data.length || 0,
        verified: verified.data.length || 0,
        rejected: 0 // We'll need to add this endpoint or filter from the response
      };
    } catch (error) {
      console.error('Error fetching verification stats:', error);
      throw error;
    }
  }
}; 