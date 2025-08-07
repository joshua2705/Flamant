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
  getDocs,
  updateDoc
} from 'firebase/firestore';

import { chatDb } from '../config/chatFirebase';
import { notificationService } from './notificationService';
import { chatUserService } from './chatUserService';

export const chatService = {
  async createChatRoom(user1Id: string, user2Id: string, productId?: string) {
    try {
      console.log('Creating chat room between:', user1Id, user2Id);
      
      const chatId = [user1Id, user2Id].sort().join('_');
      const chatRef = doc(chatDb, 'chats', chatId);
      
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

  async createChatRoomWithProduct(
    buyerId: string, 
    sellerId: string, 
    productId: string,
    productInfo: {
      title: string;
      price: number;
      image?: string;
    }
  ) {
    try {
      console.log('🚀 Creating product chat between buyer:', buyerId, 'and seller:', sellerId);
      
      const chatId = [buyerId, sellerId].sort().join('_');
      const chatRef = doc(chatDb, 'chats', chatId);
      
      const chatDoc = await getDoc(chatRef);
      
      const chatData = {
        participants: [buyerId, sellerId],
        buyerId: buyerId,                     
        sellerId: sellerId,                  
        productId: productId,
        productInfo: productInfo,          
        chatType: 'product_inquiry',         
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null,
      };
      
      if (!chatDoc.exists()) {
        console.log('✨ Creating new product chat with data:', chatData);
        await setDoc(chatRef, chatData);
      } else {
        console.log('📝 Product chat already exists, updating data');
        await setDoc(chatRef, chatData, { merge: true });
      }
      
      // Send initial product message with notification
      const initialMessage = `Hi! I'm interested in your "${productInfo.title}" for €${productInfo.price.toFixed(2)}. Is it still available?`;
      await this.sendMessage(chatId, buyerId, initialMessage, 'product_inquiry', productId);
      
      console.log('✅ Product chat created successfully:', chatId);
      return chatId;
    } catch (error) {
      console.error('Error creating product chat room:', error);
      throw error;
    }
  },

  async sendMessage(
    chatId: string, 
    senderId: string, 
    text: string, 
    messageType: 'chat_message' | 'product_inquiry' = 'chat_message',
    productId?: string
  ) {
    try {
      console.log('📤 Sending message:', { chatId, senderId, text });
      
      if (!text.trim()) {
        throw new Error('Message cannot be empty');
      }

      // Add message to Firestore
      const messagesRef = collection(chatDb, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: text.trim(),
        senderId,
        timestamp: serverTimestamp(),
        read: false,
        type: messageType
      });

      // Update chat with last message info
      const chatRef = doc(chatDb, 'chats', chatId);
      await setDoc(chatRef, {
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp()
      }, { merge: true });

      // Get chat participants and sender info for notifications
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const participants = chatData.participants || [];
        
        // Find recipient (the other participant)
        const recipientId = participants.find((id: string) => id !== senderId);
        
        if (recipientId) {
          // Get sender info
          const senderInfo = await chatUserService.getUserById(senderId);
          const senderName = senderInfo?.name || 'Someone';
          
          // Queue notification for recipient
          await notificationService.queueNotification(
            recipientId,
            senderId,
            chatId,
            text.trim(),
            senderName,
            messageType,
            productId || chatData.productId
          );
          
          console.log('🔔 Notification queued for recipient:', recipientId);
        }
      }

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToMessages(chatId: string, callback: (messages: any[]) => void) {
    console.log('👂 Subscribing to messages for chat:', chatId);
    
    const messagesRef = collection(chatDb, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      
      console.log('📨 Received messages update:', messages.length, 'messages');
      callback(messages);
    }, (error) => {
      console.error('Error in messages subscription:', error);
    });
  },

  subscribeToUserChats(userId: string, callback: (chats: any[]) => void) {
    console.log('💬 Subscribing to all chats for user:', userId);
    
    const chatsRef = collection(chatDb, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));
    
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          userRole: data.buyerId === userId ? 'buyer' : 'seller',
          isProductChat: !!data.productId,
        };
      });
      
      console.log('📋 Received all chats update:', chats.length, 'chats');
      callback(chats);
    }, (error) => {
      console.error('💥 Error in chats subscription:', error);
    });
  },

  subscribeToUserPurchases(userId: string, callback: (chats: any[]) => void) {
    console.log('🛒 Subscribing to purchase chats for user:', userId);
    
    const chatsRef = collection(chatDb, 'chats');
    const q = query(chatsRef, where('buyerId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        userRole: 'buyer',
        isProductChat: !!doc.data().productId,
      }));
      
      console.log('🛍️ Received purchase chats:', chats.length);
      callback(chats);
    }, (error) => {
      console.error('Error in purchase chats subscription:', error);
    });
  },

  subscribeToUserSales(userId: string, callback: (chats: any[]) => void) {
    console.log('💰 Subscribing to sales chats for user:', userId);
    
    const chatsRef = collection(chatDb, 'chats');
    const q = query(chatsRef, where('sellerId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        userRole: 'seller',
        isProductChat: !!doc.data().productId,
      }));
      
      console.log('💸 Received sales chats:', chats.length);
      callback(chats);
    }, (error) => {
      console.error('Error in sales chats subscription:', error);
    });
  },

  // FIXED - Mark messages as read (removed batch operations)
  async markMessagesAsRead(chatId: string, userId: string) {
    try {
      const messagesRef = collection(chatDb, 'chats', chatId, 'messages');
      const q = query(
        messagesRef, 
        where('senderId', '!=', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      
      // Update messages one by one (no batch)
      for (const messageDoc of snapshot.docs) {
        await updateDoc(messageDoc.ref, { read: true });
      }
      
      // Clear notifications for this chat
      await notificationService.clearChatNotifications(chatId);
      
      console.log('✅ Messages marked as read for chat:', chatId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
};