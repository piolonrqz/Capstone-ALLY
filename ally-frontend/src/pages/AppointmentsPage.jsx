import React from 'react';
import { AppointmentsList } from '../components/AppointmentsList';
import { getAuthData } from '../utils/auth.jsx';

export const AppointmentsPage = () => {
  const authData = getAuthData();
  const isLawyer = authData?.accountType === 'LAWYER';
  
  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
      <div className="container max-w-5xl px-4 mx-auto">        
        <div className="p-4 bg-white shadow-sm sm:p-6 md:p-8 rounded-xl">
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:mb-3 sm:text-2xl">My Appointments</h1>
          <p className="mb-6 text-sm text-gray-600 sm:mb-8 sm:text-base">
            {isLawyer 
              ? "View and manage your scheduled appointments with clients"
              : "View and manage your scheduled appointments with lawyers"
            }
          </p>
          
          <AppointmentsList />
        </div>
      </div>
    </div>
  );
};
