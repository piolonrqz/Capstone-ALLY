import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import useLawyerStatus from '../hooks/useLawyerStatus.js';

const NotificationDropdown = ({ isOpen, onClose, currentUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { status, loading: statusLoading, isLawyer } = useLawyerStatus();

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            
            // TODO: Fetch system notifications from backend
            // This would be implemented when you add system notifications API
            const systemNotifications = [];

            // Add lawyer approval warning as a notification if applicable
            if (!statusLoading && isLawyer && status && status !== 'approved') {
                const approvalNotification = {
                    id: 'lawyer-approval-warning',
                    title: status === 'pending' 
                        ? 'Account Pending Approval' 
                        : 'Account Rejected',
                    message: status === 'pending'
                        ? 'Your lawyer account is pending admin approval. This usually takes 1-2 business days. You can still upload documents in Settings while you wait.'
                        : 'Your lawyer account has been rejected. Please contact support or check your credentials in Settings.',
                    type: status === 'rejected' ? 'error' : 'warning',
                    timestamp: new Date().toISOString(),
                    isLawyerApproval: true
                };
                systemNotifications.unshift(approvalNotification); // Add at the beginning
            }

            setNotifications(systemNotifications);
            setLoading(false);
        } catch (error) {
            console.error('Error loading notifications:', error);
            toast.error('Failed to load notifications');
            setLoading(false);
        }
    }, [status, isLawyer, statusLoading]);

    useEffect(() => {
        if (isOpen && currentUser?.id) {
            loadNotifications();
        }
    }, [isOpen, currentUser, loadNotifications]);


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
                                {notifications.map((notification) => {
                                    const isWarning = notification.type === 'warning' || notification.isLawyerApproval;
                                    const isError = notification.type === 'error';
                                    
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`p-3 rounded-lg transition-colors ${
                                                isError
                                                    ? 'bg-red-50 border border-red-200 hover:bg-red-100'
                                                    : isWarning
                                                    ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                                                    : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {(isWarning || isError) && (
                                                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                                        isError ? 'text-red-600' : 'text-amber-600'
                                                    }`} />
                                                )}
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${
                                                        isError ? 'text-red-900' : isWarning ? 'text-amber-900' : 'text-gray-900'
                                                    }`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className={`text-xs mt-1 ${
                                                        isError ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-gray-600'
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    {notification.timestamp && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(notification.timestamp).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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