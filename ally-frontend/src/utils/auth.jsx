export const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = atob(paddedPayload);

    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw error;
  }
};


export const getAuthData = () => {
  try {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      return null;
    }

    const payload = decodeJWT(token);

    return {
      token,
      userId: payload.sub,
      email: payload.email || '',
      accountType: payload.accountType || role || 'unknown',
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};


export const isAuthenticated = () => {
  const authData = getAuthData();
  return !!authData?.isAuthenticated;
};

export const fetchUserDetails = async (userId) => {
  // Guard against undefined/null userId
  if (!userId || userId === 'undefined' || userId === 'null') {
    console.error('fetchUserDetails called with invalid userId:', userId);
    return null;
  }
  
  try {
    const authData = getAuthData();

    if (!authData) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`http://localhost:8080/users/getUser/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Log the actual error response
      const errorText = await response.text();
      console.error(`Failed to fetch user details for ${userId}: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch user details: ${response.status}`);
    }

    const userData = await response.json();

    return {
      id: userData.userId,
      firstName: userData.Fname || userData.fname || '',
      lastName: userData.Lname || userData.lname || '',
      email: userData.email || '',
      fullName: `${userData.Fname || userData.fname || ''} ${
        userData.Lname || userData.lname || ''
      }`.trim(),
      accountType: userData.accountType || 'unknown',
      phoneNumber: userData.phoneNumber || '+63',
      address: userData.address || '',
      city: userData.city || '',
      province: userData.province || '',
      zip: userData.zip || '',
    };
  } catch (error) {
    console.error(`Error fetching user details for ${userId}:`, error);
    throw error;
  }
};


export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = '/login';
};