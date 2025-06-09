// Schedule API service
const API_BASE_URL = 'http://localhost:8080/schedules';

// Helper function to format date and time for backend
const formatDateTime = (date, time) => {
  if (!date || !time) return null;
  
  // Convert time from "HH:MM AM/PM" format to 24-hour format
  const [timeStr, period] = time.split(' ');
  const [hours, minutes] = timeStr.split(':');
  let hour24 = parseInt(hours);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  // Format as yyyy-MM-dd'T'HH:mm:ss
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hourStr = String(hour24).padStart(2, '0');
  const minuteStr = String(minutes).padStart(2, '0');
    return `${year}-${month}-${day}T${hourStr}:${minuteStr}:00`;
};

export const scheduleService = {
  // Create a new appointment booking
  createAppointment: async (bookingData) => {
    try {
      const { lawyerId, clientId, date, time, consultationType, notes } = bookingData;
      
      const startTime = formatDateTime(date, time);
      if (!startTime) {
        throw new Error('Invalid date or time format');
      }
      
      const requestBody = {
        clientId: parseInt(clientId),
        lawyerId: parseInt(lawyerId),
        startTime
      };

      const response = await fetch(`${API_BASE_URL}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create appointment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },
  // Check lawyer availability
  checkAvailability: async (lawyerId, date, time) => {
    try {
      const startTime = formatDateTime(date, time);
      if (!startTime) {
        throw new Error('Invalid date or time format');
      }
      
      // Calculate end time for availability check (1-hour consultation)
      const startDate = new Date(startTime);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const endTime = endDate.toISOString().slice(0, 19).replace('T', 'T');
      
      const params = new URLSearchParams({
        start: startTime,
        end: endTime
      });
      
      const response = await fetch(`${API_BASE_URL}/lawyer/${lawyerId}/availability?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }  },

  // Create a case-based appointment booking
  createCaseAppointment: async (bookingData) => {
    try {
      const { lawyerId, clientId, caseId, date, time, consultationType, notes } = bookingData;
      
      const startTime = formatDateTime(date, time);
      if (!startTime) {
        throw new Error('Invalid date or time format');
      }
      
      const requestBody = {
        clientId: parseInt(clientId),
        caseId: parseInt(caseId),
        startTime
      };

      const response = await fetch(`${API_BASE_URL}/book-for-case`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create case appointment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating case appointment:', error);
      throw error;
    }
  },

  // Get lawyer's schedule within a date range
  getLawyerSchedule: async (lawyerId, startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        start: startDate.toISOString().slice(0, 19),
        end: endDate.toISOString().slice(0, 19)
      });
      
      const response = await fetch(`${API_BASE_URL}/lawyer/${lawyerId}/range?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lawyer schedule');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching lawyer schedule:', error);
      throw error;
    }
  },

  // Get upcoming schedules for a lawyer
  getUpcomingSchedules: async (lawyerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/lawyer/${lawyerId}/upcoming`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming schedules');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming schedules:', error);
      throw error;
    }
  },

  // Accept an appointment (for lawyers)
  acceptAppointment: async (scheduleId, lawyerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${scheduleId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lawyerId: parseInt(lawyerId)
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to accept appointment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error accepting appointment:', error);
      throw error;
    }
  },
  // Decline an appointment (for lawyers)
  declineAppointment: async (scheduleId, lawyerId, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${scheduleId}/decline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lawyerId: parseInt(lawyerId),
          reason: reason || 'No reason provided'
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to decline appointment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error declining appointment:', error);
      throw error;
    }
  },
  // Cancel an appointment
  cancelAppointment: async (scheduleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${scheduleId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to cancel appointment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }
};
