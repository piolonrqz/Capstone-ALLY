import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const sendMessage = async (senderId, receiverId, content, senderRole) => {
    try {
        // Check for existing chatroom between lawyer and client
        const chatroomRef = collection(db, 'chatroom');
        const chatroomQuery = query(
            chatroomRef,
            where('participants', 'array-contains', senderId)
        );
        const chatroomSnapshot = await getDocs(chatroomQuery);
        
        let chatroomId;
        let existingChatroom = chatroomSnapshot.docs.find(doc => 
            doc.data().participants.includes(receiverId)
        );

        if (existingChatroom) {
            chatroomId = existingChatroom.id;
        } else {
            // Create new chatroom for lawyer-client pair
            const newChatroomRef = await addDoc(chatroomRef, {
                participants: [senderId, receiverId],
                createdAt: serverTimestamp(),
                lastMessage: content,
                lastMessageTimestamp: serverTimestamp(),
                participantDetails: {
                    [senderId]: { 
                        lastRead: serverTimestamp(),
                        role: senderRole
                    },
                    [receiverId]: { 
                        lastRead: null,
                        role: senderRole === 'lawyer' ? 'client' : 'lawyer'
                    }
                }
            });
            chatroomId = newChatroomRef.id;
        }

        // Add message to messages subcollection
        const messagesRef = collection(db, `chatroom/${chatroomId}/messages`);
        const messageDoc = await addDoc(messagesRef, {
            senderId,
            receiverId,
            content,
            timestamp: serverTimestamp(),
            isEdited: false,
            senderRole: senderRole
        });

        // Update chatroom's last message info
        const chatroomDocRef = doc(db, 'chatroom', chatroomId);
        await updateDoc(chatroomDocRef, {
            lastMessage: content,
            lastMessageTimestamp: serverTimestamp(),
            [`participantDetails.${senderId}.lastRead`]: serverTimestamp()
        });

        return { success: true, chatroomId };
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export const subscribeToMessages = (senderId, receiverId, callback) => {
    // Find chatroom between lawyer and client
    const roomsRef = collection(db, 'chatroom');
    const roomQuery = query(
        roomsRef,
        where('participants', 'array-contains', senderId)
    );

    let messagesUnsubscribe = null;

    // Subscribe to chatroom changes
    const chatroomUnsubscribe = onSnapshot(roomQuery, (snapshot) => {
        const chatroom = snapshot.docs.find(doc => 
            doc.data().participants.includes(receiverId)
        );

        if (!chatroom) {
            callback({ messages: [], chatroomId: null });
            return;
        }

        if (messagesUnsubscribe) {
            messagesUnsubscribe();
        }

        // Subscribe to messages in this chatroom
        const messagesRef = collection(db, `chatroom/${chatroom.id}/messages`);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        messagesUnsubscribe = onSnapshot(q, (messagesSnapshot) => {
            const messages = messagesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));
            callback({ messages, chatroomId: chatroom.id });
        });
    });

    return () => {
        if (messagesUnsubscribe) messagesUnsubscribe();
        chatroomUnsubscribe();
    };
};

export const fetchUsers = async (currentUser) => {
    try {
        const roomsRef = collection(db, 'chatroom');
        const roomQuery = query(
            roomsRef,
            where('participants', 'array-contains', currentUser.id)
        );
        const roomSnapshot = await getDocs(roomQuery);

        const conversations = roomSnapshot.docs.map(doc => {
            const data = doc.data();
            const otherParticipantId = data.participants.find(id => id !== currentUser.id);
            const otherParticipantDetails = data.participantDetails[otherParticipantId];

            return {
                id: otherParticipantId,
                chatroomId: doc.id,
                lastMessage: data.lastMessage,
                lastMessageTimestamp: data.lastMessageTimestamp,
                role: otherParticipantDetails?.role,
                unread: data.participantDetails[currentUser.id]?.lastRead < data.lastMessageTimestamp
            };
        });

        return conversations;

    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};

export const editMessage = async (chatroomId, messageId, newContent) => {
    try {
        const messageRef = doc(db, `chatroom/${chatroomId}/messages`, messageId);
        await updateDoc(messageRef, {
            content: newContent,
            isEdited: true,
            editedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error editing message:', error);
        throw error;
    }
};

export const deleteMessage = async (chatroomId, messageId) => {
    try {
        const messageRef = doc(db, `chatroom/${chatroomId}/messages`, messageId);
        await deleteDoc(messageRef);
        return true;
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
};

// Real-time message status handling similar to your name selection code
export const handleMessageStatus = async (chatroomId, messageId, status, callback) => {
    try {
        await runTransaction(db, async (transaction) => {
            const messageRef = doc(db, `chatroom/${chatroomId}/messages`, messageId);
            const messageDoc = await transaction.get(messageRef);

            if (!messageDoc.exists()) {
                throw new Error("Message no longer exists");
            }

            const messageData = messageDoc.data();
            
            // Update message status (e.g., read, delivered)
            transaction.update(messageRef, {
                status: status,
                statusUpdatedAt: serverTimestamp(),
            });
        });

        if (callback) callback(true);
        return true;
    } catch (error) {
        console.error('Error updating message status:', error);
        if (callback) callback(false, error);
        throw error;
    }
};

export const handleUserStatusInChat = async (chatId, userId, status = 'active') => {
    const userStatusRef = doc(db, 'chats', chatId, 'participants', userId);
    const timestamp = new Date().toISOString();
    
    try {
        await runTransaction(db, async (transaction) => {
            const statusDoc = await transaction.get(userStatusRef);

            if (!statusDoc.exists()) {
                throw new Error("User is not a participant in this chat");
            }

            const statusData = statusDoc.data();

            // Check if user is already in requested status
            if (statusData.status === status) {
                throw new Error(`User is already ${status} in this chat.`);
            }

            transaction.update(userStatusRef, {
                status: status,
                lastUpdated: timestamp,
            });
        });

        return {
            success: true,
            userId,
            status,
            timestamp
        };

    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

// Function to initialize user in a chat
export const initializeUserInChat = async (chatId, userId, initialStatus = 'active') => {
    const userStatusRef = doc(db, 'chats', chatId, 'participants', userId);
    const timestamp = new Date().toISOString();

    try {
        await setDoc(userStatusRef, {
            userId,
            status: initialStatus,
            joinedAt: timestamp,
            lastUpdated: timestamp
        });
        return true;
    } catch (error) {
        console.error('Error initializing user in chat:', error);
        throw error;
    }
};

export const markChatAsRead = async (chatroomId, userId) => {
    try {
        const chatroomRef = doc(db, 'chatroom', chatroomId);
        await updateDoc(chatroomRef, {
            [`participantDetails.${userId}.lastRead`]: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error marking chat as read:', error);
        throw error;
    }
};
