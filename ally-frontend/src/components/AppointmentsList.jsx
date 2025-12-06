import React, { useState, useEffect } from 'react';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { BookingModal } from './BookingModal';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthData } from '../utils/auth.jsx';
import { scheduleService } from '../services/scheduleService.jsx';

export const AppointmentsList = ({ refreshTrigger = 0 }) => {
  const [appointments, setAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);

  useEffect(() => {
    fetchUserAppointments();
  }, [refreshTrigger]);  const fetchUserAppointments = async () => {
    try {
      setLoading(true);
      const authData = getAuthData();
      
      
      if (!authData || !authData.userId) {
        setError('You must be logged in to view appointments');
        return;
      }

      // Determine the correct endpoints based on user account type
      let upcomingEndpoint;
      let pastEndpoint;
      if (authData.accountType === 'LAWYER') {
        upcomingEndpoint = `http://localhost:8080/schedules/lawyer/${authData.userId}/upcoming`;
        pastEndpoint = `http://localhost:8080/schedules/lawyer/${authData.userId}/past`;
      } else if (authData.accountType === 'CLIENT') {
        upcomingEndpoint = `http://localhost:8080/schedules/client/${authData.userId}/upcoming`;
        pastEndpoint = `http://localhost:8080/schedules/client/${authData.userId}/past`;
      } else {
        setError('Invalid account type. Please contact support.');
        return;
      }

      console.log('Using endpoints:', upcomingEndpoint, pastEndpoint);

      // Fetch upcoming and past appointments in parallel
      const [upcomingResponse, pastResponse] = await Promise.all([
        fetch(upcomingEndpoint),
        fetch(pastEndpoint)
      ]);

      if (!upcomingResponse.ok || !pastResponse.ok) {
        throw new Error(`HTTP error! upcoming: ${upcomingResponse.status}, past: ${pastResponse.status}`);
      }

      const [upcomingData, pastData] = await Promise.all([
        upcomingResponse.json(),
        pastResponse.json()
      ]);

      // Transform function for appointment data
      const transformAppointment = (appointment) => ({
        scheduleId: appointment.scheduleId,
        bookingStartTime: appointment.bookingStartTime,
        bookingEndTime: appointment.bookingEndTime,
        lawyer: {
          userId: appointment.lawyer?.userId,
          Fname: appointment.lawyer?.fname || appointment.lawyer?.Fname || '',
          Lname: appointment.lawyer?.lname || appointment.lawyer?.Lname || ''
        },
        client: {
          Fname: appointment.client?.Fname || appointment.client?.fname || '',
          Lname: appointment.client?.Lname || appointment.client?.lname || ''
        },
        legalCase: appointment.legalCase ? {
          caseId: appointment.legalCase.caseId,
          title: appointment.legalCase.title,
          status: appointment.legalCase.status,
          description: appointment.legalCase.description
        } : null,
        status: appointment.status || 'PENDING',
        declineReason: appointment.declineReason,
        isBooked: appointment.isBooked
      });

      const transformedUpcoming = upcomingData.map(transformAppointment);
      const transformedPast = pastData.map(transformAppointment);

      setAppointments(transformedUpcoming);
      setPastAppointments(transformedPast);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError(err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };
  const handleCardClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleCancel = async (appointment) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await scheduleService.cancelAppointment(appointment.scheduleId);
      
      // Update the appointment status in the local state instead of removing it
      setAppointments(prev => prev.map(apt => 
        apt.scheduleId === appointment.scheduleId 
          ? { ...apt, status: 'CANCELLED' }
          : apt
      ));
      
      toast.success('Appointment cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.message || 'Failed to cancel appointment. Please try again.');
    }
  };

  const handleAccept = async (appointment) => {
    const authData = getAuthData();
    if (!authData || authData.accountType !== 'LAWYER') {
      toast.error('Only lawyers can accept appointments');
      return;
    }

    try {
      await scheduleService.acceptAppointment(appointment.scheduleId, authData.userId);
      
      // Update the appointment status in the local state
      setAppointments(prev => prev.map(apt => 
        apt.scheduleId === appointment.scheduleId 
          ? { ...apt, status: 'ACCEPTED' }
          : apt
      ));
      
      toast.success('Appointment accepted successfully!');
    } catch (error) {
      console.error('Error accepting appointment:', error);
      toast.error(error.message || 'Failed to accept appointment. Please try again.');
    }
  };

  const handleDecline = async (appointment, reason) => {
    const authData = getAuthData();
    if (!authData || authData.accountType !== 'LAWYER') {
      toast.error('Only lawyers can decline appointments');
      return;
    }

    try {
      await scheduleService.declineAppointment(appointment.scheduleId, authData.userId, reason);

      // Update the appointment status in the local state
      setAppointments(prev => prev.map(apt =>
        apt.scheduleId === appointment.scheduleId
          ? { ...apt, status: 'DECLINED', declineReason: reason }
          : apt
      ));

      toast.success('Appointment declined successfully!');
    } catch (error) {
      console.error('Error declining appointment:', error);
      toast.error(error.message || 'Failed to decline appointment. Please try again.');
    }
  };

  const handleReschedule = (appointment) => {
    setAppointmentToReschedule(appointment);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSuccess = () => {
    setIsRescheduleModalOpen(false);
    setAppointmentToReschedule(null);

    // Move the rescheduled appointment from accepted to pending section
    setAppointments(prev => prev.map(apt =>
      apt.scheduleId === appointmentToReschedule?.scheduleId
        ? { ...apt, status: 'PENDING' }
        : apt
    ));

    // Refresh the appointments to get the latest data
    fetchUserAppointments();
    toast.success('Appointment rescheduled successfully! Now pending lawyer approval.');
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setAppointmentToReschedule(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading your appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Separate appointments by status
  const pendingAppointments = appointments.filter(apt => apt.status?.toUpperCase() === 'PENDING');
  const acceptedAppointments = appointments.filter(apt => apt.status?.toUpperCase() === 'ACCEPTED');
  const otherAppointments = appointments.filter(apt =>
    apt.status?.toUpperCase() !== 'PENDING' && apt.status?.toUpperCase() !== 'ACCEPTED'
  );

  const hasAnyAppointments = appointments.length > 0 || pastAppointments.length > 0;

  if (!hasAnyAppointments) {
    const authData = getAuthData();
    const isLawyer = authData?.accountType === 'LAWYER';

    return (
      <div className="py-12 text-center">
        <div className="mb-6 flex justify-center">
          <img 
            src="/booking.svg" 
            alt="No appointments" 
            className="w-48 h-48 object-contain cursor-normal"
            draggable="false"
          />
        </div>
        <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-gray-900">
          No Appointments Yet
        </h3>
        <p className="max-w-md mx-auto mb-6 text-sm sm:text-base text-gray-600 leading-relaxed">
          {isLawyer
            ? "You don't have any upcoming appointments with clients. Appointments will appear here once clients book consultations with you."
            : "You haven't scheduled any appointments yet. Browse our lawyer directory to book a consultation and get started with your legal needs."
          }
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Pending Appointments Section */}
        {pendingAppointments.length > 0 && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-orange-700">
                Pending Appointments
              </h3>
            </div>
            <div className="space-y-3">
              {pendingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.scheduleId}
                  appointment={appointment}
                  onCardClick={handleCardClick}
                  onCancel={handleCancel}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          </div>
        )}

        {/* Accepted Appointments Section */}
        {acceptedAppointments.length > 0 && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-green-700">
                Confirmed Appointments
              </h3>
            </div>
            <div className="space-y-3">
              {acceptedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.scheduleId}
                  appointment={appointment}
                  onCardClick={handleCardClick}
                  onCancel={handleCancel}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          </div>
        )}

        {/* Appointment History Section */}
        {pastAppointments.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-purple-700">
                Appointment History
              </h3>
              <span className="ml-2 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                {pastAppointments.length}
              </span>
            </div>
            <div className="space-y-3">
              {pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.scheduleId}
                  appointment={appointment}
                  onCardClick={handleCardClick}
                  onCancel={handleCancel}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Appointments from Upcoming Data (edge cases) */}
        {otherAppointments.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Recently Completed
              </h3>
              <span className="ml-2 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                {otherAppointments.length}
              </span>
            </div>
            <div className="space-y-3">
              {otherAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.scheduleId}
                  appointment={appointment}
                  onCardClick={handleCardClick}
                  onCancel={handleCancel}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onCancel={handleCancel}
        onReschedule={handleReschedule}
      />

      {/* Reschedule Modal */}
      <BookingModal
        lawyer={{
          id: appointmentToReschedule?.lawyer?.userId || appointmentToReschedule?.lawyer?.id,
          name: `${appointmentToReschedule?.lawyer?.Fname || ''} ${appointmentToReschedule?.lawyer?.Lname || ''}`.trim(),
          fee: 'Contact for details' // We don't have fee data in appointment
        }}
        caseInfo={appointmentToReschedule?.legalCase ? {
          caseId: appointmentToReschedule.legalCase.caseId,
          title: appointmentToReschedule.legalCase.title,
          status: appointmentToReschedule.legalCase.status,
          description: appointmentToReschedule.legalCase.description
        } : null}
        isOpen={isRescheduleModalOpen}
        onClose={handleCloseRescheduleModal}
        isRescheduling={true}
        appointmentToReschedule={appointmentToReschedule}
        onRescheduleSuccess={handleRescheduleSuccess}
      />
    </>
  );
};
