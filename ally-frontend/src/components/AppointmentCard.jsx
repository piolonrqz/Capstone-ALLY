import React, { useState } from 'react';
import { Calendar, MapPin, User, FileText, Edit, Trash2, Check, X } from 'lucide-react';
import { getAuthData } from '../utils/auth.jsx';

export const AppointmentCard = ({ appointment, onEdit, onCancel, onAccept, onDecline }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  
  const authData = getAuthData();
  const isLawyer = authData?.accountType === 'LAWYER';  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };
  };
  // Get status color based on appointment status
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Handle accept appointment
  const handleAccept = async () => {
    if (!onAccept) return;
    
    setIsAccepting(true);
    try {
      await onAccept(appointment);
    } catch (error) {
      console.error('Error accepting appointment:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle decline appointment
  const handleDecline = async () => {
    if (!onDecline) return;
    
    setIsDeclining(true);
    try {
      await onDecline(appointment, declineReason);
      setShowDeclineModal(false);
      setDeclineReason('');
    } catch (error) {
      console.error('Error declining appointment:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  const { date, time } = formatDateTime(appointment.bookingStartTime);
  const endTime = formatDateTime(appointment.bookingEndTime).time;

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-start justify-between">
        {/* Main Information */}
        <div className="flex-1">          
          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {appointment.appointmentType || 'Legal Consultation'}
            </h3>
            {/* Case Information */}
            {appointment.legalCase && (
              <div className="p-2 mb-2 border border-blue-200 rounded bg-blue-50">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Case:</span> {appointment.legalCase.title} (#{appointment.legalCase.caseId})
                </div>
                <div className="mt-1 text-xs text-blue-600">
                  Status: {appointment.legalCase.status}
                </div>
              </div>
            )}
            <div className="flex items-center mb-2 text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{date} | {time} - {endTime}</span>
            </div>
          </div>          <div className="space-y-2 text-sm">
            {/* Show client info for lawyers, lawyer info for clients */}
            <div className="flex">
              <User className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
              <div>
                {isLawyer ? (
                  <>
                    <span className="text-gray-600">Client: </span>
                    <span className="text-gray-900">
                      {appointment.client?.Fname} {appointment.client?.Lname}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600">Attorney: </span>
                    <span className="text-gray-900">
                      {appointment.lawyer.Fname} {appointment.lawyer.Lname}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex">
              <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
              <div>
                <span className="text-gray-600">Location: </span>
                <span className="text-gray-900">
                  {appointment.location || 'Main Office, Room 203'}
                </span>
              </div>
            </div>            {appointment.notes && (
              <div className="flex">
                <FileText className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <span className="text-gray-600">Notes: </span>
                  <span className="text-gray-900">{appointment.notes}</span>
                </div>
              </div>
            )}

            {/* Show decline reason if appointment was declined */}
            {appointment.status?.toUpperCase() === 'DECLINED' && appointment.declineReason && (
              <div className="flex">
                <FileText className="w-4 h-4 mr-2 text-red-500 mt-0.5" />
                <div>
                  <span className="text-red-600">Decline Reason: </span>
                  <span className="text-red-700">{appointment.declineReason}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex flex-col items-end ml-6 space-y-3">
          {/* Status Badge */}
          <div className={`px-4 py-2 rounded-full ${getStatusColor(appointment.status)}`}>
            <span className="text-xs font-semibold">
              {appointment.status?.toUpperCase() || 'PENDING'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            {/* Lawyer-specific buttons for pending appointments */}
            {isLawyer && appointment.status?.toUpperCase() === 'PENDING' && (
              <div className="flex space-x-2">
                <button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="flex items-center px-4 py-2 text-sm text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {isAccepting ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  onClick={() => setShowDeclineModal(true)}
                  disabled={isDeclining}
                  className="flex items-center px-4 py-2 text-sm text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </button>
              </div>
            )}              
              {/* Client-only action buttons for editing and cancelling - only for pending appointments */}
            {!isLawyer && appointment.status?.toUpperCase() === 'PENDING' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(appointment)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors bg-white border border-blue-500 rounded-lg hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>                
                <button
                  onClick={() => onCancel(appointment)}
                  className="flex items-center px-4 py-2 text-sm text-red-700 transition-colors border border-red-500 rounded-lg bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Decline Appointment
            </h3>
            <p className="mb-4 text-gray-600">
              Please provide a reason for declining this appointment:
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Enter reason for declining..."
            />
            <div className="flex mt-4 space-x-3">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={isDeclining || !declineReason.trim()}
                className="flex-1 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeclining ? 'Declining...' : 'Decline Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
