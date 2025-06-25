import React, { useState, useEffect } from 'react';
import { AppointmentsList } from '../components/AppointmentsList';
import { getAuthData } from '../utils/auth.jsx';
import { BookingModal } from '../components/BookingModal';
import { caseService } from '../services/caseService';

export const AppointmentsPage = () => {
  const authData = getAuthData();
  const isLawyer = authData?.accountType === 'LAWYER';
  
  // State for booking modal and lawyer selection
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch client cases to find the first accepted case with a lawyer
  useEffect(() => {
    if (isLawyer || !authData?.userId) return;

    const fetchClientCases = async () => {
      try {
        const cases = await caseService.getClientCases(authData.userId);
        // Find the first accepted case that has a lawyer assigned
        const acceptedCase = cases.find(c =>
          c.status === 'ACCEPTED' && c.lawyer
        );
        if (acceptedCase) {
          setSelectedLawyer(acceptedCase.lawyer);
        }
      } catch (error) {
        console.error('Failed to fetch client cases:', error);
      }
    };

    fetchClientCases();
  }, [authData?.userId, isLawyer]);

  const handleBookAppointment = () => {
    setIsBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
  };

  const handleAppointmentBooked = () => {
    setIsBookingModalOpen(false);
    // Trigger refresh of appointments list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
      <div className="container max-w-5xl px-4 mx-auto">
        <div className="p-4 bg-white shadow-sm sm:p-6 md:p-8 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="mb-2 text-xl font-bold text-gray-900 sm:mb-3 sm:text-2xl">My Appointments</h1>
              <p className="text-sm text-gray-600 sm:text-base">
                {isLawyer
                  ? "View and manage your scheduled appointments with clients"
                  : "View and manage your scheduled appointments with lawyers"
                }
              </p>
            </div>
            
            {/* Book Appointment Button - only for clients with an assigned lawyer */}
            {!isLawyer && selectedLawyer && (
              <button
                onClick={handleBookAppointment}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <path d="M8 14h.01"></path>
                  <path d="M12 14h.01"></path>
                  <path d="M16 14h.01"></path>
                  <path d="M8 18h.01"></path>
                  <path d="M12 18h.01"></path>
                  <path d="M16 18h.01"></path>
                </svg>
                Book Appointment
              </button>
            )}
          </div>
          
          <AppointmentsList refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedLawyer && (
        <BookingModal
          lawyer={{
            id: selectedLawyer.userId,
            name: `${selectedLawyer.Fname} ${selectedLawyer.Lname}`,
            fee: selectedLawyer.fee || 'Consultation Fee Available'
          }}
          isOpen={isBookingModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleAppointmentBooked}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
