import React, { useState, useEffect } from 'react';
import UserList from './UserList';
import Chat from './Chat';
import { toast } from 'react-toastify';

const ChatContainer = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState({
        id: 'lawyer123',
        name: 'John Doe',
        role: 'lawyer',
        specialization: 'Criminal Law'
    });

    useEffect(() => {
        const initializeChat = async () => {
            try {
                await loadUsers();
                toast.success(`Welcome ${currentUser.name}!`);
            } catch (error) {
                console.error('Error setting up chat:', error);
                toast.error('Error loading chat data');
            } finally {
                setLoading(false);
            }
        };

        initializeChat();
    }, [currentUser.name]);

    const loadUsers = async () => {
        try {
            // Simulate different user lists based on current user's role
            const testUsers = currentUser.role === 'lawyer' ? [
                { 
                    id: 'client1', 
                    name: 'Sarah Johnson',
                    role: 'client',
                    lastMessage: 'I need help with my case',
                    caseType: 'Family Law'
                },
                { 
                    id: 'client2', 
                    name: 'Michael Chen',
                    role: 'client',
                    lastMessage: 'When can we schedule a meeting?',
                    caseType: 'Criminal Law'
                }
            ] : [
                { 
                    id: 'lawyer123', 
                    name: 'John Doe',
                    role: 'lawyer',
                    lastMessage: 'I\'ll review your case',
                    specialization: 'Criminal Law'
                },
                { 
                    id: 'lawyer456', 
                    name: 'Emma Wilson',
                    role: 'lawyer',
                    lastMessage: 'Let me help you with that',
                    specialization: 'Family Law'
                }
            ];
            setUsers(testUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
            throw error;
        }
    };

    // Function to switch between lawyer and client view for testing
    const switchUserRole = () => {
        const newUser = currentUser.role === 'lawyer' ? {
            id: 'client1',
            name: 'Sarah Johnson',
            role: 'client',
            caseType: 'Family Law'
        } : {
            id: 'lawyer123',
            name: 'John Doe',
            role: 'lawyer',
            specialization: 'Criminal Law'
        };
        setCurrentUser(newUser);
        setSelectedUser(null); // Clear selected user
        setLoading(true); // Reload user list
    };

    return (        <div className="flex w-full h-screen overflow-hidden bg-white">
            <div className="flex flex-col">
                <div className="p-4 border-b">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">{currentUser.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                            {currentUser.role} • {currentUser.specialization || currentUser.caseType}
                        </p>
                    </div>
                    <button 
                        onClick={switchUserRole}
                        className="w-full px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Switch to {currentUser.role === 'lawyer' ? 'Client' : 'Lawyer'} View
                    </button>
                </div>
                <UserList 
                    users={users}
                    selectedUserId={selectedUser?.id}
                    onSelectUser={(userId) => {
                        const user = users.find(u => u.id === userId);
                        setSelectedUser(user);
                    }}
                />
            </div>
            {loading ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                        <div className="mb-4">Loading...</div>
                    </div>
                </div>
            ) : selectedUser ? (
                <Chat 
                    currentUserId={currentUser.id}
                    receiverId={selectedUser.id}
                    currentUserName={currentUser.name}
                    receiverName={selectedUser.name}
                    currentUserRole={currentUser.role}
                    receiverRole={selectedUser.role}
                />
            ) : (
                <div className="flex items-center justify-center flex-1 bg-gray-50">
                    <div className="text-center">
                        <div className="mb-4 text-5xl">💼</div>
                        <h2 className="text-2xl font-semibold text-gray-700">Select a conversation</h2>
                        <p className="mt-2 text-gray-500">
                            {currentUser.role === 'lawyer' 
                                ? 'Connect with your clients' 
                                : 'Connect with legal professionals'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatContainer;
