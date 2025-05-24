import React, { useState, useRef } from 'react';
import { Upload, FileText, Eye, Trash2, X } from 'lucide-react';

const DocumentSubmission = () => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Mock initial documents for demonstration
  const [mockDocuments] = useState([
    {
      id: 1,
      name: 'Contract Agreement.pdf',
      type: 'pdf',
      size: '1.1 MB',
      uploaded: '09/12/2015'
    },
    {
      id: 2,
      name: 'Case Brief docs',
      type: 'docx',
      size: '343.5 KB',
      uploaded: '09/12/2015'
    }
  ]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Get file type from name
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return extension;
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  // Process uploaded files
  const handleFiles = async (files) => {
    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      type: getFileType(file.name),
      size: formatFileSize(file.size),
      uploaded: new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      })
    }));

    setUploadedDocuments(prev => [...prev, ...newDocuments]);
    setIsUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete document
  const handleDelete = (id) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  // View document (mock action)
  const handleView = (document) => {
    alert(`Opening ${document.name}`);
  };

  // Use mock documents if no documents uploaded (for demo purposes)
  const documentsToShow = uploadedDocuments.length > 0 ? uploadedDocuments : mockDocuments;

  return (
    <div className="min-h-screen p-4 bg-pink-100">
      <div className="max-w-4xl mx-auto">
        {/* Module Header */}
        <div className="px-4 py-2 text-white bg-gray-800 rounded-t-lg">
          <span className="font-medium">Module 4</span>
        </div>
        
        <div className="px-4 py-2 bg-pink-200">
          <span className="text-gray-700">document upload</span>
        </div>

        <div className="p-6 bg-white rounded-b-lg">
          <h2 className="mb-6 text-xl font-bold">Document Submission</h2>

          {/* Upload Section */}
          <div className="mb-8">
            <h3 className="mb-4 font-medium">Upload Document</h3>
            
            {/* Drag & Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center space-y-4">
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="mb-2 text-gray-600">
                    Drag and drop files here, or click to select files
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 underline hover:text-blue-800"
                    disabled={isUploading}
                  >
                    Browse files
                  </button>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="p-4 bg-blue-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    <span className="text-blue-800">Uploading documents...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Document Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 mt-4 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>

          {/* Documents Table */}
          <div>
            <h3 className="mb-4 font-medium">Your Documents</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-left text-gray-700 border-b">Name</th>
                    <th className="px-4 py-3 text-sm font-medium text-left text-gray-700 border-b">Type</th>
                    <th className="px-4 py-3 text-sm font-medium text-left text-gray-700 border-b">Size</th>
                    <th className="px-4 py-3 text-sm font-medium text-left text-gray-700 border-b">Uploaded</th>
                    <th className="px-4 py-3 text-sm font-medium text-left text-gray-700 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documentsToShow.map((document, index) => (
                    <tr key={document.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 border-b">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{document.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 border-b">
                        {document.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 border-b">
                        {document.size}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 border-b">
                        {document.uploaded}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(document)}
                            className="flex items-center px-3 py-1 space-x-1 text-sm text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className="flex items-center px-3 py-1 space-x-1 text-sm text-red-600 bg-red-100 rounded hover:bg-red-200"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {documentsToShow.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No documents uploaded yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSubmission;