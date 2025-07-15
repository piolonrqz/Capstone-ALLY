import React, { useState } from 'react';
import { X, FileText, GraduationCap, Award, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// Utility function for proper text capitalization
const capitalizeText = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const LawyerCredentialsModal = ({ lawyer, isOpen, onClose }) => {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleViewDocument = async (document) => {
    try {
      setIsLoading(true);
      let documentUrl;

      if (typeof document === 'string') {
        documentUrl = document;
      } else if (document?.url) {
        documentUrl = document.url;
      } else if (document?.name) {
        // If it's a file object, try to get the URL
        documentUrl = document.name;
      }

      if (!documentUrl) {
        toast.error('Document URL not found');
        return;
      }

      // Check if it's a valid URL
      if (documentUrl.startsWith('http')) {
        // Open in new tab if it's a direct URL
        window.open(documentUrl, '_blank');
      } else {
        // If it's a local path, construct the full URL
        const baseUrl = 'http://localhost:8080'; // Replace with your backend URL
        const fullUrl = `${baseUrl}/documents/${documentUrl}`;
        window.open(fullUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to open document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Document Preview Modal
  const DocumentPreviewModal = ({ isOpen, onClose, document }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-4 w-full max-w-4xl mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Document Preview</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative aspect-[16/9]">
            {document?.type?.includes('pdf') ? (
              <iframe
                src={document.url}
                className="w-full h-full border-0"
                title="Document Preview"
              />
            ) : document?.type?.includes('image') ? (
              <img
                src={document.url}
                alt="Document Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Preview not available</p>
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Open in new tab <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Professional Credentials & Certifications
            </h3>
            <button
              onClick={onClose}
              className="p-1 ml-auto text-gray-600 transition-colors duration-200 hover:text-gray-900 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Education Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <GraduationCap className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">Educational Background</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Institution</label>
                    <p className="mt-1 text-gray-900">{lawyer.educationInstitution || 'Not Specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Degree</label>
                    <p className="mt-1 text-gray-900">{lawyer.degree || 'Bachelor of Laws'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Graduation Year</label>
                    <p className="mt-1 text-gray-900">{lawyer.graduationYear || 'Not Specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Academic Honors</label>
                    <p className="mt-1 text-gray-900">{lawyer.academicHonors || 'None Specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar License Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Award className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">Bar License Information</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Bar License Number</label>
                    <p className="mt-1 text-gray-900">{lawyer.barNumber || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Year Admitted</label>
                    <p className="mt-1 text-gray-900">{lawyer.yearAdmitted || 'Not Specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Jurisdiction</label>
                    <p className="mt-1 text-gray-900">{lawyer.jurisdiction || 'Philippines'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">License Status</label>
                    <div className="mt-1 flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">Supporting Documents</h4>
              </div>
              <div className="space-y-4">
                {lawyer.credentials ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          Bar License Certificate
                        </h4>
                        <p className="text-sm text-gray-500">
                          {typeof lawyer.credentials === 'string' 
                            ? lawyer.credentials 
                            : lawyer.credentials.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                        <button 
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          onClick={() => handleViewDocument(lawyer.credentials)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="w-3 h-3 mr-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                              Loading...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No Documents Uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
      />
    </div>
  );
};

export default LawyerCredentialsModal; 