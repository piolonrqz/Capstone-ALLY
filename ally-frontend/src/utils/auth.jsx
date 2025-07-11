import { jwtDecode } from "jwt-decode";

export const decodeJWT = (token) => {
  try {
    return jwtDecode(token); // ✅ use jwtDecode (not jwt_decode)
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw error;
  }
};

export const getAuthData = () => {
  try {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const department = localStorage.getItem('department');
    const profilePhoto = localStorage.getItem('profilePhoto');
    if (!token) {
      return null;
    }

    const payload = decodeJWT(token);

    // Handle both profilePhoto and profile_photo for backward compatibility
    const photoFromPayload = payload.profilePhoto || payload.profile_photo;

    return {
      token,
      userId: payload.sub,
      email: payload.email || '',
      accountType: payload.accountType || role || 'unknown',
      department: department || null,
      isAuthenticated: true,
      profilePhoto: photoFromPayload || profilePhoto
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

export const isAdmin = () => {
  const authData = getAuthData();
  return authData?.accountType === 'ADMIN';
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

    // FIX: Store profile photo URL in localStorage if it exists
    if (userData.profilePhotoUrl) {
      localStorage.setItem('profilePhoto', userData.profilePhotoUrl);
      console.log('Profile photo URL stored in localStorage:', userData.profilePhotoUrl);
    }

    // If user is admin, fetch department information
    let department = null;
    if (userData.accountType === 'ADMIN') {
      const adminResponse = await fetch(`http://localhost:8080/admins/${userId}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        department = adminData.department;
        localStorage.setItem('department', department);
      }
    }

    return {
      id: userData.userId,
      firstName: userData.Fname || userData.fname || '',
      lastName: userData.Lname || userData.lname || '',
      email: userData.email || '',
      fullName: `${userData.Fname || userData.fname || ''} ${
        userData.Lname || userData.lname || ''
      }`.trim(),
      accountType: userData.accountType || 'unknown',
      department: department,
      phoneNumber: userData.phoneNumber || '+63',
      address: userData.address || '',
      city: userData.city || '',
      province: userData.province || '',
      zip: userData.zip || '',
      // 🔥 FIX: Include profile photo URL in returned user details
      profilePhotoUrl: userData.profilePhotoUrl || null,
    };
  } catch (error) {
    console.error(`Error fetching user details for ${userId}:`, error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('department');
  localStorage.removeItem('profilePhoto');
  window.location.href = '/login';
};