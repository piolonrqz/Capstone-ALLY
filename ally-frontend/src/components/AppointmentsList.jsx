import React, { useState, useEffect } from 'react';
import { AppointmentCard } from './AppointmentCard';
import { Loader2, Calendar } from 'lucide-react';
import { getAuthData } from '../utils/auth.jsx';

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserAppointments();
  }, []);  const fetchUserAppointments = async () => {
    try {
      setLoading(true);
      const authData = getAuthData();
      
      
      if (!authData || !authData.userId) {
        setError('You must be logged in to view appointments');
        return;
      }

      // Determine the correct endpoint based on user account type
      let endpoint;
      if (authData.accountType === 'LAWYER') {
        endpoint = `http://localhost:8080/schedules/lawyer/${authData.userId}/upcoming`;
      } else if (authData.accountType === 'CLIENT') {
        endpoint = `http://localhost:8080/schedules/client/${authData.userId}/upcoming`;
      } else {
        setError('Invalid account type. Please contact support.');
        return;
      }
      
      console.log('Using endpoint:', endpoint); // Debug log

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
        const data = await response.json();        
      
      // Transform the data to match our component expectations
      const transformedAppointments = data.map(appointment => {
        return {
          scheduleId: appointment.scheduleId,
          appointmentType: appointment.legalCase ? 'Case Consultation' : 'Legal Consultation',
          bookingStartTime: appointment.bookingStartTime,
          bookingEndTime: appointment.bookingEndTime,
          lawyer: {
            Fname: appointment.lawyer?.fname || appointment.lawyer?.Fname || '',
            Lname: appointment.lawyer?.lname || appointment.lawyer?.Lname || ''
          },
          client: {
            Fname: appointment.client?.Fname || appointment.client?.fname || '',
            Lname: appointment.client?.Lname || appointment.client?.lname || ''
          },
          // Include case information if available
          legalCase: appointment.legalCase ? {
            caseId: appointment.legalCase.caseId,
            title: appointment.legalCase.title,
            status: appointment.legalCase.status,
            description: appointment.legalCase.description
          } : null,
          status: appointment.isBooked ? 'Scheduled' : 'Pending',
          isBooked: appointment.isBooked
        }
      });
      
      setAppointments(transformedAppointments);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError(err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    // TODO: Implement edit functionality
    console.log('Edit appointment:', appointment);
    alert('Edit functionality will be implemented soon!');
  };

  const handleCancel = async (appointment) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/schedules/${appointment.scheduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      // Remove the cancelled appointment from the list
      setAppointments(prev => prev.filter(apt => apt.scheduleId !== appointment.scheduleId));
      alert('Appointment cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading your appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
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
  if (appointments.length === 0) {
    const authData = getAuthData();
    const isLawyer = authData?.accountType === 'LAWYER';
    
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
        <p className="text-gray-600 mb-6">
          {isLawyer 
            ? "You don't have any upcoming appointments with clients."
            : "You haven't scheduled any appointments. Browse our lawyer directory to book a consultation."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.scheduleId}
          appointment={appointment}
          onEdit={handleEdit}
          onCancel={handleCancel}
        />
      ))}
    </div>
  );
};
