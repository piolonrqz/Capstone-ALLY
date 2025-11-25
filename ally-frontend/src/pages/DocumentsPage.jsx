import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowLeft, Files } from 'lucide-react';
import { toast } from 'sonner';
import { documentService } from '../services/documentService.js';
import { caseService } from '../services/caseService.jsx';
import { getAuthData } from '../utils/auth.jsx';
import CaseDocumentManager from '../components/CaseDocumentManager.jsx';

const DocumentsPage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [caseInfo, setCaseInfo] = useState(null);
  const [documentCounts, setDocumentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const [authData, setAuthData] = useState(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Get auth data on component mount
  useEffect(() => {
    const auth = getAuthData();
    
    if (!auth) {
      toast.error('Please log in to access documents');
      navigate('/login');
      return;
    }
    
    if (!auth.userId || !auth.accountType) {
      toast.error('Invalid authentication data. Please log in again.');
      navigate('/login');
      return;
    }
    
    setAuthData(auth);
    setUserRole(auth.accountType);
  }, [navigate]);

  // Load data when auth data is available
  useEffect(() => {
    if (authData) {
      if (caseId) {
        loadCaseInfo();
      } else {
        loadCasesWithDocuments();
      }
    }
  }, [authData, caseId]);

  // Add timeout for loading to prevent indefinite loading
  useEffect(() => {
    if (caseId && loading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
        setLoading(false);
        toast.error('Loading timeout. Please try refreshing the page.');
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    }
  }, [caseId, loading]);

  const loadCasesWithDocuments = async () => {
    try {
      setLoading(true);
      let allCases = [];
      
      if (authData.accountType === 'CLIENT') {
        allCases = await caseService.getClientCases(authData.userId);
      } else if (authData.accountType === 'LAWYER') {
        allCases = await caseService.getLawyerCases(authData.userId);
      }
      
      // Filter to only ACCEPTED cases
      const acceptedCases = allCases.filter(c => c.status === 'ACCEPTED');
      setCases(acceptedCases);
      
      // Load document counts for each case
      const counts = {};
      for (const case_ of acceptedCases) {
        try {
          const count = await documentService.getDocumentCount(case_.caseId);
          counts[case_.caseId] = count;
        } catch (error) {
          console.error(`Error loading document count for case ${case_.caseId}:`, error);
          counts[case_.caseId] = 0;
        }
      }
      setDocumentCounts(counts);
      
    } catch (error) {
      console.error('Error loading cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const loadCaseInfo = async () => {
    try {
      setLoading(true);
      
      let allCases = [];
      if (authData.accountType === 'CLIENT') {
        allCases = await caseService.getClientCases(authData.userId);
      } else if (authData.accountType === 'LAWYER') {
        allCases = await caseService.getLawyerCases(authData.userId);
      }
      
      const currentCase = allCases.find(c => c.caseId === parseInt(caseId));
      
      if (!currentCase) {
        toast.error(`Case #${caseId} not found or access denied`);
        navigate('/documents');
        return;
      }
      
      // Additional validation for case access
      if (currentCase.status !== 'ACCEPTED') {
        toast.error('Document access is only available for accepted cases');
        navigate('/documents');
        return;
      }
      
      setCaseInfo(currentCase);
      
    } catch (error) {
      console.error('Error loading case info:', error);
      toast.error(`Failed to load case information: ${error.message}`);
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to case documents
  const handleViewCaseDocuments = (caseId) => {
    navigate(`/documents/${caseId}`);
  };

  // Filter cases based on search term
  const filteredCases = cases.filter(case_ => {
    if (!searchTerm) return true;
    return case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           case_.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Callback function to refresh case info when documents change
  const handleDocumentsChange = () => {
    if (caseId) {
      loadCaseInfo();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Case List View (when no caseId parameter)
  if (!caseId) {
    return (
      <div className="container max-w-6xl px-4 mx-auto py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Document Management</h1>
              <p className="text-sm sm:text-base text-gray-600">
                {userRole === 'CLIENT'
                  ? 'Upload and manage documents for your cases'
                  : 'View and download case documents'
                }
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Cases List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Cases with Document Access ({filteredCases.length})
              </h2>
              
              {filteredCases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-6 flex justify-center">
                    <img 
                      src="/documents.jpg" 
                      alt="No documents" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-gray-900">
                    {cases.length === 0 ? 'No Accepted Cases Available' : 'No Cases Match Your Search'}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                    Documents can only be managed for accepted cases
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCases.map((case_) => (
                    <div
                      key={case_.caseId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {case_.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {case_.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                          <span>Case #{case_.caseId}</span>
                          <span>•</span>
                          <span>{documentCounts[case_.caseId] || 0} document{(documentCounts[case_.caseId] || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Files className="w-4 h-4" />
                            <span className="text-lg font-bold">{documentCounts[case_.caseId] || 0}</span>
                          </div>
                          <span className="text-xs font-medium text-gray-500">documents</span>
                        </div>
                        
                        <button
                          onClick={() => handleViewCaseDocuments(case_.caseId)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                          {userRole === 'CLIENT'
                            ? ((documentCounts[case_.caseId] || 0) > 0 ? 'Manage Documents' : 'Upload Documents')
                            : 'View Documents'
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      </div>
    );
  }

  // Case Document Detail View (when caseId parameter exists)
  if (!caseInfo) {
    return (
      <div className="container max-w-6xl px-4 mx-auto py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading case information...</span>
            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>Loading case #{caseId}...</p>
              <p>If this takes too long, please check the browser console for errors.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                {loadingTimeout ? 'Loading Timeout' : 'Case Not Found'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md mx-auto">
                {loadingTimeout
                  ? `Loading timed out for case #${caseId}. This might be due to network issues or server problems.`
                  : `Case #${caseId} could not be loaded or you don't have access to it.`
                }
              </p>
              {loadingTimeout && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Troubleshooting tips:</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                    <li>Check your internet connection</li>
                    <li>Make sure the case exists and you have access to it</li>
                    <li>Try refreshing the page</li>
                    <li>Check the browser console for error messages</li>
                  </ul>
                </div>
              )}
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/documents')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Documents
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Document Management
        </button>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Case Documents</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-1">{caseInfo.title}</p>
          <p className="text-xs sm:text-sm text-gray-500">Case ID: {caseInfo.caseId}</p>
        </div>
      </div>

      {/* Case Document Manager Component */}
      <CaseDocumentManager
        caseId={parseInt(caseId)}
        caseInfo={caseInfo}
        userRole={userRole}
        authData={authData}
        onDocumentsChange={handleDocumentsChange}
      />
    </div>
  );
};

export default DocumentsPage;