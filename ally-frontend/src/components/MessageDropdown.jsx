import React, { useState, useEffect } from 'react';
import { X, Edit, ArrowLeft, Search, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';

const MessageDropdown = ({ isOpen, onClose, conversations = [], currentUser, loading = false, onRefresh }) => {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Check if current user is a lawyer
  const isLawyer = currentUser?.accountType === 'LAWYER';

  // Refresh conversations when coming back from chat view
  useEffect(() => {
    if (!selectedConversation && isOpen && onRefresh) {
      onRefresh();
    }
  }, [selectedConversation, isOpen]);

  // Update suggested users when conversations change
  useEffect(() => {
    if (isLawyer) {
      // If current user is a lawyer, show clients
      const clients = conversations.filter(c => c.accountType !== 'LAWYER');
      setSuggestedUsers(clients);
    } else {
      // If current user is a client, show lawyers
      const lawyers = conversations.filter(c => c.accountType === 'LAWYER');
      setSuggestedUsers(lawyers);
    }
  }, [conversations, isLawyer]);

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setShowNewMessage(false);
  };

  const handleNewMessageClick = () => {
    setShowNewMessage(true);
  };

  const handleBackClick = () => {
    setShowNewMessage(false);
    setSearchQuery('');
  };

  const handleBackToInbox = () => {
    setSelectedConversation(null);
    setShowNewMessage(false);
    // Refresh conversations when going back to inbox
    if (onRefresh) {
      onRefresh();
    }
  };

  const filteredUsers = suggestedUsers.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    // Less than 1 minute
    if (diffInMinutes < 1) return 'Just now';
    
    // Less than 1 hour
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    // Less than 24 hours
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    // Less than 7 days
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    // More than 7 days - show date
    const options = { month: 'short', day: 'numeric' };
    if (messageDate.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }
    return messageDate.toLocaleDateString('en-US', options);
  };

  if (!isOpen) return null;

  // Chat View
  if (selectedConversation && currentUser) {
    return (
      <div className="absolute right-0 mt-2 w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
          <button
            onClick={handleBackToInbox}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            {selectedConversation.profilePhotoUrl ? (
              <img
                src={selectedConversation.profilePhotoUrl}
                alt={selectedConversation.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {selectedConversation.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">{selectedConversation.name}</h3>
              <p className="text-xs text-gray-500">{selectedConversation.accountType || 'User'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Component */}
        <div className="flex-1 overflow-hidden">
          <Chat
            currentUserId={String(currentUser.id)}
            receiverId={String(selectedConversation.id)}
            currentUserRole={currentUser.accountType}
            currentUserName={currentUser.name}
            receiverName={selectedConversation.name}
            compact={true}
          />
        </div>
      </div>
    );
  }

  // New Message View
  if (showNewMessage) {
    return (
      <div className="absolute right-0 mt-2 w-80 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button
            onClick={handleBackClick}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">New message</h3>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={isLawyer ? "Search clients..." : "Search lawyers..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Suggested Users */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {isLawyer ? "Potential Clients" : "Suggested Lawyers"}
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="px-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleConversationClick(user)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {user.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.accountType === 'LAWYER' ? 'Lawyer' : 'Client'}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <p className="text-gray-500 text-sm text-center">
                {searchQuery 
                  ? `No ${isLawyer ? 'clients' : 'lawyers'} found` 
                  : `No suggested ${isLawyer ? 'clients' : 'lawyers'} available`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-80 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Inbox</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Message Button */}
      <div className="px-4 py-3 border-b border-gray-100">
        <button 
          onClick={handleNewMessageClick}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Edit className="w-4 h-4" />
          </div>
          <span className="font-medium">New message</span>
        </button>
      </div>

      {/* Conversations List or Empty State */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading conversations...</div>
        </div>
      ) : conversations.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 group"
            >
              {conversation.profilePhotoUrl ? (
                <img
                  src={conversation.profilePhotoUrl}
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white font-semibold text-base">
                    {conversation.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0 text-left pt-1">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <p className="font-semibold text-gray-900 truncate text-sm">
                    {conversation.name}
                  </p>
                  {conversation.lastMessageTimestamp && (
                    <span className="text-xs text-gray-500 flex-shrink-0 font-medium">
                      {formatMessageTime(conversation.lastMessageTimestamp.toDate ? conversation.lastMessageTimestamp.toDate() : conversation.lastMessageTimestamp)}
                    </span>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-gray-600 truncate leading-relaxed line-clamp-2">
                    {conversation.lastMessage}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-6">
          {/* Penguin SVG */}
          <div className="mb-4">
            <img 
              src="/pinguin.svg" 
              alt="No messages" 
              className="w-48 h-36 object-contain"
            />
          </div>

          {/* Text */}
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            No Messages Yet
          </h4>
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            Looks like you haven't initiated a conversation with any of our professionals.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageDropdown;

