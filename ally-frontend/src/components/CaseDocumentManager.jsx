import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, Trash2, Download, Search, Filter, AlertCircle, CheckCircle, Loader2, Eye, X, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { documentService } from '../services/documentService.js';
import { validateFile, formatFileSize } from '../utils/filePreviewUtils.js';
import FilePreview from './FilePreview.jsx';

const CaseDocumentManager = ({ caseId, caseInfo, userRole, authData, onDocumentsChange }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [documentContent, setDocumentContent] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Inline File List State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewingFile, setPreviewingFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  // Load case documents on mount and when caseId changes
  useEffect(() => {
    if (caseId) {
      loadCaseDocuments();
    }
  }, [caseId]);

  // Clean up invalid files on component mount/case change
  useEffect(() => {
    setSelectedFiles(prev => {
      const validFiles = prev.filter(file => file && file.name && typeof file.size !== 'undefined');
      if (validFiles.length !== prev.length) {
        return validFiles;
      }
      return prev;
    });
  }, [caseId]);

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

  // Process files for inline list
  const handleFiles = async (files) => {
    if (userRole !== 'CLIENT' && userRole !== 'LAWYER') {
      toast.error('Only clients or lawyers can upload documents');
      return;
    }

    if (files.length === 0) return;

    // Validate files using the new validation utility
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      // Check if file is already in the list
      if (selectedFiles.some(existing => existing.name === file.name && existing.size === file.size)) {
        errors.push(`${file.name}: File already selected`);
        return;
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.message}`);
        return;
      }
      
      // Additional legacy validation for compatibility
      if (!documentService.validateFileType(file.name)) {
        errors.push(`${file.name}: Unsupported file type`);
        return;
      }
      
      if (!documentService.validateFileSize(file.size)) {
        errors.push(`${file.name}: File size exceeds 20MB limit`);
        return;
      }
      
      // Add validation status and unique ID to file
      // Note: File object properties are getter-only, so we create a new object with copied properties
      const fileWithMeta = {
        // Copy File properties explicitly (since they're not enumerable)
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        // Keep reference to original File object for upload
        file: file,
        // Add metadata
        id: `${file.name}-${file.size}-${Date.now()}`,
        validationStatus: 'valid',
        uploadStatus: 'pending'
      };
      
      validFiles.push(fileWithMeta);
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length === 0) return;

    // Clean up any invalid files from existing state before adding new ones
    setSelectedFiles(prev => {
      const cleanedPrev = prev.filter(file => file && file.name && typeof file.size !== 'undefined');
      return [...cleanedPrev, ...validFiles];
    });
    toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added to upload queue`);
  };

  // Remove individual file from the list
  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
    toast.info('File removed from upload queue');
  };

  // Clear all files from the list
  const clearAllFiles = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    toast.info('All files cleared from upload queue');
  };

  // Upload a single file
  const uploadSingleFile = async (fileWithMeta) => {
    // Use the original File object for upload, or fallback to fileWithMeta if it's already a File
    const originalFile = fileWithMeta.file || fileWithMeta;
    
    const result = await documentService.uploadDocument(
      authData.userId,
      parseInt(caseId),
      originalFile,
      {
        documentName: fileWithMeta.name || originalFile.name || 'unknown',
        documentType: fileWithMeta.name ? documentService.getFileType(fileWithMeta.name) : 'unknown',
        status: 'uploaded'
      }
    );
    return result;
  };

  // Upload all selected files
  const uploadAllFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.info('No files selected for upload');
      return;
    }

    setUploading(true);
    const uploadedFiles = [];
    const failedFiles = [];

    for (const file of selectedFiles) {
      try {
        // Update file status to uploading
        setSelectedFiles(prev =>
          prev.map(f => f.id === file.id ? { ...f, uploadStatus: 'uploading' } : f)
        );
        
        // Set initial progress
        setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));
        
        // Upload the file
        await uploadSingleFile(file);
        
        // Update progress to complete
        setUploadProgress(prev => ({ ...prev, [file.id]: 100 }));
        
        // Update file status
        setSelectedFiles(prev =>
          prev.map(f => f.id === file.id ? { ...f, uploadStatus: 'completed' } : f)
        );
        
        uploadedFiles.push(file);
        toast.success(`${file.name} uploaded successfully`);
        
      } catch (error) {
        // Update progress to failed
        setUploadProgress(prev => ({ ...prev, [file.id]: -1 }));
        
        // Update file status
        setSelectedFiles(prev =>
          prev.map(f => f.id === file.id ? { ...f, uploadStatus: 'failed' } : f)
        );
        
        failedFiles.push(file);
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    // Remove successfully uploaded files from the list after a delay
    setTimeout(() => {
      setSelectedFiles(prev => prev.filter(file => file.uploadStatus !== 'completed'));
      setUploadProgress({});
    }, 2000);

    // Refresh document list
    await loadCaseDocuments();
    
    // Call optional callback to notify parent component of changes
    if (onDocumentsChange) {
      onDocumentsChange();
    }
    
    // Show summary
    if (uploadedFiles.length > 0) {
      toast.success(`Successfully uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`);
    }
    
    setUploading(false);
  };

  // Preview file from the selected list
  const previewSelectedFile = (fileWithMeta) => {
    // Use the original File object for preview, or fallback to fileWithMeta if it's already a File
    const originalFile = fileWithMeta.file || fileWithMeta;
    setPreviewingFile(originalFile);
    setShowFilePreview(true);
  };

  // Close file preview
  const closeFilePreview = () => {
    setShowFilePreview(false);
    setPreviewingFile(null);
  };

  // Delete document
  const handleDeleteDocument = async (documentId, documentName) => {


    if (!window.confirm(`Are you sure you want to delete "${documentName}"?`)) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      toast.success('Document deleted successfully');
      await loadCaseDocuments();
      
      // Call optional callback to notify parent component of changes
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document: ' + error.message);
    }
  };

  // Download document
  const handleDownloadDocument = async (documentId, documentName) => {
    try {
      await documentService.downloadDocument(documentId, documentName);
      toast.success('Download started successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error(error.message || 'An unexpected error occurred while downloading the document');
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

  // Filter documents based on search and type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'ALL' || doc.documentType.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Get unique file types for filter
  const uniqueTypes = [...new Set(documents.map(doc => doc.documentType))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        {/* Upload Section - Only for Clients and Lawyer */}
        {(userRole === 'CLIENT' || userRole === 'LAWYER') && (
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

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Selected Files ({selectedFiles.length})
                  </h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearAllFiles}
                      disabled={uploading}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                    <button
                      onClick={uploadAllFiles}
                      disabled={uploading || selectedFiles.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload All ({selectedFiles.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedFiles.filter(file => file && file.name && typeof file.size !== 'undefined').map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-gray-900 truncate">
                              {file.name}
                            </h5>
                            {file.uploadStatus === 'uploading' && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            )}
                            {file.uploadStatus === 'completed' && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {file.uploadStatus === 'failed' && (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {file.size ? formatFileSize(file.size) : 'Unknown size'} • {file.name ? documentService.getFileType(file.name).toUpperCase() : 'Unknown'}
                          </p>
                          
                          {/* Upload Progress Bar */}
                          {uploadProgress[file.id] !== undefined && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  uploadProgress[file.id] === 100 ? 'bg-green-500' :
                                  uploadProgress[file.id] === -1 ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.max(0, uploadProgress[file.id])}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => previewSelectedFile(file)}
                          disabled={uploading}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                          title="Preview File"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFile(file.id)}
                          disabled={uploading || file.uploadStatus === 'uploading'}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove File"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                        documentTypeUploaded {documentService.formatDate(doc.uploadedAt)}
                        {doc.uploaderName && doc.uploaderRole && (
                          <> • Uploaded by {doc.uploaderName} ({doc.uploaderRole === 'CLIENT' ? 'Client' : doc.uploaderRole === 'LAWYER' ? 'Lawyer' : doc.uploaderRole})</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewDocument(doc);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
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
                    
                    {(
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

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[95vh] w-full flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.documentName}</h3>
                <p className="text-sm text-gray-500">
                 Uploaded {documentService.formatDate(selectedDocument.uploadedAt)}
                  {selectedDocument.uploaderName && selectedDocument.uploaderRole && (
                    <> • Uploaded by {selectedDocument.uploaderName} ({selectedDocument.uploaderRole === 'CLIENT' ? 'Client' : selectedDocument.uploaderRole === 'LAWYER' ? 'Lawyer' : selectedDocument.uploaderRole})</>
                  )}
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

      {/* File Preview Modal */}
      {showFilePreview && previewingFile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Preview: {previewingFile.name}</h3>
                <p className="text-sm text-gray-500">
                  {previewingFile.size ? formatFileSize(previewingFile.size) : 'Unknown size'} • {previewingFile.name ? documentService.getFileType(previewingFile.name).toUpperCase() : 'Unknown'}
                </p>
              </div>
              <button
                onClick={closeFilePreview}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden p-4">
              <FilePreview
                file={previewingFile}
                onPreviewGenerated={() => {}}
                onError={(error) => {
                  console.error('Preview error:', error);
                  toast.error('Failed to generate preview');
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="text-sm text-gray-600">
                File ready for upload • Use "Upload All" button to upload this file along with others
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeFile(previewingFile.id)}
                  className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
                <button
                  onClick={closeFilePreview}
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

export default CaseDocumentManager;