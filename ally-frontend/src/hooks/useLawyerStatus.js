import { useState, useEffect } from 'react';
import { getAuthData } from '../utils/auth.jsx';
import { userService } from '../services/userService.js';

const useLawyerStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLawyer, setIsLawyer] = useState(false);

  useEffect(() => {
    const fetchLawyerStatus = async () => {
      try {
        setLoading(true);
        const authData = getAuthData();

        if (!authData) {
          setIsLawyer(false);
          setStatus(null);
          setLoading(false);
          return;
        }

        const accountType = authData.accountType;
        const isLawyerUser = accountType === 'LAWYER';

        setIsLawyer(isLawyerUser);

        if (!isLawyerUser) {
          setStatus(null);
          setLoading(false);
          return;
        }

        const lawyerStatus = await userService.getLawyerStatus(authData.userId);
        console.log('Lawyer status fetched:', lawyerStatus);
        console.log('Current user ID:', authData.userId, 'Account Type:', accountType);
        setStatus(lawyerStatus?.status || null);
      } catch (error) {
        console.error('Error fetching lawyer status:', error);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyerStatus();
  }, []);

  return { status, loading, isLawyer };
};

export default useLawyerStatus;

