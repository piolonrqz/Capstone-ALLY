// LawyerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, MessageCircle, X, FileText } from 'lucide-react';

import ChatModal from './ChatModal';
import CaseSubmissionForm from './CaseSubmissionForm';
import useCurrentUser from '../hooks/useCurrentUser';

export const LawyerProfile = ({ lawyer, onClose }) => {
    const navigate = useNavigate();
    const [isCaseSubmissionOpen, setIsCaseSubmissionOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const { currentUser, loading } = useCurrentUser();

    // Debug log for currentUser
    useEffect(() => {
        console.log('LawyerProfile currentUser:', currentUser);
    }, [currentUser]);

    const handleMessage = () => {
        if (loading) {
            console.log('Still loading user data...');
            return;
        }

        if (currentUser && currentUser.id) {
            console.log('User data available, opening chat modal:', currentUser);
            setIsChatModalOpen(true);
        } else {
            console.error('User data not available, redirecting to login. Current user:', currentUser);
            navigate('/login');
        }
    };

    // Helper to robustly get education institution (camelCase or snake_case)
    const getEducationInstitution = (lawyerObj) => {
        return (
            lawyerObj?.educationInstitution ||
            lawyerObj?.education_institution ||
            lawyerObj?.EducationInstitution ||
            lawyerObj?.education ||
            ''
        );
    };

    // Helper to robustly get cases handled (camelCase and snake_case)
    const getCasesHandled = (lawyerObj) => {
        return lawyerObj?.casesHandled ?? lawyerObj?.cases_handled;
    };

    if (!lawyer) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading lawyer profile...</p>
            </div>
        );
    }

    return (
        <>
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
                            <div className="flex items-center justify-center w-20 h-20 text-2xl font-semibold text-white bg-blue-500 rounded-full">
                                {lawyer?.image ? (
                                    <img src={lawyer.image} alt="Profile" className="object-cover w-full h-full rounded-full" />
                                ) : (
                                    ((lawyer?.firstName?.charAt(0) || '') + (lawyer?.lastName?.charAt(0) || '')).toUpperCase() || 'L'
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">{lawyer?.name || `${lawyer?.firstName || ''} ${lawyer?.lastName || ''}`}</h2>
                                <span className="inline-block px-3 py-1 mt-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                                    {lawyer?.specialty || 'Legal Advisor'}
                                </span>
                                <p className="flex items-center mt-2 text-gray-600">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {lawyer?.location || lawyer?.city || ''}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 mb-6 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 font-semibold">Cases Handled</h3>
                                <p className="font-semibold text-blue-600">{getCasesHandled(lawyer) !== undefined ? getCasesHandled(lawyer) : 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold">Experience</h3>
                                <p>{lawyer?.experience || 'No experience listed.'}</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold">Availability</h3>
                                <p>Available</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold">Education</h3>
                                <p>{getEducationInstitution(lawyer) || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-3 font-semibold">Areas of Practice</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(lawyer?.areas) && lawyer.areas.length > 0 ? (
                                    lawyer.areas.map((area, index) => (
                                        <span key={index} className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full">
                                            {area}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400">No areas listed</span>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleMessage}
                                className="flex items-center justify-center flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message
                            </button>
                            <button
                                onClick={() => setIsCaseSubmissionOpen(true)}
                                className="flex items-center justify-center flex-1 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Submit Case
                            </button>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            {currentUser && currentUser.id && (
                <ChatModal
                    isOpen={isChatModalOpen}
                    onClose={() => setIsChatModalOpen(false)}
                    currentUserId={currentUser.id}
                    receiverId={String(lawyer?._id || lawyer?.id)}
                    currentUserRole={currentUser.role}
                    currentUserName={currentUser.name}
                    receiverName={lawyer ? `${lawyer?.firstName || ''} ${lawyer?.lastName || ''}`.trim() : 'Unknown Lawyer'}
                />
            )}

            {isCaseSubmissionOpen && (
                <CaseSubmissionForm
                    onClose={() => setIsCaseSubmissionOpen(false)}
                    onSuccess={() => {
                        setIsCaseSubmissionOpen(false);
                        // Optionally close the lawyer profile modal as well
                        onClose();
                    }}
                    selectedLawyer={{
                        id: lawyer?.userId || lawyer?.id,
                        name: lawyer?.name || `${lawyer?.firstName || ''} ${lawyer?.lastName || ''}`.trim()
                    }}
                />
            )}
        </>
    );
};
