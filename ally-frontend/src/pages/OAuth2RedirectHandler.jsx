import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');

    if (token && role && userId) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      console.log(role)

      if (role === 'CLIENT'|| role === 'LAWYER') {
        navigate(`/?id=${userId}`);
      }
    } else {
      navigate('/login');
    }
  }, [navigate, searchParams]);

  return <div>Redirecting...</div>;
};

export default OAuth2RedirectHandler;
