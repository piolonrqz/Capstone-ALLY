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
      // Get all users from admin endpoint
      const response = await axios.get(`${API_URL}/users/all`);
      
      // Get both verified and unverified lawyers
      const [verifiedLawyers, unverifiedLawyers] = await Promise.all([
        axios.get(`${API_URL}/lawyers/verified`),
        axios.get(`${API_URL}/lawyers/unverified`)
      ]);

      // Combine all lawyers and create a map
      const allLawyers = [...verifiedLawyers.data, ...unverifiedLawyers.data];
      const lawyersMap = new Map(
        allLawyers.map(lawyer => [lawyer.userId, lawyer])
      );

      return response.data.map(user => {
        const isLawyer = user.accountType === 'LAWYER';
        const lawyerDetails = isLawyer ? lawyersMap.get(user.id) : null;

        return {
          userId: user.id,
          fname: user.Fname || user.firstName,
          lname: user.Lname || user.lastName,
          email: user.email,
          accountType: user.accountType,
          createdAt: user.createdAt,
          isVerified: user.isVerified,
          status: user.isVerified ? 'active' : 'inactive',
          credentialsVerified: user.credentialsVerified,
          // Additional fields
          phoneNumber: user.phoneNumber || user.phone,
          address: user.address,
          city: user.city,
          province: user.province,
          zipCode: user.zipCode,
          // Lawyer specific fields (from lawyerDetails if available)
          ...(isLawyer && lawyerDetails ? {
            barNumber: lawyerDetails.barNumber,
            yearsOfExperience: lawyerDetails.experience,
            specialization: lawyerDetails.specialization || [],
            practiceAreas: lawyerDetails.specialization || [],
            credentials: lawyerDetails.credentials,
            educationInstitution: lawyerDetails.educationInstitution,
            casesHandled: lawyerDetails.casesHandled || 0,
          } : {}),
          // Image
          image: user.profilePhoto || user.image,
          // Additional status fields
          verificationStatus: user.verificationStatus,
          accountStatus: user.status
        };
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      // Check if it's a network error
      if (!error.response) {
        throw new Error('Network error - please check your connection');
      }
      // Check if it's an authentication error
      if (error.response.status === 401) {
        throw new Error('Authentication error - please log in again');
      }
      // Handle other errors
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
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