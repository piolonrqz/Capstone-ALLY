import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Loader2, AlertCircle } from 'lucide-react';
import { caseService } from '../services/caseService.jsx';
import { getAuthData } from '../utils/auth.jsx';

export const AcceptedCasesSidebar = ({ onBookCase, refreshTrigger = 0 }) => {
  const [acceptedCases, setAcceptedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAcceptedCases();
  }, [refreshTrigger]);

  const fetchAcceptedCases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authData = getAuthData();
      if (!authData || !authData.userId) {
        setError('Authentication required');
        return;
      }

      const cases = await caseService.getClientCases(authData.userId);
      
      // Filter only accepted cases that have a lawyer assigned
      const acceptedCasesWithLawyers = cases.filter(
        case_ => case_.status === 'ACCEPTED' && case_.lawyer
      );
      
      setAcceptedCases(acceptedCasesWithLawyers);
    } catch (err) {
      console.error('Error fetching accepted cases:', err);
      setError('Failed to load cases');
      setAcceptedCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (case_) => {
    if (onBookCase) {
      onBookCase(case_);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Accepted Cases</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading cases...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Accepted Cases</h2>
        <div className="flex items-center justify-center py-8 text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-600" />
        My Accepted Cases
      </h2>
      
      {acceptedCases.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 text-sm mb-2">No accepted cases</p>
          <p className="text-gray-500 text-xs">
            Submit a case to get started with legal assistance
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {acceptedCases.map((case_) => (
            <div
              key={case_.caseId}
              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
            >
              {/* Case Header */}
              <div className="mb-3">
                <div className="text-sm font-medium text-blue-600 mb-1">
                  #{case_.caseId}
                </div>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {case_.title}
                </h3>
              </div>

              {/* Lawyer Info */}
              <div className="mb-3 text-xs text-gray-600">
                <span>Lawyer: </span>
                <span className="font-medium text-gray-900">
                  {case_.lawyer?.Fname} {case_.lawyer?.Lname}
                </span>
              </div>

              {/* Book Button */}
              <button
                onClick={() => handleBookAppointment(case_)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {acceptedCases.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 Select a case above to book an appointment with your assigned lawyer
          </p>
        </div>
      )}
    </div>
  );
};