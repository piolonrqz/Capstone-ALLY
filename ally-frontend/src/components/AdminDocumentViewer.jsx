import React, { useState } from 'react';
import { FileText, Download, Eye, X, Loader2, AlertTriangle } from 'lucide-react';
import { documentService } from '../services/documentService';
import { toast } from 'sonner';

const AdminDocumentViewer = ({ document, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [previewContent, setPreviewContent] = useState(null);

    const handlePreview = async () => {
        setLoading(true);
        try {
            // For different file types, we'll handle them differently
            const fileType = documentService.getFileType(document.name).toLowerCase();
            
            const response = await fetch(document.url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load document');
            }

            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                setPreviewContent({ type: 'image', url: imageUrl });
            } else if (['txt', 'md'].includes(fileType)) {
                const text = await response.text();
                setPreviewContent({ type: 'text', content: text });
            } else if (fileType === 'pdf') {
                const blob = await response.blob();
                const pdfUrl = URL.createObjectURL(blob);
                setPreviewContent({ type: 'pdf', url: pdfUrl });
            } else {
                setPreviewContent({ type: 'unsupported' });
            }
        } catch (error) {
            console.error('Error loading preview:', error);
            toast.error('Failed to load document preview');
            setPreviewContent({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(document.url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download document');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = document.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Download started');
        } catch (error) {
            console.error('Error downloading document:', error);
            toast.error('Failed to download document');
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Document Preview</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {document.name} • {documentService.formatFileSize(document.size)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="min-h-[400px] mb-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-full min-h-[400px]">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <span className="ml-3 text-gray-600">Loading preview...</span>
                            </div>
                        ) : !previewContent ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-gray-600 mb-4">Click preview to view the document</p>
                                <button
                                    onClick={handlePreview}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview Document
                                </button>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px]">
                                {previewContent.type === 'image' && (
                                    <div className="flex items-center justify-center h-full">
                                        <img
                                            src={previewContent.url}
                                            alt={document.name}
                                            className="max-w-full max-h-[600px] object-contain"
                                        />
                                    </div>
                                )}
                                
                                {previewContent.type === 'pdf' && (
                                    <iframe
                                        src={previewContent.url}
                                        className="w-full h-[600px] border-0"
                                        title={document.name}
                                    />
                                )}
                                
                                {previewContent.type === 'text' && (
                                    <div className="bg-gray-50 rounded-lg p-4 h-full max-h-[600px] overflow-auto">
                                        <pre className="whitespace-pre-wrap font-mono text-sm">
                                            {previewContent.content}
                                        </pre>
                                    </div>
                                )}
                                
                                {previewContent.type === 'unsupported' && (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                                        <p className="text-gray-900 font-medium mb-2">Preview not available</p>
                                        <p className="text-gray-500 mb-4">This file type cannot be previewed</p>
                                        <button
                                            onClick={handleDownload}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Instead
                                        </button>
                                    </div>
                                )}
                                
                                {previewContent.type === 'error' && (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                                        <p className="text-gray-900 font-medium mb-2">Error loading preview</p>
                                        <p className="text-gray-500 mb-4">{previewContent.message}</p>
                                        <button
                                            onClick={handleDownload}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Try Downloading
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            {document.uploadedAt && `Uploaded ${documentService.formatDate(document.uploadedAt)}`}
                        </p>
                        <div className="flex gap-3">
                            {!previewContent && (
                                <button
                                    onClick={handlePreview}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                </button>
                            )}
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDocumentViewer; 