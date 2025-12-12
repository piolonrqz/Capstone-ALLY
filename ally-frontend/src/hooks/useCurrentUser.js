import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAuthData } from '../utils/auth';

const useCurrentUser = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            try {
                setLoading(true);
                const authData = getAuthData();

                if (!authData) {
                    console.log('User not authenticated - no auth data');
                    setCurrentUser(null);
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/getUser/${authData.userId}`, {
                    headers: {
                        Authorization: `Bearer ${authData.token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to fetch user info: ${res.status} - ${errorText}`);
                }

                const data = await res.json();
                console.log('User data from server:', data);
                
                // Ensure we have a valid account type
                let accountType = 'client'; // Default to client if not specified
                if (data.accountType) {
                    accountType = data.accountType.toLowerCase();
                } else if (authData.accountType) {
                    accountType = authData.accountType.toLowerCase();
                }
                
                console.log('Processed account type:', accountType);
                const user = {
                    id: data.userId.toString(),
                    name: `${data.Fname} ${data.Lname}`,
                    role: accountType,
                    accountType: accountType,
                    email: data.email
                };
                console.log('Setting current user:', user);
                setCurrentUser(user);
            } catch (error) {
                console.error('Authentication error:', error);
                toast.error('Session expired. Please login again.');
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        initialize();

        // Listen for storage changes to update user state
        const handleStorageChange = () => {
            initialize();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return { currentUser, loading };
};

export default useCurrentUser;
