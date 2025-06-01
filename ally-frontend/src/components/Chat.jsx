import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
    sendMessage, 
    subscribeToMessages, 
    editMessage, 
    deleteMessage,
    handleMessageStatus 
} from '../services/chatService';

const Chat = ({ currentUserId, receiverId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatroomId, setChatroomId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Subscribe to messages
        const unsubscribe = subscribeToMessages(currentUserId, receiverId, ({ messages: newMessages, chatroomId: newChatroomId }) => {
            setMessages(newMessages);
            setChatroomId(newChatroomId);
            scrollToBottom();
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, [currentUserId, receiverId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        setIsLoading(true);
        try {
            await sendMessage(currentUserId, receiverId, newMessage.trim());
            setNewMessage('');
            toast.success('Message sent!');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (messageId, content) => {
        if (!chatroomId) return;
        try {
            await editMessage(chatroomId, messageId, content);
            setEditingMessage(null);
            toast.success('Message updated!');
        } catch (error) {
            console.error('Error editing message:', error);
            toast.error('Failed to edit message');
        }
    };

    const handleDelete = async (messageId) => {
        if (!chatroomId) return;
        try {
            await deleteMessage(chatroomId, messageId);
            toast.success('Message deleted!');
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message');
        }
    };

    return (
        <div className="flex flex-col flex-1 h-screen bg-white border-l">
            {/* Chat Header */}
            <div className="flex items-center p-4 bg-white border-b shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                    <span className="text-lg font-semibold text-gray-600">
                        {receiverId.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="ml-3">
                    <h2 className="text-lg font-semibold">{receiverId}</h2>
                    <span className="text-sm text-green-500">Active Now</span>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ height: 'calc(100vh - 140px)' }}>
                <div className="max-w-3xl mx-auto">
                    {messages.map((message) => (
                        <div 
                            key={message.id}
                            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'} mb-4 w-full`}
                        >
                            {message.senderId !== currentUserId && (
                                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2 bg-gray-300 rounded-full">
                                    {receiverId.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className={`group relative max-w-[70%] ${message.senderId === currentUserId ? 'ml-auto' : 'mr-auto'}`}>
                                <div                                    className={`inline-block p-3 ${
                                        message.senderId === currentUserId 
                                            ? 'bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' 
                                            : 'bg-gray-100 text-gray-800 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl shadow-sm'
                                    }`}
                                >
                                    {editingMessage?.id === message.id ? (
                                        <input
                                            type="text"
                                            value={editingMessage.content}
                                            onChange={(e) => setEditingMessage({
                                                ...editingMessage,
                                                content: e.target.value
                                            })}
                                            onBlur={() => handleEdit(message.id, editingMessage.content)}
                                            className="w-full p-1 text-black rounded"
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            <p className="whitespace-pre-wrap">{message.content}</p>                                            <div className="mt-1 text-xs opacity-75">                                                {message.timestamp?.toDate 
                                                    ? message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : message.timestamp instanceof Date 
                                                        ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                }
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
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="flex items-center max-w-3xl gap-3 mx-auto">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3 border rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className={`p-3 rounded-full ${
                            isLoading || !newMessage.trim() 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        disabled={isLoading || !newMessage.trim()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
