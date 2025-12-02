import axios from 'axios';

// Use VITE_API_BASE_URL if available, otherwise fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api/chat/prompt`;

export const sendConsultationMessage = async (message, useRAG = false) => {
  try {
    const response = await axios.post(API_URL, 
      { 
        message,
        useRAG  // NEW: Send RAG flag
      }, 
      {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json',  // Changed from 'text' to 'json' to handle new response format
      }
    );

    // NEW: Handle ChatResponse object format
    if (response.data && typeof response.data === 'object') {
      // Check if it's the new ChatResponse format with RAG data
      if (response.data.response !== undefined) {
        return {
          response: response.data.response,
          relevantCases: response.data.relevantCases || null,
          caseCount: response.data.caseCount || 0,
          confidence: response.data.confidence || null,
          ragEnabled: response.data.ragEnabled || false,
          timestamp: response.data.timestamp
        };
      }
      
      // Legacy format: Try to extract from Gemini JSON structure
      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
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
    }

    // If backend returns a plain string
    if (typeof response.data === 'string') {
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(response.data);
        
        // New ChatResponse format
        if (parsed.response !== undefined) {
          return {
            response: parsed.response,
            relevantCases: parsed.relevantCases || null,
            caseCount: parsed.caseCount || 0,
            confidence: parsed.confidence || null,
            ragEnabled: parsed.ragEnabled || false,
            timestamp: parsed.timestamp
          };
        }
        
        // Gemini format
        if (parsed.candidates && parsed.candidates.length > 0) {
          const candidate = parsed.candidates[0];
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
      } catch (e) {
        // Not JSON, return as plain text in response format
        return {
          response: response.data,
          relevantCases: null,
          caseCount: 0,
          confidence: null,
          ragEnabled: false
        };
      }
      
      // Fallback: return string as response
      return {
        response: response.data,
        relevantCases: null,
        caseCount: 0,
        confidence: null,
        ragEnabled: false
      };
    }
    
    // Last resort: stringify
    return {
      response: JSON.stringify(response.data),
      relevantCases: null,
      caseCount: 0,
      confidence: null,
      ragEnabled: false
    };
    
  } catch (error) {
    console.error('Error sending consultation message:', error);
    throw error; // Let the component handle the error
  }
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