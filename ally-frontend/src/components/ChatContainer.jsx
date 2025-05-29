import React, { useState, useEffect } from 'react';
import UserList from './UserList';
import Chat from './Chat';
import { toast } from 'react-toastify';

const ChatContainer = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeChat = async () => {
            try {
                await loadUsers();
                toast.success('Welcome to chat!');
            } catch (error) {
                console.error('Error setting up chat:', error);
                toast.error('Error loading chat data');
            } finally {
                setLoading(false);
            }
        };

        initializeChat();
    }, []);

    const loadUsers = async () => {
        try {
            // Using test users for development
            const testUsers = [
                { id: 'user1', name: 'Test User 1', lastMessage: 'Hello!' },
                { id: 'user2', name: 'Test User 2', lastMessage: 'How are you?' },
                { id: 'user3', name: 'Test User 3', lastMessage: 'Great day!' }
            ];
            setUsers(testUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
            throw error;
        }
    };

    return (
        <div className="flex w-full h-screen bg-white">
            <UserList 
                users={users}
                selectedUserId={selectedUser?.id}
                onSelectUser={(userId) => {
                    const user = users.find(u => u.id === userId);
                    setSelectedUser(user);
                }}
            />
            {loading ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                        <div className="mb-4">Loading...</div>
                    </div>
                </div>
            ) : selectedUser ? (
                <Chat 
                    currentUserId="testUser123"
                    receiverId={selectedUser.id}
                />
            ) : (
                <div className="flex items-center justify-center flex-1 bg-gray-50">
                    <div className="text-center">
                        <div className="mb-4 text-5xl">💬</div>
                        <h2 className="text-2xl font-semibold text-gray-700">Select a conversation</h2>
                        <p className="mt-2 text-gray-500">Choose from your existing conversations or start a new one</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatContainer;
