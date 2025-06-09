// Authentication utilities for handling JWT tokens and user data

// Function to get user data from localStorage
export const getAuthData = () => {
  try {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      return null;
    }

    // For now, we'll use a simple JWT decode since we don't have jwt-decode library
    // In production, you should use a proper JWT library
    const payload = decodeJWT(token);
    
    return {
      token,
      userId: payload.sub, // JWT subject contains user ID
      email: payload.email,
      accountType: payload.accountType || role,
      isAuthenticated: true
    };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

// Simple JWT decoder (without verification - only for extracting data)
// Note: This is not secure and should not be used for authentication verification
export const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = atob(paddedPayload);
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw error;
  }
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const authData = getAuthData();
  return authData && authData.isAuthenticated;
};

// Function to get user's full name from user ID
export const fetchUserDetails = async (userId) => {
  try {
    const authData = getAuthData();
    if (!authData) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`http://localhost:8080/users/getUser/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }

    const userData = await response.json();
    return {
      id: userData.userId,
      firstName: userData.Fname || userData.fname,
      lastName: userData.Lname || userData.lname,
      email: userData.email,
      fullName: `${userData.Fname || userData.fname || ''} ${userData.Lname || userData.lname || ''}`.trim(),
      accountType: userData.accountType,
      phoneNumber: userData.phoneNumber || '+63',
      address: userData.address || '',
      city: userData.city || '',
      province: userData.province || '',
      zip: userData.zip || ''
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

// Function to logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = '/login';
};
