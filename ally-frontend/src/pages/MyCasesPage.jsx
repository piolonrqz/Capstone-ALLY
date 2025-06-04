import React, { useState, useEffect } from 'react';
import { Plus, Filter, Loader2, AlertCircle } from 'lucide-react';
import { getAuthData } from '../utils/auth.jsx';
import { caseService } from '../services/caseService.jsx';
import CasesList from '../components/CasesList.jsx';
import CaseSubmissionForm from '../components/CaseSubmissionForm.jsx';

const MyCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [authData, setAuthData] = useState(null);

  // Get auth data on component mount
  useEffect(() => {
    const auth = getAuthData();
    if (!auth) {
      setError('You must be logged in to view cases');
      setLoading(false);
      return;
    }
    setAuthData(auth);
  }, []);

  // Fetch cases when auth data is available
  useEffect(() => {
    if (authData) {
      fetchCases();
    }
  }, [authData]);

  const fetchCases = async () => {
    if (!authData) return;

    try {
      setLoading(true);
      setError(null);

      let casesData = [];
      
      if (authData.accountType === 'CLIENT') {
        casesData = await caseService.getClientCases(authData.userId);
      } else if (authData.accountType === 'LAWYER') {
        casesData = await caseService.getLawyerCases(authData.userId);
      }

      setCases(casesData || []);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError(err.message || 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  // Filter cases based on status
  const filteredCases = cases.filter(case_ => {
    if (filterStatus === 'ALL') return true;
    return case_.status === filterStatus;
  });

  // Handle case submission success
  const handleCaseSubmitted = () => {
    setShowSubmissionForm(false);
    fetchCases(); // Refresh cases list
  };

  // Handle status change for lawyer
  const handleStatusChange = async (caseId, newStatus) => {
    try {
      if (newStatus === 'ACCEPTED') {
        await caseService.acceptCase(caseId);
      } else if (newStatus === 'DECLINED') {
        await caseService.declineCase(caseId);
      } else {
        await caseService.updateCaseStatus(caseId, newStatus);
      }
      
      // Refresh cases
      fetchCases();
    } catch (err) {
      console.error('Error updating case status:', err);
      setError('Failed to update case status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading your cases...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
        <div className="container max-w-5xl px-4 mx-auto py-8">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
      {/* Case Submission Modal */}
      {showSubmissionForm && (
        <CaseSubmissionForm
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={handleCaseSubmitted}
        />
      )}

      <div className="container max-w-5xl px-4 mx-auto">
        <div className="p-4 bg-white shadow-sm sm:p-6 md:p-8 rounded-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">
                {authData?.accountType === 'CLIENT' ? 'My Cases' : 'Assigned Cases'}
              </h1>
              <p className="text-sm text-gray-600 sm:text-base">
                {authData?.accountType === 'CLIENT' 
                  ? 'Track your legal case submissions and their progress'
                  : 'Manage cases assigned to you and update their status'
                }
              </p>
            </div>
            
            {/* Action Button - Only show for clients */}
            {authData?.accountType === 'CLIENT' && (
              <button
                onClick={() => setShowSubmissionForm(true)}
                className="flex items-center gap-2 px-4 py-2 mt-4 sm:mt-0 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Case</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>

          {/* Cases List */}
          <CasesList
            cases={filteredCases}
            userRole={authData?.accountType}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
};

export default MyCasesPage;
