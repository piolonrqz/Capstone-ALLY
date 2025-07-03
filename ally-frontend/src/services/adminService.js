import axios from 'axios';
import { userService } from './userService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const adminService = {
  // Admin Dashboard Statistics
  async getAdminStats() {
    try {
      const stats = await userService.getUserStats();
      return stats;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

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
      const response = await axios.put(`${API_URL}/admins/lawyers/verify/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying lawyer:', error);
      throw error;
    }
  },

  // System Management
  async updateSystemSettings(settings) {
    try {
      const response = await axios.put(`${API_URL}/admin/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  },

  async getSystemSettings() {
    try {
      const response = await axios.get(`${API_URL}/admin/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  },

  // Case Management
  async getCaseStats() {
    try {
      const response = await axios.get(`${API_URL}/admin/cases/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching case statistics:', error);
      throw error;
    }
  },

  // User Management (Admin-specific operations)
  async updateUserRole(userId, newRole) {
    try {
      const response = await axios.put(`${API_URL}/admin/users/${userId}/role`, { role: newRole });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  async getUserAuditLog(userId) {
    try {
      const response = await axios.get(`${API_URL}/admin/users/${userId}/audit-log`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user audit log:', error);
      throw error;
    }
  }
};

export default adminService; 