import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Bell, X } from 'lucide-react';
import { fetchActiveConversations } from '../services/chatService';

const NotificationDropdown = ({ isOpen, onClose, currentUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [activeChats, setActiveChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && currentUser?.id) {
            loadNotifications();
        }
    }, [isOpen, currentUser]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            // Fetch active conversations
            const conversations = await fetchActiveConversations(currentUser.id);
            setActiveChats(conversations);

            // TODO: Fetch other system notifications
            // This would be implemented when you add system notifications

            setLoading(false);
        } catch (error) {
            console.error('Error loading notifications:', error);
            setLoading(false);
        }
    };

    const handleChatClick = (chatroomId) => {
        navigate(`/messages/${chatroomId}`);
        onClose();
    };

    // Format timestamp to relative time
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading notifications...</div>
                ) : (
                    <>
                        {/* Chat Notifications */}
                        {activeChats.length > 0 ? (
                            <div className="p-4 border-b border-gray-200">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Chats</h4>
                                {activeChats.map((chat) => (
                                    <button
                                        key={chat.chatroomId}
                                        onClick={() => handleChatClick(chat.chatroomId)}
                                        className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                                            <span className="text-sm font-medium text-blue-600">
                                                {chat.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900">{chat.name}</p>
                                                <span className="text-xs text-gray-500">
                                                    {formatTimestamp(chat.lastMessageTimestamp)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">
                                                {chat.lastMessage}
                                            </p>
                                        </div>
                                        <MessageCircle className="w-4 h-4 text-gray-400 ml-2" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No recent conversations
                            </div>
                        )}

                        {/* System Notifications */}
                        <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">System Notifications</h4>
                            {/* TODO: Add system notifications here */}
                            <div className="text-center text-gray-500 text-sm py-4">
                                No new system notifications
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => {
                        navigate('/messages');
                        onClose();
                    }}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    View All Messages
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown; 