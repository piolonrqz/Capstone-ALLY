// Case service for handling legal case API calls
import { getAuthData } from '../utils/auth.jsx';

const API_BASE_URL = 'http://localhost:8080/Cases';

export const caseService = {
  // Get cases for a client
  getClientCases: async (clientId) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/client/${clientId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch client cases');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching client cases:', error);
      throw error;
    }
  },

  // Get cases for a lawyer
  getLawyerCases: async (lawyerId) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/lawyer/${lawyerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lawyer cases');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching lawyer cases:', error);
      throw error;
    }
  },

  // Create a new case
  createCase: async (clientId, caseData) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/create/${clientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      });

      if (!response.ok) {
        throw new Error('Failed to create case');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating case:', error);
      throw error;
    }
  },

  // Update case status
  updateCaseStatus: async (caseId, status) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/${caseId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      });

      if (!response.ok) {
        throw new Error('Failed to update case status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating case status:', error);
      throw error;
    }
  },
  // Accept a case (for lawyers)
  acceptCase: async (caseId) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/${caseId}/accept/${authData.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept case');
      }

      return await response.json();
    } catch (error) {
      console.error('Error accepting case:', error);
      throw error;
    }
  },

  // Decline a case (for lawyers)
  declineCase: async (caseId) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/${caseId}/decline`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to decline case');
      }

      return await response.json();
    } catch (error) {
      console.error('Error declining case:', error);
      throw error;
    }
  },
};
