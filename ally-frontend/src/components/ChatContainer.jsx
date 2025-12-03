// src/components/ChatContainer.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import services
import { fetchActiveConversations, subscribeToMessages, sendMessage as chatSendMessage, editMessage, deleteMessage } from '../services/chatService';
import { fetchUserDetails, getAuthData, isAuthenticated } from '../utils/auth';

// Import new UI components
import Avatar from './chat-ui/Avatar';
import UserListItem from './chat-ui/UserListItem';
import MessageBubble from './chat-ui/MessageBubble';
import ChatInfoSidebar from './chat-ui/ChatInfoSidebar';
import ChatSidebar from './ChatSidebar';
import { useSidebar } from '../contexts/SidebarContext';

const ChatContainer = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [conversations, setConversations] = useState([]); // CHANGED: Renamed state for clarity
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingSend, setIsLoadingSend] = useState(false);
    const [chatroomId, setChatroomId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showChatInfo, setShowChatInfo] = useState(false);
    const messagesEndRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { chatroomId: chatroomIdFromParams } = useParams(); // For /messages/:chatroomId route
    const { isExpanded } = useSidebar();

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


    // Scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Subscribe to messages when selectedUser changes
    useEffect(() => {
        if (!currentUser || !selectedUser) return;

        const unsubscribe = subscribeToMessages(currentUser.id, selectedUser.id, ({ messages: newMessages, chatroomId: newChatroomId }) => {
            setMessages(newMessages || []);
            setChatroomId(newChatroomId);
            scrollToBottom();
        });

        return () => {
            unsubscribe();
        };
    }, [currentUser, selectedUser]);

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
                } else if (chatroomIdFromParams) {
                    userToSelect = activeConvos.find(c => c.chatroomId === chatroomIdFromParams);
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
    }, [chatroomIdFromParams, loadCurrentUser, location.state, navigate, location.pathname]);

    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        // Update the URL to reflect the selected chatroom, making the URL shareable
        navigate(`/messages/${user.chatroomId}`);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoadingSend || !currentUser || !selectedUser) return;

        if (!currentUser.accountType) {
            console.error('currentUserRole is undefined:', { accountType: currentUser.accountType });
            toast.error('Cannot send message: User role is missing. Please refresh the page.');
            return;
        }

        setIsLoadingSend(true);
        try {
            const { chatroomId: newChatroomId } = await chatSendMessage(currentUser.id, selectedUser.id, newMessage.trim(), currentUser.accountType);
            setNewMessage('');
            setChatroomId(newChatroomId);
            navigate(`/messages/${newChatroomId}`, { replace: true });
            toast.success('Message sent!');
        } catch (error) {
            console.error('Error sending message:', error.message);
            toast.error(`Failed to send message: ${error.message}`);
        } finally {
            setIsLoadingSend(false);
        }
    };
    
    const handleEdit = async (messageId, content) => {
        if (!chatroomId) {
            toast.warn('No active chatroom found.');
            return;
        }

        try {
            await editMessage(chatroomId, messageId, content);
            toast.success('Message updated!');
        } catch (error) {
            console.error('Error editing message:', error.message);
            toast.error('Failed to update message');
        }
    };

    const handleDelete = async (messageId) => {
        if (!chatroomId) {
            toast.warn('No active chatroom found.');
            return;
        }

        try {
            await deleteMessage(chatroomId, messageId);
            toast.success('Message deleted');
        } catch (error) {
            console.error('Error deleting message:', error.message);
            toast.error('Failed to delete message');
        }
    };

    return (
        <div className={`min-h-screen bg-gray-50 ${isExpanded ? 'md:ml-[240px]' : 'md:ml-[60px]'}`}>
            {/* Global app sidebar */}
            <ChatSidebar />
            {/* Container wrapper */}
            <div className="container max-w-7xl px-4 mx-auto py-8">
                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                    <div className="flex h-[calc(100vh-8rem)] bg-white">
                        {/* Sidebar - Conversations List */}
                        <div className="flex flex-col border-r w-96">
                {/* User Profile Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Avatar name={currentUser?.name} size="lg" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate text-primary">{currentUser?.name || 'Loading...'}</h3>
                            <p className="text-sm text-gray-600">Online</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="p-3 border-b">
                    <div className="relative">
                        <svg className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Conversations Header */}
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold text-primary">Last Messages</h3>
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map(user => (
                        <UserListItem
                            key={user.id}
                            user={user}
                            isSelected={selectedUser?.id === user.id}
                            onClick={() => handleSelectUser(user)}
                        />
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0">
                {loading ? (
                    <div className="flex items-center justify-center flex-1"></div>
                ) : selectedUser && currentUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between flex-shrink-0 p-4 bg-white border-b">
                            <div className="flex items-center min-w-0 gap-3">
                                <Avatar name={selectedUser.name} size="md" online={selectedUser.id === '2'} />
                                <div className="min-w-0">
                                    <h2 className="font-semibold truncate text-primary">{selectedUser.name}</h2>
                                    <span className="text-sm text-green-500">Online</span>
                                </div>
                            </div>
                            <div className="flex items-center flex-shrink-0 gap-2">
                                <button className="p-2 transition-colors rounded-lg hover:bg-gray-100">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </button>
                                <button className="p-2 transition-colors rounded-lg hover:bg-gray-100">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowChatInfo(!showChatInfo)}
                                    className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                                {/* Use full width so message bubbles align to the viewport edges (near scrollbar) */}
                                <div className="w-full">
                                {/* Date Divider - Optional, removed for simplicity */}
                                {messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message) => {
                                            const own = String(message.senderId) === String(currentUser.id);
                                            return (
                                                <MessageBubble
                                                    key={message.id}
                                                    message={message}
                                                    isOwn={own}
                                                    senderName={own ? currentUser?.name : selectedUser?.name}
                                                    onEdit={() => handleEdit(message.id, message.content)}
                                                    onDelete={() => handleDelete(message.id)}
                                                />
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="flex-shrink-0 p-4 bg-white border-t">
                            <form onSubmit={handleSend} className="flex items-center max-w-4xl gap-2 mx-auto">
                                <button
                                    type="button"
                                    className="flex-shrink-0 p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Write your message..."
                                    className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isLoadingSend}
                                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                                        newMessage.trim() && !isLoadingSend
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center flex-1 bg-gray-50">
                        <div className="text-center">
                            <div className="mb-4 text-5xl">💼</div>
                            <h2 className="text-2xl font-semibold text-primary">Select a conversation</h2>
                            <p className="mt-2 text-gray-500">
                                View your messages with clients or legal professionals.
                            </p>
                        </div>
                    </div>
                )}
                    </div>
                        {/* Chat Info Sidebar */}
                        {showChatInfo && selectedUser && (
                            <ChatInfoSidebar
                                user={selectedUser}
                                onClose={() => setShowChatInfo(false)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatContainer;
