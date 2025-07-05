import axios from 'axios';

// Use VITE_API_BASE_URL if available, otherwise fallback to localhost
const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api/chat/prompt';

export const sendConsultationMessage = async (message) => {
  try {
    const response = await axios.post(API_URL, { message }, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text',
    });
    // If backend returns a plain string, return it directly
    if (typeof response.data === 'string') {
      // Try to parse Gemini JSON if it looks like JSON
      try {
        const parsed = JSON.parse(response.data);
        // Gemini format: { candidates: [ { content: { parts: [ { text: ... }] } } ] }
        if (parsed && parsed.candidates && parsed.candidates.length > 0) {
          const candidate = parsed.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            return candidate.content.parts[0].text;
          }
        }
      } catch (e) {
        // Not JSON, just return as is
        return response.data;
      }
      return response.data;
    }
    // If backend returns an object, try to extract text
    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const candidate = response.data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text;
      }
    }
    return JSON.stringify(response.data);
  } catch (error) {
    console.error('Error sending consultation message:', error);
    return "Sorry, I'm having trouble connecting to the legal assistant. Please try again later.";
  }
};