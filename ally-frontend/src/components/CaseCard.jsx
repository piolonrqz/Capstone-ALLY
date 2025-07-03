import React, { useState } from 'react';
import { Calendar, User, FileText, Clock, CheckCircle, XCircle, AlertCircle, Check, X } from 'lucide-react';

const CaseCard = ({ case_, userRole, onStatusChange, onAppointmentBooked, onCardClick }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'DECLINED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DECLINED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = async (newStatus, e) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    if (!onStatusChange) return;
    
    if (newStatus === 'ACCEPTED') {
      setIsAccepting(true);
    } else if (newStatus === 'DECLINED') {
      setIsDeclining(true);
    }
    
    try {
      await onStatusChange(case_.caseId, newStatus);
    } catch (error) {
      console.error('Error changing case status:', error);
    } finally {
      setIsAccepting(false);
      setIsDeclining(false);
    }
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(case_);
    }
  };

  // Get participant name based on user role
  const getParticipantName = () => {
    if (userRole === 'LAWYER' && case_.client) {
      return `${case_.client.Fname} ${case_.client.Lname}`;
    } else if (userRole === 'CLIENT' && case_.lawyer) {
      return `${case_.lawyer.Fname} ${case_.lawyer.Lname}`;
    } else if (userRole === 'CLIENT' && !case_.lawyer && case_.status === 'PENDING') {
      return 'Awaiting assignment';
    }
    return 'N/A';
  };

  const getParticipantLabel = () => {
    if (userRole === 'LAWYER') {
      return 'Client';
    } else if (userRole === 'CLIENT' && case_.lawyer) {
      return 'Lawyer';
    } else if (userRole === 'CLIENT' && !case_.lawyer) {
      return 'Status';
    }
    return 'Participant';
  };

  return (
    <div
      className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        {/* Main Information */}
        <div className="flex-1 min-w-0">
          {/* Case Title and ID */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-blue-600">
              #{case_.caseId}
            </span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm font-medium text-gray-900 truncate">
              {case_.title}
            </span>
          </div>
          
          {/* Participant and Date Information */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-400" />
                <span>
                  {getParticipantLabel()}: {getParticipantName()}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>{formatDate(case_.dateSubmitted)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center space-x-3 ml-4">
          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(case_.status)}`}>
            {getStatusIcon(case_.status)}
            <span className="capitalize">
              {case_.status?.toLowerCase()}
            </span>
          </div>

          {/* Action Buttons - Only show for pending cases and lawyers */}
          {case_.status === 'PENDING' && userRole === 'LAWYER' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => handleStatusChange('ACCEPTED', e)}
                disabled={isAccepting}
                className="flex items-center px-3 py-1.5 text-xs text-white transition-colors bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-3 h-3 mr-1" />
                {isAccepting ? 'Accepting...' : 'Accept'}
              </button>
              <button
                onClick={(e) => handleStatusChange('DECLINED', e)}
                disabled={isDeclining}
                className="flex items-center px-3 py-1.5 text-xs text-white transition-colors bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-3 h-3 mr-1" />
                {isDeclining ? 'Declining...' : 'Decline'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseCard;
