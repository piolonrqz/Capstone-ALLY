import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import { fetchUserDetails } from '../utils/auth';

const ChatModal = ({ 
  isOpen, 
  onClose, 
  currentUserId, 
  receiverId, 
  currentUserRole, 
  currentUserName, 
  receiverName 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [receiverDetails, setReceiverDetails] = useState(null);
  const [error, setError] = useState(null);

  // Debug log for all props
  useEffect(() => {
    console.log('ChatModal props:', {
      isOpen,
      currentUserId,
      receiverId,
      currentUserRole,
      currentUserName,
      receiverName
    });
  }, [isOpen, currentUserId, receiverId, currentUserRole, currentUserName, receiverName]);

  // Debug log for currentUserRole
  useEffect(() => {
    console.log('ChatModal received currentUserRole:', currentUserRole);
  }, [currentUserRole]);

  // Load receiver details when modal opens
  useEffect(() => {
    if (isOpen && receiverId && !receiverName) {
      setIsLoading(true);
      setError(null);
      
      fetchUserDetails(receiverId)
        .then(details => {
          setReceiverDetails(details);
        })
        .catch(err => {
          console.error('Failed to load receiver details:', err);
          setError('Failed to load contact information');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, receiverId, receiverName]);

  // Handle modal close with cleanup
  const handleClose = () => {
    setReceiverDetails(null);
    setError(null);
    onClose();
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine the display name for the receiver
  const displayReceiverName = receiverName || 
    receiverDetails?.fullName || 
    receiverDetails?.firstName || 
    'Unknown Contact';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-lg w-[500px] h-[600px] flex flex-col shadow-2xl max-w-[90vw] max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b rounded-t-lg bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <span className="text-sm font-medium text-blue-600">
                {displayReceiverName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isLoading ? 'Loading...' : displayReceiverName}
              </h3>
              {receiverDetails?.accountType && (
                <p className="text-xs text-gray-500 capitalize">
                  {receiverDetails.accountType}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 transition-colors rounded-full hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="mb-2 text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 text-sm text-red-700 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          ) : !currentUserId ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="mb-2 text-yellow-700">Authentication Required</p>
                <p className="mb-4 text-sm text-gray-600">Please log in to start chatting</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Go to Login
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <p className="text-gray-600">Loading chat...</p>
              </div>
            </div>
          ) : (
            <Chat
              currentUserId={currentUserId}
              receiverId={receiverId}
              currentUserRole={currentUserRole}
              currentUserName={currentUserName}
              receiverName={displayReceiverName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;