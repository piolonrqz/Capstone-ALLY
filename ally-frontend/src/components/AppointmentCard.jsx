import React, { useState } from 'react';
import { User, Trash2, Check, X } from 'lucide-react';
import { getAuthData } from '../utils/auth.jsx';

export const AppointmentCard = ({ appointment, onCancel, onAccept, onDecline, onCardClick }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  
  const authData = getAuthData();
  const isLawyer = authData?.accountType === 'LAWYER';

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
  const handleAccept = async (e) => {
    e.stopPropagation(); // Prevent card click when button is clicked
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

  // Handle cancel appointment
  const handleCancel = async (e) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    if (!onCancel) return;
    await onCancel(appointment);
  };

  // Handle card click to open modal
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(appointment);
    }
  };

  return (
    <>
      {/* Minimal Appointment Card */}
      <div
        className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          {/* Main Information */}
          <div className="flex-1 min-w-0">
            {/* Case Information */}
            <div className="flex items-center space-x-2 mb-2">
              {appointment.legalCase ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">
                    #{appointment.legalCase.caseId}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {appointment.legalCase.title}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  General Consultation
                </span>
              )}
            </div>
            
            {/* Participant Information */}
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2 text-blue-400" />
              {isLawyer ? (
                <span>
                  Client: {appointment.client?.Fname} {appointment.client?.Lname}
                </span>
              ) : (
                <span>
                  Lawyer: {appointment.lawyer?.Fname} {appointment.lawyer?.Lname}
                </span>
              )}
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center space-x-3 ml-4">
            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status?.toUpperCase() || 'PENDING'}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Lawyer Actions for Pending Appointments */}
              {isLawyer && appointment.status?.toUpperCase() === 'PENDING' && (
                <>
                  <button
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className="flex items-center px-3 py-1.5 text-xs text-white transition-colors bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    {isAccepting ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeclineModal(true);
                    }}
                    disabled={isDeclining}
                    className="flex items-center px-3 py-1.5 text-xs text-white transition-colors bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Decline
                  </button>
                </>
              )}

              {/* Client Actions for Pending Appointments */}
              {!isLawyer && appointment.status?.toUpperCase() === 'PENDING' && (
                <button
                  onClick={handleCancel}
                  className="flex items-center px-3 py-1.5 text-xs text-red-700 transition-colors border border-red-500 rounded bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Cancel
                </button>
              )}
            </div>
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
