// src/components/ChatContainer.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import UserList from './UserList';
import Chat from './Chat';
import { toast } from 'react-toastify';

// Import services
import { fetchActiveConversations } from '../services/chatService';
import { fetchUserDetails } from '../utils/auth';

import { getAuthData, isAuthenticated } from '../utils/auth';

const ChatContainer = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [conversations, setConversations] = useState([]); // CHANGED: Renamed state for clarity
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { chatroomId } = useParams(); // For /messages/:chatroomId route

    // Load current user details from token
    const loadCurrentUser = useCallback(async () => {
        if (!isAuthenticated()) {
            toast.warn('Please log in to continue.');
            navigate('/login', { state: { from: location.pathname } });
            return null;
        }

        try {
            const authData = getAuthData();
            const userDetails = await fetchUserDetails(authData.userId);
            setCurrentUser(userDetails);
            return userDetails;
        } catch (error) {
            console.error('Error loading current user:', error);
            toast.error('Session expired. Please log in again.');
            navigate('/login');
            return null;
        }
    }, [navigate, location.pathname]);


    // The main effect to initialize the chat interface
    useEffect(() => {
        const initializeChat = async () => {
            setLoading(true);

            const user = await loadCurrentUser();
            if (!user) {
                // loadCurrentUser handles redirection, so we can stop here.
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch existing conversations using user ID
                const activeConvos = await fetchActiveConversations(user.id);

                // 2. Determine the selected user
                let userToSelect = null;
                
                // Priority 1: A user was passed via navigation state (e.g., clicking "Message" on a profile)
                const userFromState = location.state?.selectedUser;
                if (userFromState) {
                    userToSelect = userFromState;
                    // If this new user isn't already in our active conversations, add them to the list
                    if (!activeConvos.some(c => c.id === userFromState.id)) {
                        setConversations([userFromState, ...activeConvos]);
                    } else {
                        setConversations(activeConvos);
                    }
                // Priority 2: A chatroom ID is in the URL
                } else if (chatroomId) {
                    userToSelect = activeConvos.find(c => c.chatroomId === chatroomId);
                     setConversations(activeConvos);
                } else {
                    setConversations(activeConvos);
                }

                setSelectedUser(userToSelect);

            } catch (error) {
                console.error('Error initializing chat:', error.message);
                toast.error(`Failed to load chat conversations: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        initializeChat();
        
        // Cleanup navigation state to prevent re-selecting the same user on refresh
        return () => {
            if (location.state?.selectedUser) {
                navigate(location.pathname, { replace: true });
            }
        };
    }, [chatroomId, loadCurrentUser, location.state, navigate, location.pathname]);


    const handleSelectUser = (user) => {
        setSelectedUser(user);
        // Update the URL to reflect the selected chatroom, making the URL shareable
        navigate(`/messages/${user.chatroomId}`);
    };

    return (
        <div className="flex w-full h-screen bg-white">
            {/* Sidebar - User List (Active Conversations) */}
            <div className="flex flex-col border-r w-80">
                <div className="p-4 border-b">
                    {currentUser ? (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">{currentUser.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">
                                {currentUser.role}
                            </p>
                        </div>
                    ) : (
                        <div className="h-14 animate-pulse" /> // Placeholder for loading
                    )}
                </div>

                <UserList
                    users={conversations}
                    selectedUserId={selectedUser?.id}
                    onSelectUser={handleSelectUser} // CHANGED: Use a handler to update URL
                />
            </div>

            {/* Chat Area */}
            <div className="flex flex-col flex-1">
                {loading ? (
                    <div className="flex items-center justify-center flex-1">Loading chat...</div>
                ) : selectedUser && currentUser && selectedUser.id && currentUser.id ? (
                    <Chat
                        key={`${currentUser.id}-${selectedUser.id}`}
                        currentUserId={String(currentUser.id)}
                        receiverId={String(selectedUser.id)}
                        currentUserRole={currentUser.accountType}
                        currentUserName={currentUser.name}
                        receiverName={selectedUser.name}
                    />
                ) : (
                    <div className="flex items-center justify-center flex-1 bg-gray-50">
                        {selectedUser && !selectedUser.id ? (
                            <div className="text-center">
                                <div className="mb-4 text-5xl">⚠️</div>
                                <h2 className="text-2xl font-semibold text-gray-700">Invalid conversation</h2>
                                <p className="mt-2 text-gray-500">
                                    The selected user is invalid. Please try again.
                                </p>
                                <button
                                    className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    Back to conversations
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="mb-4 text-5xl">💼</div>
                                <h2 className="text-2xl font-semibold text-gray-700">Select a conversation</h2>
                                <p className="mt-2 text-gray-500">
                                    View your messages with clients or legal professionals.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatContainer;