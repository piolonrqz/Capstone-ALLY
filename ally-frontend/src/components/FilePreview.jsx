import React, { useState, useEffect } from 'react';
import { FileText, Image, AlertCircle, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { generateFilePreview, formatFileSize } from '../utils/filePreviewUtils.js';

const FilePreview = ({ file, onPreviewGenerated, onError }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    generatePreview();
  }, [file]);

  const generatePreview = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const previewData = await generateFilePreview(file);  
      setPreview(previewData);
      onPreviewGenerated?.(previewData);
    } catch (err) {
      console.error('Preview generation failed:', err);
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    generatePreview();
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const resetZoom = () => {
    setImageZoom(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Generating preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h4 className="text-lg font-medium text-red-800 mb-2">Preview Failed</h4>
        <p className="text-red-600 text-sm text-center mb-4 max-w-md">
          {error}
        </p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No preview available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File Metadata */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Name:</span>
            <span className="ml-2 text-gray-900">{preview.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Size:</span>
            <span className="ml-2 text-gray-900">{formatFileSize(preview.size)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <span className="ml-2 text-gray-900">{preview.mimeType || preview.type}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Modified:</span>
            <span className="ml-2 text-gray-900">
              {new Date(preview.lastModified).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {preview.type === 'image' && (
          <div className="bg-white">
            {/* Image Controls */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {preview.dimensions ? (
                  <span>
                    {preview.dimensions.width} × {preview.dimensions.height} pixels
                  </span>
                ) : (
                  <span>Image preview</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                  {Math.round(imageZoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={resetZoom}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Image Display */}
            <div className="flex items-center justify-center p-4 min-h-[300px] max-h-[500px] overflow-auto">
              <img
                src={preview.content}
                alt={preview.name}
                style={{ 
                  transform: `scale(${imageZoom})`,
                  transition: 'transform 0.2s ease-in-out'
                }}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}

        {preview.type === 'text' && (
          <div className="bg-white">
            {/* Text Controls */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Text File Preview
                {preview.truncated && (
                  <span className="ml-2 text-amber-600">(Truncated to first 10,000 characters)</span>
                )}
              </div>
              {preview.truncated && (
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {showFullText ? 'Show Less' : 'Show Full Text'}
                </button>
              )}
            </div>
            
            {/* Text Content */}
            <div className="p-4 max-h-[400px] overflow-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 bg-gray-50 p-4 rounded border">
                {showFullText ? preview.fullContent || preview.content : preview.content}
              </pre>
            </div>
          </div>
        )}

        {preview.type === 'generic' && (
          <div className="bg-white">
            <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gray-100 rounded-lg">
                {preview.icon === 'pdf' && (
                  <FileText className="w-8 h-8 text-red-600" />
                )}
                {preview.icon === 'word' && (
                  <FileText className="w-8 h-8 text-blue-600" />
                )}
                {preview.icon === 'excel' && (
                  <FileText className="w-8 h-8 text-green-600" />
                )}
                {!['pdf', 'word', 'excel'].includes(preview.icon) && (
                  <FileText className="w-8 h-8 text-gray-600" />
                )}
              </div>
              
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {preview.icon.toUpperCase()} File
              </h4>
              <p className="text-gray-600 text-center mb-4">
                Preview not available for this file type.
                <br />
                You can still save and upload this file.
              </p>
              
              <div className="text-sm text-gray-500 space-y-1 text-center">
                <p><strong>File name:</strong> {preview.name}</p>
                <p><strong>File size:</strong> {formatFileSize(preview.size)}</p>
                <p><strong>File type:</strong> {preview.mimeType || preview.type}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-gray-600">
          Preview generated successfully
        </span>
      </div>
    </div>
  );
};

export default FilePreview;