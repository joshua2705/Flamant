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
    try {//
      console.log('🚀 Creating product chat between buyer:', buyerId, 'and seller:', sellerId);
      
      // Create chat ID by sorting user IDs 
      const chatId = [buyerId, sellerId].sort().join('_');
      const chatRef = doc(chatDb, 'chats', chatId);
      
      // Check if chat already exists
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
        console.log(' Creating new product chat with data:', chatData);
        await setDoc(chatRef, chatData);
      } else {
        console.log(' Product chat already exists, updating data');
        // Update existing chat to ensure buyer/seller fields are set
        await setDoc(chatRef, chatData, { merge: true });
      }
      
      // Send initial product message
      const initialMessage = `Hi! I'm interested in your "${productInfo.title}" for €${productInfo.price.toFixed(2)}. Is it still available?`;
      await this.sendMessage(chatId, buyerId, initialMessage);
      
      console.log('Product chat created successfully:', chatId);
      return chatId;
    } catch (error) {
      console.error('Error creating product chat room:', error);
      throw error;
    }
  },

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

  // UPDATED FUNCTION - General chat subscription with buyer/seller info
  subscribeToUserChats(userId: string, callback: (chats: any[]) => void) {
    console.log(' Subscribing to all chats for user:', userId);
    
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
          // Add buyer/seller role for current user
          userRole: data.buyerId === userId ? 'buyer' : 'seller',
          isProductChat: !!data.productId,
        };
      });
      
      console.log(' Received all chats update:', chats.length, 'chats');
      callback(chats);
    }, (error) => {
      console.error(' Error in chats subscription:', error);
    });
  },

  // Purchase chats (where user is buyer)
  subscribeToUserPurchases(userId: string, callback: (chats: any[]) => void) {
    console.log('Subscribing to purchase chats for user:', userId);
    console.log('Looking for chats where buyerId =', userId);
    
    const chatsRef = collection(chatDb, 'chats');
    const q = query(chatsRef, where('buyerId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      console.log(' DEBUG: Purchase query found', snapshot.docs.length, 'chats');
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('🔍 DEBUG: Purchase chat:', {
          id: doc.id,
          buyerId: data.buyerId,
          sellerId: data.sellerId,
          productTitle: data.productInfo?.title
        });
      });

      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        userRole: 'buyer',
        isProductChat: !!doc.data().productId,
      }));
      
      console.log('Received purchase chats:', chats.length);
      callback(chats);
    }, (error) => {
      console.error('Error in purchase chats subscription:', error);
    });
  },

  // FIXED FUNCTION - Sales chats (where user is seller)
  subscribeToUserSales(userId: string, callback: (chats: any[]) => void) {
    console.log('Subscribing to sales chats for user:', userId);
    console.log('Looking for chats where sellerId =', userId);
    
    const chatsRef = collection(chatDb, 'chats');
    const q = query(chatsRef, where('sellerId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      console.log(' DEBUG: Sales query found', snapshot.docs.length, 'chats');
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('DEBUG: Sales chat:', {
          id: doc.id,
          buyerId: data.buyerId,
          sellerId: data.sellerId,
          productTitle: data.productInfo?.title
        });
      });

      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        userRole: 'seller',
        isProductChat: !!doc.data().productId,
      }));
      
      console.log(' Received sales chats:', chats.length);
      callback(chats);
    }, (error) => {
      console.error('Error in sales chats subscription:', error);
    });
  }
};
