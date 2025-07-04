import React, { useState } from 'react';
import { AppointmentsList } from '../components/AppointmentsList';
import { AcceptedCasesSidebar } from '../components/AcceptedCasesSidebar';
import { getAuthData } from '../utils/auth.jsx';
import { BookingModal } from '../components/BookingModal';

export const AppointmentsPage = () => {
  const authData = getAuthData();
  const isLawyer = authData?.accountType === 'LAWYER';
  
  // State for booking modal and case selection
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBookCase = (caseData) => {
    setSelectedCase(caseData);
    setIsBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
    setSelectedCase(null);
  };

  const handleAppointmentBooked = () => {
    setIsBookingModalOpen(false);
    setSelectedCase(null);
    // Trigger refresh of appointments list and cases sidebar
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
      <div className="container max-w-7xl px-4 mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:mb-3 sm:text-2xl">My Appointments</h1>
          <p className="text-sm text-gray-600 sm:text-base">
            {isLawyer
              ? "View and manage your scheduled appointments with clients"
              : "Select a case to book an appointment or view your existing appointments"
            }
          </p>
        </div>

        {/* Two-column layout for clients, single column for lawyers */}
        {!isLawyer ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Accepted Cases */}
            <div className="lg:col-span-1">
              <AcceptedCasesSidebar
                onBookCase={handleBookCase}
                refreshTrigger={refreshTrigger}
              />
            </div>
            
            {/* Right Main Area - Appointments */}
            <div className="lg:col-span-3">
              <div className="bg-white shadow-sm rounded-xl">
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    My Appointments
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Appointments are organized by status: Pending, Confirmed, and Past appointments.
                  </p>
                  <AppointmentsList refreshTrigger={refreshTrigger} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Single column layout for lawyers */
          <div className="bg-white shadow-sm rounded-xl">
            <div className="p-4 sm:p-6 md:p-8">
              <AppointmentsList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedCase && (
        <BookingModal
          lawyer={{
            id: selectedCase.lawyer.userId,
            name: `${selectedCase.lawyer.Fname} ${selectedCase.lawyer.Lname}`,
            fee: selectedCase.lawyer.fee || 'Consultation Fee Available'
          }}
          caseInfo={selectedCase}
          isOpen={isBookingModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleAppointmentBooked}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
