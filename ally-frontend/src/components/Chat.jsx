import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    sendMessage,
    subscribeToMessages,
    editMessage,
    deleteMessage,
    markChatAsRead
} from '../services/chatService';
import { fetchUserDetails } from '../utils/auth';

const Chat = ({ currentUserId, receiverId, currentUserRole, currentUserName, receiverName }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatroomId, setChatroomId] = useState(null);
    const [receiver, setReceiver] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Debug log for currentUserRole
    useEffect(() => {
        console.log('Chat component received currentUserRole:', currentUserRole);
    }, [currentUserRole]);

    // Scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!currentUserId || !receiverId) return;

        const unsubscribe = subscribeToMessages(currentUserId, receiverId, ({ messages, chatroomId }) => {
            setMessages(messages || []);
            setChatroomId(chatroomId);
            scrollToBottom();
        });

        return () => {
            unsubscribe(); 
        };
    }, [currentUserId, receiverId]);

    // Mark chat as read when opened
    useEffect(() => {
        if (chatroomId && currentUserId) {
            markChatAsRead(chatroomId, currentUserId).catch(console.error);
        }
    }, [chatroomId, currentUserId]);

    // Load receiver details
    useEffect(() => {
        const loadReceiver = async () => {
            try {
                // Skip if receiverId is invalid
                if (!receiverId || receiverId === 'undefined') {
                    console.warn('Skipping receiver load: invalid receiverId', receiverId);
                    return;
                }
                
                const receiverData = await fetchUserDetails(receiverId);
                setReceiver(receiverData);
            } catch (error) {
                console.error('Failed to load receiver:', error);
                toast.warn('Could not load contact details');
            }
        };

        loadReceiver();
    }, [receiverId]);


    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;
        
        // Validate all required props
        if (!currentUserId || !receiverId) {
            console.error('Invalid user IDs for sending message:', { currentUserId, receiverId });
            toast.error('Cannot send message: User information is missing. Please refresh the page.');
            return;
        }
        
        if (!currentUserRole) {
            console.error('currentUserRole is undefined:', { currentUserRole });
            toast.error('Cannot send message: User role is missing. Please refresh the page.');
            return;
        }

        setIsLoading(true);
        try {
            // This will create room if it doesn't exist and send message
            const { chatroomId } = await sendMessage(currentUserId, receiverId, newMessage.trim(), currentUserRole);
            setNewMessage('');
            toast.success('Message sent!');

            // Immediately redirect to new chatroom URL
            navigate(`/messages/${chatroomId}`, { replace: true });

        } catch (error) {
            console.error('Error sending message:', error.message);
            toast.error(`Failed to send message: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    

    // Handle message edit
    const handleEdit = async (messageId, content) => {
        if (!chatroomId) {
            toast.warn('No active chatroom found.');
            return;
        }

        try {
            await editMessage(chatroomId, messageId, content);
            setEditingMessage(null);
            toast.success('Message updated!');
        } catch (error) {
            console.error('Error editing message:', error.message);
            toast.error('Failed to update message');
        }
    };

    // Handle message delete
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

    // Format initials for avatar
    const getInitials = (name, fallback = '?') => {
        if (typeof name === 'string' && name.length > 0) {
            return name.charAt(0).toUpperCase();
        }
        return fallback;
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white">
            {/* Chat Header */}
            <div className="flex items-center flex-shrink-0 p-4 bg-white border-b shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                    <span className="text-lg font-semibold text-gray-600">
                        {getInitials(receiverName, currentUserId)}
                    </span>
                </div>
                <div className="ml-3">
                    <h2 className="text-lg font-semibold">{receiverName || receiverId || 'Unknown Contact'}</h2>
                    <span className="text-sm text-green-500">Active Now</span>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    {messages.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'} mb-4`}
                            >
                                {message.senderId !== currentUserId && (
                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2 bg-gray-300 rounded-full">
                                        {getInitials(receiverName)}
                                    </div>
                                )}
                                <div className={`group relative max-w-[70%] ${message.senderId === currentUserId ? 'ml-auto' : 'mr-auto'}`}>
                                    <div
                                        className={`inline-block p-3 ${
                                            message.senderId === currentUserId
                                                ? 'bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                                                : 'bg-gray-100 text-gray-800 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl shadow-sm'
                                        }`}
                                    >
                                        {editingMessage?.id === message.id ? (
                                            <input
                                                type="text"
                                                value={editingMessage.content}
                                                onChange={(e) =>
                                                    setEditingMessage({
                                                        ...editingMessage,
                                                        content: e.target.value
                                                    })
                                                }
                                                onBlur={() => handleEdit(message.id, editingMessage.content)}
                                                className="w-full p-1 text-black rounded"
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                                <div className="mt-1 text-xs opacity-75">
                                                    {message.timestamp?.toLocaleTimeString
                                                        ? message.timestamp.toLocaleTimeString([], {
                                                              hour: '2-digit',
                                                              minute: '2-digit'
                                                          })
                                                        : new Date(message.timestamp).toLocaleTimeString([], {
                                                              hour: '2-digit',
                                                              minute: '2-digit'
                                                          })}
                                                    {message.isEdited && ' · Edited'}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {message.senderId === currentUserId && (
                                        <div className="absolute top-0 right-0 mt-[-20px] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex px-2 py-1 space-x-2 bg-white rounded-lg shadow">
                                                <button
                                                    onClick={() => setEditingMessage(message)}
                                                    className="text-gray-600 hover:text-gray-800"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(message.id)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input - Compact */}
            <form onSubmit={handleSend} className="flex-shrink-0 p-3 bg-white border-t">
                <div className="flex items-center max-w-2xl gap-2 mx-auto">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 text-sm border rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        disabled={isLoading}
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                    />
                    <button
                        type="submit"
                        className={`p-2 rounded-full ${
                            isLoading || !newMessage.trim()
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        disabled={isLoading || !newMessage.trim()}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                            />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
