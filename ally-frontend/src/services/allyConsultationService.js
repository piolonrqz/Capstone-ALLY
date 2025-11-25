import axios from 'axios';

// Use VITE_API_BASE_URL if available, otherwise fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api/chat/prompt`;

export const sendConsultationMessage = async (message, useRAG = false) => {
  try {
    const response = await axios.post(API_URL, 
      { 
        message,
        useRAG
      }, 
      {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json',
      }
    );

    // Handle successful response (200 OK)
    return parseResponseData(response.data);
    
  } catch (error) {
    console.error('Error sending consultation message:', error);
    
    // CRITICAL FIX: Handle error responses (400, 500, etc.)
    if (error.response && error.response.data) {
      // Backend sent a structured error response (ChatResponse with rejection message)
      return parseResponseData(error.response.data);
    }
    
    // Network error or other issues
    throw error;
  }
};

// Helper function to parse response data consistently
const parseResponseData = (data) => {
  // New ChatResponse format (your backend's format)
  if (data && typeof data === 'object' && data.response !== undefined) {
    return {
      response: data.response,
      relevantCases: data.relevantCases || null,
      caseCount: data.caseCount || 0,
      confidence: data.confidence || null,
      ragEnabled: data.ragEnabled || false,
      timestamp: data.timestamp
    };
  }
  
  // Legacy Gemini format
  if (data && data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      return {
        response: candidate.content.parts[0].text,
        relevantCases: null,
        caseCount: 0,
        confidence: null,
        ragEnabled: false
      };
    }
  }
  
  // Plain string response
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return parseResponseData(parsed);
    } catch (e) {
      return {
        response: data,
        relevantCases: null,
        caseCount: 0,
        confidence: null,
        ragEnabled: false
      };
    }
  }
  
  // Fallback: stringify unknown format
  return {
    response: JSON.stringify(data),
    relevantCases: null,
    caseCount: 0,
    confidence: null,
    ragEnabled: false
  };
};

// Check RAG service health
export const checkRagHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/chat/health`);
    return response.data.ragService === 'running';
  } catch (error) {
    console.error('Error checking RAG health:', error);
    return false;
  }
};