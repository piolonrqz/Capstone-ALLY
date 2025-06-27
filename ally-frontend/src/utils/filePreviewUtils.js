/**
 * Client-side file preview utilities for document review
 */

// Supported preview types and their handlers
const PREVIEW_HANDLERS = {
  'image/jpeg': handleImagePreview,
  'image/jpg': handleImagePreview,
  'image/png': handleImagePreview,
  'image/gif': handleImagePreview,
  'text/plain': handleTextPreview,
  'application/pdf': handleGenericPreview,
  'application/msword': handleGenericPreview,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': handleGenericPreview
};

/**
 * Generate a preview for a file based on its type
 * @param {File} file - The file to preview
 * @returns {Promise<Object>} Preview object with metadata and content
 */
export const generateFilePreview = (file) => {
  return new Promise((resolve, reject) => {
    const handler = PREVIEW_HANDLERS[file.type] || handleGenericPreview;
    handler(file)
      .then(preview => {
        resolve({
          ...preview,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          lastModified: file.lastModified
        });
      })
      .catch(error => {
        reject(new Error(`Preview generation failed: ${error.message}`));
      });
  });
};

/**
 * Handle image file preview
 */
function handleImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const dimensions = await getImageDimensions(e.target.result);
        resolve({
          type: 'image',
          content: e.target.result,
          dimensions: dimensions
        });
      } catch (error) {
        // If dimensions fail, still resolve with image content
        resolve({
          type: 'image',
          content: e.target.result,
          dimensions: null
        });
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions from data URL
 */
function getImageDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = dataUrl;
  });
}

/**
 * Handle text file preview
 */
function handleTextPreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      resolve({
        type: 'text',
        content: content.length > 10000 ? content.substring(0, 10000) + '...' : content,
        truncated: content.length > 10000
      });
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

/**
 * Handle generic file preview (non-image, non-text)
 */
function handleGenericPreview(file) {
  return Promise.resolve({
    type: 'generic',
    icon: getFileTypeIcon(file.type)
  });
}

/**
 * Get icon based on file type
 */
function getFileTypeIcon(fileType) {
  const typeMap = {
    'application/pdf': 'pdf',
    'application/msword': 'word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
    'application/vnd.ms-excel': 'excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel'
  };
  
  return typeMap[fileType] || 'file';
}

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  if (typeof bytes !== 'number' || isNaN(bytes)) return 'Unknown size';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Validate file on client-side before upload
 */
export const validateFile = (file) => {
  const maxSize = 20 * 1024 * 1024; // 20MB
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf', 'text/plain',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File size exceeds 20MB limit (${formatFileSize(file.size)})`
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `Unsupported file type: ${file.type}`
    };
  }
  
  return { valid: true };
};