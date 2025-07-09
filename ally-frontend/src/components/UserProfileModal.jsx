import React from 'react';
import { LawyerProfile } from './LawyerProfile';
import ClientProfile from './ClientProfile';
import AdminProfile from './AdminProfile';
import AdminViewProfile from './AdminViewProfile';

const UserProfileModal = ({ user, onClose, isAdminView = false }) => {
    if (!user) return null;

    // If it's admin view, use the AdminViewProfile component
    if (isAdminView) {
        return <AdminViewProfile user={user} onClose={onClose} />;
    }

    // Convert role to lowercase for consistent comparison
    const role = user.role?.toLowerCase();

    switch (role) {
        case 'lawyer':
            return <LawyerProfile lawyer={user} onClose={onClose} />;
        case 'client':
            return <ClientProfile client={user} onClose={onClose} />;
        case 'admin':
            return <AdminProfile admin={user} onClose={onClose} />;
        default:
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <p className="text-gray-600">Unknown user type</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            );
    }
};

export default UserProfileModal; 