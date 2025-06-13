import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, Download, Search, Filter, AlertCircle, CheckCircle, Loader2, ArrowLeft, FolderOpen, Files, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { documentService } from '../services/documentService.js';
import { caseService } from '../services/caseService.jsx';
import { getAuthData } from '../utils/auth.jsx';

const DocumentsPage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [caseInfo, setCaseInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentCounts, setDocumentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [userRole, setUserRole] = useState('');
  const [authData, setAuthData] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [documentContent, setDocumentContent] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Get auth data on component mount
  useEffect(() => {
    const auth = getAuthData();
    if (!auth) {
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
        loadCaseDocuments();
      } else {
        loadCasesWithDocuments();
      }
    }
  }, [authData, caseId]);

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
      let allCases = [];
      if (authData.accountType === 'CLIENT') {
        allCases = await caseService.getClientCases(authData.userId);
      } else if (authData.accountType === 'LAWYER') {
        allCases = await caseService.getLawyerCases(authData.userId);
      }
      
      const currentCase = allCases.find(c => c.caseId === parseInt(caseId));
      if (!currentCase) {
        toast.error('Case not found or access denied');
        navigate('/documents');
        return;
      }
      
      setCaseInfo(currentCase);
    } catch (error) {
      console.error('Error loading case info:', error);
      toast.error('Failed to load case information');
      navigate('/documents');
    }
  };

  const loadCaseDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getCaseDocuments(parseInt(caseId));
      setDocuments(docs || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  // Handle drag and drop
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  // Process files for upload
  const handleFiles = async (files) => {
    if (userRole !== 'CLIENT') {
      toast.error('Only clients can upload documents');
      return;
    }

    if (files.length === 0) return;

    // Validate files
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      if (!documentService.validateFileType(file.name)) {
        errors.push(`${file.name}: Unsupported file type`);
        return;
      }
      
      if (!documentService.validateFileSize(file.size)) {
        errors.push(`${file.name}: File size exceeds 20MB limit`);
        return;
      }
      
      validFiles.push(file);
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length === 0) return;

    await uploadFiles(validFiles);
  };

  // Upload files to the server
  const uploadFiles = async (files) => {
    setUploading(true);
    
    const uploadPromises = files.map(async (file, index) => {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const result = await documentService.uploadDocument(
          authData.userId,
          parseInt(caseId),
          file,
          {
            documentName: file.name,
            documentType: documentService.getFileType(file.name),
            status: 'uploaded'
          }
        );

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        toast.success(`${file.name} uploaded successfully`);
        
        return result;
      } catch (error) {
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        throw error;
      }
    });

    try {
      await Promise.all(uploadPromises);
      await loadCaseDocuments();
    } catch (error) {
      console.error('Some uploads failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentId, documentName) => {
    if (userRole !== 'CLIENT') {
      toast.error('Only clients can delete documents');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${documentName}"?`)) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      toast.success('Document deleted successfully');
      await loadCaseDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document: ' + error.message);
    }
  };

  // Download document
  const handleDownloadDocument = async (documentId, documentName) => {
    try {
      await documentService.downloadDocument(documentId, documentName);
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document: ' + error.message);
    }
  };

  // Handle document preview
  const handlePreviewDocument = async (document) => {
    setSelectedDocument(document);
    setShowDocumentViewer(true);
    setLoadingPreview(true);
    
    try {
      // For different file types, we'll handle them differently
      const fileType = document.documentType.toLowerCase();
      
      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
        // For images, we can use the download URL directly
        const response = await fetch(`http://localhost:8080/api/documents/${document.documentId}/download`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.token}`,
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setDocumentContent({ type: 'image', url: imageUrl });
        } else {
          throw new Error('Failed to load image');
        }
      }  else if (['txt', 'md'].includes(fileType)) {
        // For text files, we'll fetch and display the content
        const response = await fetch(`http://localhost:8080/api/documents/${document.documentId}/download`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.token}`,
          }
        });
        
        if (response.ok) {
          const text = await response.text();
          setDocumentContent({ type: 'text', content: text });
        } else {
          throw new Error('Failed to load text file');
        }
      } else {
        // For other file types, show a message that preview is not available
        setDocumentContent({ type: 'unsupported' });
      }
    } catch (error) {
      console.error('Error loading document preview:', error);
      toast.error('Failed to load document preview');
      setDocumentContent({ type: 'error', message: error.message });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCloseViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
    setDocumentContent(null);
    setLoadingPreview(false);
    
    // Clean up any object URLs to prevent memory leaks
    if (documentContent && documentContent.url) {
      URL.revokeObjectURL(documentContent.url);
    }
  };

  // Navigate to case documents
  const handleViewCaseDocuments = (caseId) => {
    navigate(`/documents/${caseId}`);
  };

  // Filter documents based on search and type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'ALL' || doc.documentType.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Get unique file types for filter
  const uniqueTypes = [...new Set(documents.map(doc => doc.documentType))];

  // Filter cases based on search term
  const filteredCases = cases.filter(case_ => {
    if (!searchTerm) return true;
    return case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           case_.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Case List View (when no caseId parameter)
  if (!caseId) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
        <div className="container max-w-6xl px-4 mx-auto py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Management</h1>
              <p className="text-gray-600">
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
              <h2 className="text-lg font-semibold mb-4">
                Cases with Document Access ({filteredCases.length})
              </h2>
              
              {filteredCases.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">
                    {cases.length === 0 ? 'No accepted cases available' : 'No cases match your search'}
                  </p>
                  <p className="text-sm text-gray-400">
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
                        <h3 className="font-medium text-gray-900 truncate">
                          {case_.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {case_.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Case #{case_.caseId}</span>
                          <span>•</span>
                          <span>{documentCounts[case_.caseId] || 0} document{(documentCounts[case_.caseId] || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Files className="w-4 h-4" />
                            <span className="font-medium">{documentCounts[case_.caseId] || 0}</span>
                          </div>
                          <span className="text-xs text-gray-500">documents</span>
                        </div>
                        
                        <button
                          onClick={() => handleViewCaseDocuments(case_.caseId)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
      </div>
    );
  }

  // Case Document Detail View (when caseId parameter exists)
  if (!caseInfo) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading case information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Case Documents</h1>
            <p className="text-gray-600 mb-1">{caseInfo.title}</p>
            <p className="text-sm text-gray-500">Case ID: {caseInfo.caseId}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* Upload Section - Only for Clients */}
            {userRole === 'CLIENT' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop files here, or click to select files
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG (Max 20MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="document-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="document-upload"
                    className={`inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                      uploading 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Select Files'
                    )}
                  </label>
                </div>

                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <div key={fileName} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                progress === 100 ? 'bg-green-500' : progress === -1 ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.max(0, progress)}%` }}
                            />
                          </div>
                        </div>
                        {progress === 100 && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {progress === -1 && <AlertCircle className="w-4 h-4 text-red-500" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Documents List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Documents ({filteredDocuments.length})
                </h3>
              </div>
              
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">
                    {documents.length === 0 ? 'No documents uploaded yet' : 'No documents match your search'}
                  </p>
                  {userRole === 'CLIENT' && documents.length === 0 && (
                    <p className="text-sm text-gray-400">Upload documents to share them with your lawyer</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.documentId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer" onClick={() => handlePreviewDocument(doc)}>
                        <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                            {doc.documentName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {doc.documentType.toUpperCase()} • Uploaded {documentService.formatDate(doc.uploadedAt)}
                            {doc.uploaderName && ` by ${doc.uploaderName}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewDocument(doc);
                          }}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                          title="Preview"
                          disabled={!doc.documentId}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadDocument(doc.documentId, doc.documentName);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                          title="Download"
                          disabled={!doc.documentId}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        {userRole === 'CLIENT' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(doc.documentId, doc.documentName);
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                            title="Delete"
                            disabled={!doc.documentId}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[95vh] w-full flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.documentName}</h3>
                <p className="text-sm text-gray-500">
                  {selectedDocument.documentType.toUpperCase()} •
                  Uploaded {documentService.formatDate(selectedDocument.uploadedAt)}
                  {selectedDocument.uploaderName && ` by ${selectedDocument.uploaderName}`}
                </p>
              </div>
              <button
                onClick={handleCloseViewer}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden p-4">
              {loadingPreview ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading preview...</span>
                </div>
              ) : documentContent ? (
                <div className="h-full">
                  {documentContent.type === 'image' && (
                    <div className="flex items-center justify-center h-full">
                      <img
                        src={documentContent.url}
                        alt={selectedDocument.documentName}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  
                  {documentContent.type === 'pdf' && (
                    <iframe
                      src={documentContent.url}
                      className="w-full h-full border-0 rounded"
                      title={selectedDocument.documentName}
                    />
                  )}
                  
                  {documentContent.type === 'text' && (
                    <div className="h-full overflow-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm p-4 bg-gray-50 rounded h-full overflow-auto">
                        {documentContent.content}
                      </pre>
                    </div>
                  )}
                  
                  {documentContent.type === 'unsupported' && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <FileText className="w-16 h-16 mb-4 text-gray-400" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h4>
                      <p className="text-gray-600 mb-4">
                        Preview is not supported for {selectedDocument.documentType.toUpperCase()} files.
                      </p>
                      <button
                        onClick={() => handleDownloadDocument(selectedDocument.documentId, selectedDocument.documentName)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download File
                      </button>
                    </div>
                  )}
                  
                  {documentContent.type === 'error' && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <AlertCircle className="w-16 h-16 mb-4 text-red-400" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Preview</h4>
                      <p className="text-gray-600 mb-4">{documentContent.message}</p>
                      <button
                        onClick={() => handleDownloadDocument(selectedDocument.documentId, selectedDocument.documentName)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Try Download Instead
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Click anywhere on the document name to preview • Use buttons to download or delete
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadDocument(selectedDocument.documentId, selectedDocument.documentName)}
                  className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleCloseViewer}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;