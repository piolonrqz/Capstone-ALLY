import React from 'react';
import { FileX, Briefcase } from 'lucide-react';
import CaseCard from './CaseCard.jsx';

const CasesList = ({ cases, userRole, onStatusChange, onAppointmentBooked }) => {
  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          {userRole === 'CLIENT' ? (
            <FileX className="w-16 h-16 mx-auto text-gray-400" />
          ) : (
            <Briefcase className="w-16 h-16 mx-auto text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {userRole === 'CLIENT' ? 'No Cases Submitted Yet' : 'No Cases Assigned Yet'}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {userRole === 'CLIENT' 
            ? 'You haven\'t submitted any legal cases yet. Click "Submit New Case" to get started and connect with qualified legal professionals.'
            : 'You don\'t have any cases assigned to you yet. Cases will appear here when clients submit requests that match your expertise.'
          }
        </p>
        {userRole === 'CLIENT' && (
          <div className="text-sm text-gray-500">
            <p>💡 <strong>Tip:</strong> Be specific about your legal issue to get better matches with lawyers.</p>
          </div>
        )}
      </div>
    );
  }

  // Sort cases by date (newest first)
  const sortedCases = [...cases].sort((a, b) => {
    const dateA = new Date(a.dateSubmitted);
    const dateB = new Date(b.dateSubmitted);
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {/* Cases Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {cases.length} {cases.length === 1 ? 'case' : 'cases'}
        </p>
      </div>
      {/* Cases Grid */}
      <div className="grid gap-4">
        {sortedCases.map((case_) => (
          <CaseCard
            key={case_.caseId}
            case_={case_}
            userRole={userRole}
            onStatusChange={onStatusChange}
            onAppointmentBooked={onAppointmentBooked}
          />
        ))}
      </div>

      {/* Summary Stats */}
      {cases.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {cases.filter(c => c.status === 'PENDING').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {cases.filter(c => c.status === 'ACCEPTED').length}
              </p>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {cases.filter(c => c.status === 'DECLINED').length}
              </p>
              <p className="text-sm text-gray-600">Declined</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasesList;
