import React from 'react';
import { MapPin, X, Mail, Phone, Calendar, Shield, Activity } from 'lucide-react';

const AdminProfile = ({ admin, onClose }) => {
    if (!admin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading admin profile...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                <div className="relative inline-block overflow-hidden text-left align-bottom transition-all transform bg-white shadow-xl rounded-xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="absolute right-4 top-4">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8">
                        <div className="flex items-start mb-6 space-x-4">
                            <div className="flex items-center justify-center w-20 h-20 text-2xl font-semibold text-white bg-purple-500 rounded-full">
                                {admin?.image ? (
                                    <img src={admin.image} alt="Profile" className="object-cover w-full h-full rounded-full" />
                                ) : (
                                    ((admin?.fname?.[0] || '') + (admin?.lname?.[0] || '')).toUpperCase() || 'A'
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">{`${admin?.fname || ''} ${admin?.lname || ''}`}</h2>
                                <span className="inline-block px-3 py-1 mt-1 text-sm font-medium text-purple-800 bg-purple-100 rounded-full">
                                    Administrator
                                </span>
                                <p className="flex items-center mt-2 text-gray-600">
                                    <Shield className="w-4 h-4 mr-1" />
                                    System Administrator
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 mb-6 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 font-semibold">Contact Information</h3>
                                <p className="flex items-center text-gray-600 mb-2">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {admin?.email}
                                </p>
                                <p className="flex items-center text-gray-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {admin?.phone || 'No phone provided'}
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold">Account Details</h3>
                                <p className="flex items-center text-gray-600 mb-2">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Joined: {new Date(admin?.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="flex items-center text-gray-600">
                                    <Activity className="w-4 h-4 mr-2" />
                                    Status: {admin?.isVerified ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-3 font-semibold">Administrative Privileges</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <ul className="space-y-2 text-gray-600">
                                    <li>• User Management</li>
                                    <li>• System Configuration</li>
                                    <li>• Content Management</li>
                                    <li>• Analytics Access</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile; 