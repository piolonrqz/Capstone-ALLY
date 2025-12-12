import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

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
  // User Management Operations
  async getAllUsers() {
    try {
      // Get all users and lawyers
      const [allUsers, verifiedLawyers, unverifiedLawyers] = await Promise.all([
        axios.get(`${API_URL}/users/all`),
        axios.get(`${API_URL}/lawyers/verified`),
        axios.get(`${API_URL}/lawyers/unverified`)
      ]);

      // Create a map of lawyer details
      const allLawyers = [...verifiedLawyers.data, ...unverifiedLawyers.data];
      const lawyersMap = new Map(
        allLawyers.map(lawyer => [lawyer.userId || lawyer.id, lawyer])
      );

      // Process all users
      return allUsers.data.map(user => {
        const isLawyer = user.accountType === 'LAWYER';
        const lawyerDetails = isLawyer ? lawyersMap.get(user.id) : null;

        // Extract first and last name from email if not provided
        let firstName = user.Fname || user.firstName;
        let lastName = user.Lname || user.lastName;
        
        if ((!firstName || !lastName) && user.email) {
          // Try to extract name from email (e.g., john.doe@gmail.com -> John Doe)
          const emailName = user.email.split('@')[0];
          const nameParts = emailName.split(/[._-]/);
          if (nameParts.length >= 2) {
            firstName = firstName || nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
            lastName = lastName || nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
          }
        }

        return {
          ...user,
          // Ensure consistent name fields
          firstName: firstName || '',
          lastName: lastName || '',
          fullName: `${firstName || ''} ${lastName || ''}`.trim() || 'No name provided',
          // Add lawyer-specific details if available
          ...(isLawyer && lawyerDetails ? {
            barNumber: lawyerDetails.barNumber,
            experience: lawyerDetails.experience,
            specialization: lawyerDetails.specialization || [],
            credentials: lawyerDetails.credentials,
            educationInstitution: lawyerDetails.educationInstitution,
            casesHandled: lawyerDetails.casesHandled || 0,
            status: lawyerDetails.status || 'pending',
            verificationStatus: lawyerDetails.credentialsVerified ? 'verified' : 'pending'
          } : {
            // For non-lawyers
            status: user.isVerified ? 'active' : 'inactive',
            verificationStatus: user.isVerified ? 'verified' : 'pending'
          }),
          fullDetails: isLawyer && lawyerDetails ? true : false
        };
      });
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Lawyer Verification Operations
  async getAllLawyers() {
    try {
      // Get both unverified and verified lawyers
      const [unverified, verified] = await Promise.all([
        axios.get(`${API_URL}/lawyers/unverified`),
        axios.get(`${API_URL}/lawyers/verified`)
      ]);

      // Combine and mark their status
      const unverifiedLawyers = unverified.data.map(lawyer => ({
        ...lawyer,
        status: 'pending',
        verificationStatus: 'pending'
      }));

      const verifiedLawyers = verified.data.map(lawyer => ({
        ...lawyer,
        status: lawyer.status || 'approved',
        verificationStatus: 'verified'
      }));

      return [...unverifiedLawyers, ...verifiedLawyers];
    } catch (error) {
      console.error('Error fetching all lawyers:', error);
      throw error;
    }
  },

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
      const response = await axios.put(`${API_URL}/admins/lawyers/verify/${id}`, {
        status: 'approved',
        credentialsVerified: true
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying lawyer:', error);
      throw error;
    }
  },

  async rejectLawyer(id) {
    try {
      const response = await axios.put(`${API_URL}/admins/lawyers/reject/${id}`, {
        status: 'rejected',
        credentialsVerified: false
      });
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
      const lawyers = await this.getAllLawyers();
      
      // Calculate statistics
      return {
        pending: lawyers.filter(l => l.status === 'pending').length,
        verified: lawyers.filter(l => l.status === 'approved').length,
        rejected: lawyers.filter(l => l.status === 'rejected').length
      };
    } catch (error) {
      console.error('Error fetching verification stats:', error);
      throw error;
    }
  },

  // User Statistics
  async getUserStats() {
    try {
      const users = await this.getAllUsers();
      
      return {
        total: users.length,
        lawyers: users.filter(u => u.accountType === 'LAWYER').length,
        clients: users.filter(u => u.accountType === 'CLIENT').length,
        admins: users.filter(u => u.accountType === 'ADMIN').length,
        active: users.filter(u => u.status === 'active' || u.status === 'approved').length,
        inactive: users.filter(u => u.status === 'inactive' || u.status === 'rejected').length,
        pending: users.filter(u => u.status === 'pending').length
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
};
