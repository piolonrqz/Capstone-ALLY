import React, { useState } from 'react';
import Avatar from './Avatar';

// Message Bubble Component
const MessageBubble = ({ message, isOwn, senderName, onEdit, onDelete, editingMessage, setEditingMessage }) => {
  const [showActions, setShowActions] = useState(false);
  const [editContent, setEditContent] = useState('');

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      {!isOwn && (
        <div className="flex-shrink-0 mt-1 mr-2">
          <Avatar name={senderName} size="sm" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`relative px-4 py-2.5 ${
            isOwn
              ? 'bg-blue-500 text-primary-foreground rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
              : 'bg-muted text-muted-foreground rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
          
          {message.hasFile && message.fileName && (
            <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 ${
              isOwn ? 'bg-primary/90' : 'bg-white'
            }`}>
              <div className={`p-2 rounded flex-shrink-0 ${isOwn ? 'bg-primary-foreground' : 'bg-muted/20'}`}>
                <svg className={`w-4 h-4 ${isOwn ? 'text-primary-foreground' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isOwn ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {message.fileName}
                </p>
                <p className={`text-xs ${isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {message.fileSize}
                </p>
              </div>
            </div>
          )}
          
          <div className={`flex items-center gap-1 mt-1 text-xs ${
            isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'
          }`}>
            <span>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.isEdited && <span>· Edited</span>}
          </div>

          {isOwn && showActions && (
            <div className="absolute top-0 right-0 z-10 flex items-center gap-1 px-2 py-1 -mt-8 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                onClick={onEdit}
                className="px-2 py-1 text-xs text-gray-600 rounded hover:text-gray-900 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="px-2 py-1 text-xs text-red-600 rounded hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
