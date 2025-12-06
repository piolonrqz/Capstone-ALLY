import React, { useState } from 'react';
import { X, Calendar, Clock, User, FileText, Check, Trash2, MapPin } from 'lucide-react';
import { getAuthData } from '../utils/auth.jsx';

export const AppointmentDetailsModal = ({
  appointment,
  isOpen,
  onClose,
  onAccept,
  onDecline,
  onCancel,
  onReschedule
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  
  const authData = getAuthData();
  const isLawyer = authData?.accountType === 'LAWYER';

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DECLINED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleAccept = async () => {
    if (!onAccept) return;
    
    setIsAccepting(true);
    try {
      await onAccept(appointment);
      onClose();
    } catch (error) {
      console.error('Error accepting appointment:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!onDecline) return;
    
    setIsDeclining(true);
    try {
      await onDecline(appointment, declineReason);
      setShowDeclineModal(false);
      setDeclineReason('');
      onClose();
    } catch (error) {
      console.error('Error declining appointment:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await onCancel(appointment);
        onClose();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  if (!isOpen || !appointment) return null;

  const { date, time } = formatDateTime(appointment.bookingStartTime);
  const endTime = formatDateTime(appointment.bookingEndTime).time;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                Appointment Details
              </h2>
              {appointment.legalCase && (
                <div className="mt-2">
                  <h3 className="text-lg font-medium text-blue-900">
                    {appointment.legalCase.title}
                  </h3>
                  <p className="text-sm text-blue-600">
                    Case #{appointment.legalCase.caseId}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status?.toUpperCase() || 'PENDING'}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Date and Time Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </h4>
              <div className="space-y-2">
                <div className="flex items-center text-gray-900">
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{date}</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">Time:</span>
                  <span className="ml-2">{time} - {endTime}</span>
                </div>
              </div>
            </div>

            {/* Participants Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <User className="w-4 h-4 mr-2" />
                Participants
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Client:</span>
                  <p className="text-gray-900">
                    {appointment.client?.Fname} {appointment.client?.Lname}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Lawyer:</span>
                  <p className="text-gray-900">
                    {appointment.lawyer?.Fname} {appointment.lawyer?.Lname}
                  </p>
                </div>
              </div>
            </div>

            {/* Case Information Section */}
            {appointment.legalCase && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="flex items-center text-sm font-medium text-blue-800 mb-3">
                  <FileText className="w-4 h-4 mr-2" />
                  Case Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-blue-700">Title:</span>
                    <p className="text-blue-900">{appointment.legalCase.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Case ID:</span>
                    <p className="text-blue-900">#{appointment.legalCase.caseId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Status:</span>
                    <p className="text-blue-900">{appointment.legalCase.status}</p>
                  </div>
                  {appointment.legalCase.description && (
                    <div>
                      <span className="text-sm font-medium text-blue-700">Description:</span>
                      <p className="text-blue-900 text-sm mt-1 leading-relaxed">
                        {appointment.legalCase.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Decline Reason Section */}
            {appointment.status?.toUpperCase() === 'DECLINED' && appointment.declineReason && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="flex items-center text-sm font-medium text-red-800 mb-2">
                  <X className="w-4 h-4 mr-2" />
                  Decline Reason
                </h4>
                <p className="text-red-700 text-sm">{appointment.declineReason}</p>
              </div>
            )}
          </div>

          {/* Footer with Actions */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>

            {/* Lawyer Actions for Pending Appointments */}
            {isLawyer && appointment.status?.toUpperCase() === 'PENDING' && (
              <>
                <button
                  onClick={() => setShowDeclineModal(true)}
                  disabled={isDeclining}
                  className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {isAccepting ? 'Accepting...' : 'Accept'}
                </button>
              </>
            )}

            {/* Client Actions for Pending Appointments */}
            {!isLawyer && appointment.status?.toUpperCase() === 'PENDING' && (
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 text-red-700 bg-red-50 border border-red-500 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Cancel
              </button>
            )}

            {/* Client Actions for Accepted Appointments */}
            {!isLawyer && appointment.status?.toUpperCase() === 'ACCEPTED' && (
              <button
                onClick={() => {
                  if (onReschedule) {
                    onReschedule(appointment);
                  }
                  onClose();
                }}
                className="flex items-center px-4 py-2 text-blue-700 bg-blue-50 border border-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Reschedule
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Decline Appointment
            </h3>
            <p className="mb-4 text-gray-600">
              Please provide a reason for declining this appointment:
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
    </>
  );
};
