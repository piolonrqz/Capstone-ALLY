// Document service for handling document management API calls
import { getAuthData } from '../utils/auth.jsx';

const API_BASE_URL = 'http://localhost:8080/api/documents';

export const documentService = {
  // Get documents for a specific case
  getCaseDocuments: async (caseId) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/case/${caseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to view documents for this case');
        }
        if (response.status === 404) {
          throw new Error('Case not found');
        }
        throw new Error('Failed to fetch case documents');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching case documents:', error);
      throw error;
    }
  },

  // Get document count for a specific case
  getDocumentCount: async (caseId) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        console.error('Not authenticated when trying to get document count');
        return 0;
      }

      const response = await fetch(`${API_BASE_URL}/case/${caseId}/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies if any
      });

      if (!response.ok) {
        if (response.status === 403) {
          console.error('Permission denied when getting document count');
          return 0;
        }
        if (response.status === 401) {
          console.error('Authentication failed when getting document count');
          return 0;
        }
        throw new Error('Failed to fetch document count');
      }

      const count = await response.json();
      return typeof count === 'number' ? count : 0;
    } catch (error) {
      console.error('Error fetching document count:', error);
      return 0;
    }
  },

  // Upload document to a specific case
  uploadDocument: async (clientId, caseId, file, documentMetadata = {}) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      // Validate file size (20MB limit)
      const maxSize = 20 * 1024 * 1024; // 20MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 20MB limit');
      }

      // Validate file type
      const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        throw new Error('File type not allowed. Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', caseId);
      formData.append('documentName', documentMetadata.documentName || file.name);
      formData.append('documentType', documentMetadata.documentType || fileExtension);
      formData.append('status', documentMetadata.status || 'uploaded');

      const response = await fetch(`${API_BASE_URL}/upload/${clientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to upload documents to this case');
        }
        if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(errorText || 'Invalid request - please check your file and try again');
        }
        throw new Error('Failed to upload document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Delete a document
  deleteDocument: async (documentId) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to delete this document');
        }
        if (response.status === 404) {
          throw new Error('Document not found');
        }
        throw new Error('Failed to delete document');
      }

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Download a document
  downloadDocument: async (documentId, documentName) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to download this document');
        }
        if (response.status === 404) {
          throw new Error('Document not found');
        }
        throw new Error('Failed to download document');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName || 'document';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  },

  // Get document details
  getDocumentDetails: async (documentId) => {
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to view this document');
        }
        if (response.status === 404) {
          throw new Error('Document not found');
        }
        throw new Error('Failed to fetch document details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching document details:', error);
      throw error;
    }
  },

  // Utility functions
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  getFileType: (fileName) => {
    return fileName.split('.').pop().toLowerCase();
  },

  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  validateFileType: (fileName) => {
    const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
    const fileExtension = fileName.split('.').pop().toLowerCase();
    return allowedTypes.includes(fileExtension);
  },

  validateFileSize: (fileSize, maxSizeMB = 20) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return fileSize <= maxSizeBytes;
  }
};