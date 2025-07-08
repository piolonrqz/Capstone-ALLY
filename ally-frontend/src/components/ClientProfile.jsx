import React from 'react';
import { MapPin, X, Mail, Phone, Calendar } from 'lucide-react';

const ClientProfile = ({ client, onClose }) => {
    if (!client) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading client profile...</p>
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
                            <div className="flex items-center justify-center w-20 h-20 text-2xl font-semibold text-white bg-green-500 rounded-full">
                                {client?.image ? (
                                    <img src={client.image} alt="Profile" className="object-cover w-full h-full rounded-full" />
                                ) : (
                                    ((client?.fname?.[0] || '') + (client?.lname?.[0] || '')).toUpperCase() || 'C'
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">{`${client?.fname || ''} ${client?.lname || ''}`}</h2>
                                <span className="inline-block px-3 py-1 mt-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                                    Client
                                </span>
                                <p className="flex items-center mt-2 text-gray-600">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {client?.address || 'No address provided'}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 mb-6 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 font-semibold">Contact Information</h3>
                                <p className="flex items-center text-gray-600 mb-2">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {client?.email}
                                </p>
                                <p className="flex items-center text-gray-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {client?.phone || 'No phone provided'}
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold">Account Details</h3>
                                <p className="flex items-center text-gray-600 mb-2">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Joined: {new Date(client?.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-3 font-semibold">Case History</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-600">
                                    {client?.totalCases ? `Total Cases: ${client.totalCases}` : 'No cases recorded'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientProfile; 