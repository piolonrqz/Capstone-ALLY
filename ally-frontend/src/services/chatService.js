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
import { fetchUserDetails } from '../utils/auth';

export const fetchActiveConversations = async (userId) => {
    try {
        if (!userId) {
            throw new Error('Invalid userId provided.');
        }
        const roomsRef = collection(db, 'chatrooms');
        const roomQuery = query(
            roomsRef,
            where('participants', 'array-contains', String(userId))
        );

        const roomSnapshot = await getDocs(roomQuery);
        if (roomSnapshot.empty) {
            return []; // No conversations yet.
        }
        const conversationPromises = roomSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            // Ensure participants array exists and has valid IDs
            if (!data.participants || !Array.isArray(data.participants) || data.participants.length < 2) {
                console.warn(`Invalid participants array in chatroom ${docSnap.id}:`, data.participants);
                return null;
            }
            
            // Clean participant IDs
            const cleanedParticipants = data.participants
                .map(id => String(id).trim())
                .filter(id => id && id !== 'undefined' && id !== 'null');
            
            // Find the other participant (not the current user)
            const otherParticipantId = cleanedParticipants
                .find(id => id !== String(userId));
            
            if (!otherParticipantId) {
                console.warn(`Could not find other participant in chatroom ${docSnap.id} for user ${userId}`);
                return null;
            }
            
            try {
                const otherUser = await fetchUserDetails(otherParticipantId);
                if (!otherUser) {
                    console.warn(`User details not found for ID: ${otherParticipantId}`);
                    return null;
                }
                
                return {
                    id: otherUser.id,
                    name: otherUser.fullName || `${otherUser.firstName} ${otherUser.lastName}`,
                    role: otherUser.accountType,
                    chatroomId: docSnap.id,
                    lastMessage: data.lastMessage || '',
                    lastMessageTimestamp: data.lastMessageTimestamp,
                };
            } catch (error) {
                console.error(`Error fetching user details for ID ${otherParticipantId}:`, error);
                return null;
            }
        });

        const conversations = (await Promise.all(conversationPromises)).filter(Boolean);

        conversations.sort((a, b) => {
            const timeA = a.lastMessageTimestamp?.toMillis() || 0;
            const timeB = b.lastMessageTimestamp?.toMillis() || 0;
            return timeB - timeA;
        });

        return conversations;

    } catch (error) {
        console.error('Error fetching active conversations:', error);
        throw error; // Re-throw so the component can handle it.
    }
};




export const sendMessage = async (senderId, receiverId, content, senderRole) => {
    try {
      senderId = String(senderId);
      receiverId = String(receiverId);
  
      const chatroomRef = collection(db, 'chatrooms');
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
        console.log(`Using existing chatroom: ${chatroomId}`);
      } else {
        // Validate participants before creating room
        const validParticipants = [senderId, receiverId]
          .map(id => String(id).trim())
          .filter(id => id && id !== 'undefined' && id !== 'null');
        
        if (validParticipants.length !== 2) {
          throw new Error(`Invalid participants: ${senderId}, ${receiverId}`);
        }
        
        try {
          // Create new chatroom when first message is sent
          const newChatroomRef = await addDoc(chatroomRef, {
            participants: validParticipants,
            createdAt: serverTimestamp(),
            lastMessage: content,
            lastMessageTimestamp: serverTimestamp(),
            participantDetails: {
              [validParticipants[0]]: {
                lastRead: serverTimestamp(),
                role: senderRole
              },
              [validParticipants[1]]: {
                lastRead: null,
                role: senderRole === 'lawyer' ? 'client' : 'lawyer'
              }
            }
          });
    
          chatroomId = newChatroomRef.id;
          console.log(`Created new chatroom: ${chatroomId} for ${validParticipants.join(' and ')}`);
        } catch (error) {
          console.error('Error creating chatroom:', error);
          throw new Error('Failed to create chatroom. Please try again.');
        }
      }
  
      // Send message to the chatroom (new or existing)
      const messagesRef = collection(db, `chatrooms/${chatroomId}/messages`);
      const messageDoc = await addDoc(messagesRef, {
        senderId,
        receiverId,
        content,
        timestamp: serverTimestamp(),
        isEdited: false,
        senderRole
      });
      console.log(`Message sent to chatroom ${chatroomId} with ID: ${messageDoc.id}`);
  
      // Update chatroom metadata
      const chatroomDocRef = doc(db, 'chatrooms', chatroomId);
      await updateDoc(chatroomDocRef, {
        lastMessage: content,
        lastMessageTimestamp: serverTimestamp(),
        [`participantDetails.${senderId}.lastRead`]: serverTimestamp()
      });
      console.log(`Updated chatroom ${chatroomId} metadata`);
  
      return { success: true, chatroomId };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
};

export const subscribeToMessages = (senderId, receiverId, callback) => {
    senderId = String(senderId);
    receiverId = String(receiverId);
  
    const roomsRef = collection(db, 'chatrooms');
    const roomQuery = query(roomsRef, where('participants', 'array-contains', senderId));
  
    let messagesUnsubscribe = null;
  
    const chatroomUnsubscribe = onSnapshot(roomQuery, (snapshot) => {
      const chatroom = snapshot.docs.find(doc =>
        doc.data().participants.includes(receiverId)
      );
  
      if (!chatroom) {
        callback({ messages: [], chatroomId: null });
        return;
      }
  
      if (messagesUnsubscribe) messagesUnsubscribe();
  
      const messagesRef = collection(db, `chatrooms/${chatroom.id}/messages`);
      const q = query(messagesRef, orderBy('timestamp'));
  
      messagesUnsubscribe = onSnapshot(q, (messagesSnapshot) => {
        const messages = messagesSnapshot.docs.map(doc => {
          const data = doc.data();
          let timestamp;
          
          try {
            if (data.timestamp?.toDate) {
              timestamp = data.timestamp.toDate();
            } else if (data.timestamp?.seconds) {
              timestamp = new Date(data.timestamp.seconds * 1000);
            } else if (data.timestamp instanceof Date) {
              timestamp = data.timestamp;
            } else if (typeof data.timestamp === 'string') {
              timestamp = new Date(data.timestamp);
            } else {
              timestamp = new Date(); // fallback to current time
            }
          } catch (error) {
            console.warn('Error processing timestamp:', error);
            timestamp = new Date(); // fallback to current time
          }

          return {
            id: doc.id,
            ...data,
            timestamp
          };
        });
        callback({ messages, chatroomId: chatroom.id });
      }, (error) => {
        console.error('Error in message subscription:', error);
      });
    }, (error) => {
      console.error('Error in chatroom subscription:', error);
    });
  
    return () => {
      if (messagesUnsubscribe) messagesUnsubscribe();
      chatroomUnsubscribe();
    };
};
  
export const markChatAsRead = async (chatroomId, userId) => {
    try {
      const chatroomRef = doc(db, 'chatrooms', chatroomId);
      await updateDoc(chatroomRef, {
        [`participantDetails.${String(userId)}.lastRead`]: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
};
  
export const deleteMessage = async (chatroomId, messageId) => {
      try {
          const messageDocRef = doc(db, `chatrooms/${chatroomId}/messages`, messageId);
          await deleteDoc(messageDocRef);
          return { success: true };
      } catch (error) {
          console.error('Error deleting message:', error);
          throw error;
      }
};
  
export const editMessage = async (chatroomId, messageId, newContent) => {
      try {
          const messageRef = doc(db, `chatrooms/${chatroomId}/messages`, messageId);
          await updateDoc(messageRef, {
              content: newContent,
              isEdited: true,
              editedAt: serverTimestamp()
          });
      } catch (error) {
          console.error('Error editing message:', error);
          throw error;
      }
};