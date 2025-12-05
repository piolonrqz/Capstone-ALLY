import React, { useState } from 'react';
import Avatar from './Avatar';

// Chat Info Sidebar Component
const ChatInfoSidebar = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('files');

  return (
    <div className="flex flex-col h-full bg-white border-l w-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-gray-900">Chat Info</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 text-center border-b">
        <div className="flex justify-center mb-3">
          <Avatar name={user?.name} size="xl" online />
        </div>
        <h4 className="font-semibold text-gray-900">Atty. {user?.name}</h4>
        <p className="text-sm text-gray-600 capitalize">{user?.accountType || user?.role}</p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b">
        <h4 className="mb-3 text-sm font-semibold text-gray-700">Quick Actions</h4>
        <div className="space-y-2">
          <button className="flex items-center w-full gap-3 p-3 text-left transition-colors rounded-lg hover:bg-gray-50">
            <svg className="flex-shrink-0 w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-900">Schedule Meeting</span>
          </button>
          <button className="flex items-center w-full gap-3 p-3 text-left transition-colors rounded-lg hover:bg-gray-50">
            <svg className="flex-shrink-0 w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-gray-900">Generate Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'files'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Files (0)
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'media'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Media
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'files' && (
          <div className="py-8 text-sm text-center text-gray-500">
            No files yet
          </div>
        )}
        {activeTab === 'media' && (
          <div className="py-8 text-sm text-center text-gray-500">
            No media files yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInfoSidebar;
