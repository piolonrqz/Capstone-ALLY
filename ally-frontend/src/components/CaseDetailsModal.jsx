import React, { useState, useEffect } from 'react';
import { X, Calendar, User, FileText, CheckCircle, XCircle, AlertCircle, Clock, CalendarPlus, Upload, Eye } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { documentService } from '../services/documentService';
import { getAuthData } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export const CaseDetailsModal = ({ 
  case_, 
  userRole, 
  isOpen, 
  onClose, 
  onStatusChange, 
  onAppointmentBooked 
}) => {
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Load document count for accepted cases
  useEffect(() => {
    if (isOpen && case_?.status === 'ACCEPTED') {
      loadDocumentCount();
    }
  }, [isOpen, case_?.caseId, case_?.status]);

  const loadDocumentCount = async () => {
    try {
      setLoadingDocuments(true);
      const authData = getAuthData();
      if (!authData) {
        console.error('Not authenticated when trying to load document count');
        setDocumentCount(0);
        return;
      }

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
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'DECLINED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
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
      onClose();
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

  if (!isOpen || !case_) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {case_.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>Case #{case_.caseId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted: {formatDate(case_.dateSubmitted)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(case_.status)}`}>
                {getStatusIcon(case_.status)}
                <span className="text-sm font-medium capitalize">
                  {case_.status?.toLowerCase()}
                </span>
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
            {/* Case Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="flex items-center text-lg font-medium text-gray-700 mb-3">
                <FileText className="w-5 h-5 mr-2" />
                Case Description
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {case_.description}
              </p>
            </div>

            {/* Participants Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="flex items-center text-lg font-medium text-gray-700 mb-3">
                <User className="w-5 h-5 mr-2" />
                Participants
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Client Information */}
                {case_.client && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Client:</span>
                    <p className="text-gray-900 font-medium">
                      {case_.client.Fname} {case_.client.Lname}
                    </p>
                    {case_.client.email && (
                      <p className="text-sm text-gray-600">{case_.client.email}</p>
                    )}
                  </div>
                )}

                {/* Lawyer Information */}
                {case_.lawyer ? (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Assigned Lawyer:</span>
                    <p className="text-gray-900 font-medium">
                      {case_.lawyer.Fname} {case_.lawyer.Lname}
                    </p>
                    {case_.lawyer.email && (
                      <p className="text-sm text-gray-600">{case_.lawyer.email}</p>
                    )}
                  </div>
                ) : case_.status === 'PENDING' ? (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <p className="text-gray-500 italic">Waiting for lawyer assignment</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Document Management Section - Only for Accepted Cases */}
            {case_.status === 'ACCEPTED' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="flex items-center text-lg font-medium text-blue-800 mb-3">
                  <FileText className="w-5 h-5 mr-2" />
                  Document Management
                </h4>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
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
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      disabled={loadingDocuments}
                    >
                      <Upload className="w-4 h-4" />
                      {documentCount > 0 ? 'Manage Documents' : 'Upload Documents'}
                    </button>
                  )}
                  
                  {userRole === 'LAWYER' && documentCount > 0 && (
                    <button
                      onClick={handleNavigateToDocuments}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                      disabled={loadingDocuments}
                    >
                      <Eye className="w-4 h-4" />
                      View Documents
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Appointment Booking Section - Only for Accepted Cases and Clients */}
            {case_.status === 'ACCEPTED' && userRole === 'CLIENT' && case_.lawyer && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="flex items-center text-lg font-medium text-green-800 mb-3">
                  <CalendarPlus className="w-5 h-5 mr-2" />
                  Appointment Booking
                </h4>
                <p className="text-green-700 text-sm mb-3">
                  Your case has been accepted. You can now book appointments with your assigned lawyer.
                </p>
                <button
                  onClick={handleBookAppointment}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <CalendarPlus className="w-4 h-4" />
                  {case_.appointmentCount > 0 ? 'Book Another Appointment' : 'Book Appointment'}
                </button>
              </div>
            )}

            {/* Status Messages */}
            {case_.status === 'DECLINED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h4 className="text-lg font-medium text-red-800">Case Declined</h4>
                </div>
                <p className="text-red-700">
                  This case has been declined. You may submit a new case or contact support for assistance.
                </p>
              </div>
            )}

            {case_.status === 'PENDING' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h4 className="text-lg font-medium text-yellow-800">Case Pending</h4>
                </div>
                <p className="text-yellow-700">
                  This case is currently pending review. You will be notified once a lawyer is assigned and reviews your case.
                </p>
              </div>
            )}
          </div>

          {/* Footer with Actions */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>

            {/* Lawyer Actions for Pending Cases Only */}
            {case_.status === 'PENDING' && userRole === 'LAWYER' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange('DECLINED')}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Decline Case
                </button>
                <button
                  onClick={() => handleStatusChange('ACCEPTED')}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Case
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
    </>
  );
};