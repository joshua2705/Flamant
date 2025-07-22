
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp,
    doc,
    setDoc,
    getDoc,
    where,
    getDocs
  } from 'firebase/firestore';

import { chatDb } from '../config/chatFirebase';

  
  export const chatService = {
   
    async createChatRoom(user1Id: string, user2Id: string, productId?: string) {
      try {
        console.log('Creating chat room between:', user1Id, user2Id);
        
        // Create chat ID by sorting user IDs (ensures consistency)
        const chatId = [user1Id, user2Id].sort().join('_');
        const chatRef = doc(chatDb, 'chats', chatId);
        
        // Check if chat already exists
        const chatDoc = await getDoc(chatRef);
        
        if (!chatDoc.exists()) {
          console.log('Chat does not exist, creating new chat');
          await setDoc(chatRef, {
            participants: [user1Id, user2Id],
            createdAt: serverTimestamp(),
            lastMessage: null,
            lastMessageTime: null,
            productId: productId || null,
          });
        } else {
          console.log('Chat already exists');
        }
        
        return chatId;
      } catch (error) {
        console.error('Error creating chat room:', error);
        throw error;
      }
    },
  
    // Send a message
    async sendMessage(chatId: string, senderId: string, text: string) {
      try {
        console.log('Sending message:', { chatId, senderId, text });
        
        if (!text.trim()) {
          throw new Error('Message cannot be empty');
        }
  
        const messagesRef = collection(chatDb, 'chats', chatId, 'messages');
        await addDoc(messagesRef, {
          text: text.trim(),
          senderId,
          timestamp: serverTimestamp(),
          read: false
        });
  
        // Update chat with last message info
        const chatRef = doc(chatDb, 'chats', chatId);
        await setDoc(chatRef, {
          lastMessage: text.trim(),
          lastMessageTime: serverTimestamp()
        }, { merge: true });
  
        console.log('Message sent successfully');
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
  
    // Listen to messages in real-time
    subscribeToMessages(chatId: string, callback: (messages: any[]) => void) {
      console.log('Subscribing to messages for chat:', chatId);
      
      const messagesRef = collection(chatDb, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      
      return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        
        console.log('Received messages update:', messages.length, 'messages');
        callback(messages);
      }, (error) => {
        console.error('Error in messages subscription:', error);
      });
    },
  
    // Get user's chat list
    subscribeToUserChats(userId: string, callback: (chats: any[]) => void) {
      console.log('Subscribing to chats for user:', userId);
      
      const chatsRef = collection(chatDb, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', userId));
      
      return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastMessageTime: doc.data().lastMessageTime?.toDate()
        }));
        
        console.log('Received chats update:', chats.length, 'chats');
        callback(chats);
      }, (error) => {
        console.error('Error in chats subscription:', error);
      });
    }
  };