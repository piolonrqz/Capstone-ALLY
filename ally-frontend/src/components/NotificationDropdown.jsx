import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose, currentUser }) => {
    const [notifications, setNotifications] = useState([]);
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
            
            // TODO: Fetch system notifications from backend
            // This would be implemented when you add system notifications API

            setLoading(false);
        } catch (error) {
            console.error('Error loading notifications:', error);
            setLoading(false);
        }
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
                    <div className="p-8 text-center text-gray-500">Loading notifications...</div>
                ) : (
                    <div className="p-6">
                        {/* System Notifications */}
                        {notifications.length > 0 ? (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                        {notification.timestamp && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm font-medium">No notifications yet</p>
                                <p className="text-gray-400 text-xs mt-1">
                                    You'll be notified about important updates
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown; 