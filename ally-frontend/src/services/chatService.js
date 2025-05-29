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
    runTransaction,
    serverTimestamp,
    setDoc,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const sendMessage = async (senderId, receiverId, content) => {
    try {
        // First check if a chatroom exists between these users
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
            // Create new chatroom if it doesn't exist
            const newChatroomRef = await addDoc(chatroomRef, {
                participants: [senderId, receiverId],
                createdAt: serverTimestamp(),
                lastMessage: content,
                lastMessageTimestamp: serverTimestamp()
            });
            chatroomId = newChatroomRef.id;
        }

        // Add message to the messages subcollection of the chatroom
        const messagesRef = collection(db, `chatroom/${chatroomId}/messages`);
        await addDoc(messagesRef, {
            senderId,
            receiverId,
            content,
            timestamp: serverTimestamp(),
            isEdited: false
        });

        // Update chatroom's last message
        const chatroomDocRef = doc(db, 'chatroom', chatroomId);
        await updateDoc(chatroomDocRef, {
            lastMessage: content,
            lastMessageTimestamp: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export const subscribeToMessages = (senderId, receiverId, callback) => {
    console.log('Subscribing to messages:', { senderId, receiverId });
    
    // First find the chatroom
    const chatroomRef = collection(db, 'chatroom');
    const chatroomQuery = query(
        chatroomRef,
        where('participants', 'array-contains', senderId)
    );

    let messagesUnsubscribe = null;

    // Create a subscription to watch for the correct chatroom and its messages
    const chatroomUnsubscribe = onSnapshot(chatroomQuery, (chatroomSnapshot) => {
        const chatroom = chatroomSnapshot.docs.find(doc => 
            doc.data().participants.includes(receiverId)
        );

        if (!chatroom) {
            callback({ messages: [], chatroomId: null });
            return;
        }

        // Cleanup previous messages subscription if it exists
        if (messagesUnsubscribe) {
            messagesUnsubscribe();
        }

        // Subscribe to the messages subcollection of this chatroom
        const messagesRef = collection(db, `chatroom/${chatroom.id}/messages`);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        messagesUnsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback({ messages, chatroomId: chatroom.id });
        }, (error) => {            console.error('Error subscribing to messages:', error);
            callback({ messages: [], chatroomId: chatroom.id });
        });
    });

    // Return a cleanup function that handles both subscriptions
    return () => {
        chatroomUnsubscribe();
        if (messagesUnsubscribe) {
            messagesUnsubscribe();
        }
    };
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

export const fetchUsers = async (userType = null) => {
    try {
        const usersRef = collection(db, 'users');
        let q = usersRef;
        
        // If userType is specified (e.g., 'lawyer' or 'client'), filter by it
        if (userType) {
            q = query(usersRef, where('userType', '==', userType));
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            lastMessage: '' // You can implement last message fetching later
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};
