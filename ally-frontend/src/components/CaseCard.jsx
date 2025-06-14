import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, FileText, Clock, CheckCircle, XCircle, AlertCircle, CalendarPlus, Upload, Eye } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { documentService } from '../services/documentService';

const CaseCard = ({ case_, userRole, onStatusChange, onAppointmentBooked }) => {
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Load document count for accepted cases
  useEffect(() => {
    if (case_.status === 'ACCEPTED') {
      loadDocumentCount();
    }
  }, [case_.caseId, case_.status]);

  const loadDocumentCount = async () => {
    try {
      setLoadingDocuments(true);
      const count = await documentService.getDocumentCount(case_.caseId);
      setDocumentCount(count);
    } catch (error) {
      console.error('Error loading document count:', error);
      setDocumentCount(0);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleNavigateToDocuments = () => {
    navigate(`/documents/${case_.caseId}`);
  };

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

  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(case_.caseId, newStatus);
    }
  };

  const handleBookAppointment = () => {
    setIsBookingModalOpen(true);
  };

  const handleAppointmentBookingSuccess = () => {
    setIsBookingModalOpen(false);
    if (onAppointmentBooked) {
      onAppointmentBooked(case_.caseId);
    }
  };

  return (
    <div className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {case_.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Submitted: {formatDate(case_.dateSubmitted)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>Case #{case_.caseId}</span>
            </div>
            {/* Show appointment count if available */}
            {case_.appointmentCount !== userId.lawyer && (
              <div className="flex items-center gap-1">
                <CalendarPlus className="w-4 h-4" />
                <span>{case_.appointmentCount} appointment{case_.appointmentCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(case_.status)}`}>
          {getStatusIcon(case_.status)}
          <span className="text-xs font-medium capitalize">
            {case_.status?.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-sm leading-relaxed text-gray-700">
          {case_.description}
        </p>
      </div>

      {/* Case Details */}
      <div className="space-y-2 text-sm">
        {/* Client Information (for lawyers) */}
        {userRole === 'LAWYER' && case_.client && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Client:</span>
            <span className="font-medium text-gray-900">
              {case_.client.Fname} {case_.client.Lname}
            </span>
          </div>
        )}

        {/* Lawyer Information (for clients) */}
        {userRole === 'CLIENT' && case_.lawyer && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Assigned Lawyer:</span>
            <span className="font-medium text-gray-900">
              {case_.lawyer.Fname} {case_.lawyer.Lname}
            </span>
          </div>
        )}

        {/* No lawyer assigned message for clients */}
        {userRole === 'CLIENT' && !case_.lawyer && case_.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Status:</span>
            <span className="italic text-gray-500">Waiting for lawyer assignment</span>
          </div>
        )}
      </div>

      {/* Action Buttons (for lawyers only) */}
      {userRole === 'LAWYER' && case_.status === 'PENDING' && (
        <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200">
          <button
            onClick={() => handleStatusChange('ACCEPTED')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Accept Case
          </button>
          <button
            onClick={() => handleStatusChange('DECLINED')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
          >
            <XCircle className="w-4 h-4" />
            Decline Case
          </button>
        </div>
      )}

      {/* Additional Status Info */}
      {case_.status === 'ACCEPTED' && (
 <p className="text-sm text-green-800">

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm mb-3">
            ✓ This case has been accepted and is being processed.
          </p>
          
          {/* Document Management Section */}
          <div className="flex items-center justify-between mb-3 p-2 bg-white rounded border">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {loadingDocuments ? (
                  'Loading documents...'
                ) : (
                  `${documentCount} document${documentCount !== 1 ? 's' : ''}`
                )}
              </span>
            </div>
            
            {/* Document Management Button */}
            {userRole === 'CLIENT' && (
              <button
                onClick={handleNavigateToDocuments}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                disabled={loadingDocuments}
              >
                <Upload className="w-3 h-3" />
                {documentCount > 0 ? 'Manage Documents' : 'Upload Documents'}
              </button>
            )}
            
            {userRole === 'LAWYER' && documentCount > 0 && (
              <button
                onClick={handleNavigateToDocuments}
                className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                disabled={loadingDocuments}
              >
                <Eye className="w-3 h-3" />
                View Documents
              </button>
            )}
          </div>

          {/* Book Appointment Button for Clients */}
          {userRole === 'CLIENT' && (
            <button
              onClick={handleBookAppointment}

              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm w-full justify-center">
              <CalendarPlus className="w-4 h-4" />
              {case_.appointmentCount > 0 ? 'Book Another Appointment' : 'Book Appointment'}
            </button>
          )}
        </div>
      )}

      {case_.status === 'DECLINED' && (
        <div className="p-3 mt-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-sm text-red-800">
            ✗ This case has been declined. You may submit a new case or contact support.
          </p>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && case_.lawyer && (
        <BookingModal
          lawyer={{
            id: case_.lawyer.userId,
            name: `${case_.lawyer.Fname} ${case_.lawyer.Lname}`,
            fee: case_.lawyer.fee || 'Consultation Fee Available'
          }}
          caseInfo={case_}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={handleAppointmentBookingSuccess}
        />
      )}

    </div>
  );
};

export default CaseCard;
