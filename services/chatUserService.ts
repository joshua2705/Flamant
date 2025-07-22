
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    getDocs, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { chatDb } from '../config/chatFirebase'; // Uses your chat Firebase
  
  export const chatUserService = {
    // Sync user from main Firebase Auth to chat Firebase
  
    async syncUserToChatFirebase(firebaseUser: any, userProfile: any) {
      try {
        console.log('Syncing user to chat Firebase:', firebaseUser.uid);
        
        // Check if user exists in chat Firebase
        const userDocRef = doc(chatDb, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          console.log('User exists in chat Firebase, updating');
          // Update existing user
          const updatedUser = {
            id: firebaseUser.uid,
            name: userProfile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            lastSeen: serverTimestamp()
          };
          
          await setDoc(userDocRef, updatedUser, { merge: true });
          return {
            ...updatedUser,
            ...userDoc.data()
          };
        } else {
          console.log('User does not exist in chat Firebase, creating new user');
          // Create new user in chat Firebase
          const newUser = {
            id: firebaseUser.uid,
            name: userProfile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp()
          };
          
          await setDoc(userDocRef, newUser);
          console.log('New user created successfully in chat Firebase');
          
          return {
            id: firebaseUser.uid,
            name: newUser.name,
            email: newUser.email,
            createdAt: new Date(),
            lastSeen: new Date()
          };
        }
      } catch (error: any) {
        console.error('Error syncing user to chat Firebase:', error);
        throw new Error('Failed to sync user: ' + error.message);
      }
    },
  
    // Get user by ID
    async getUserById(userId: string) {
      try {
        const userDoc = await getDoc(doc(chatDb, 'users', userId));
        if (userDoc.exists()) {
          return {
            id: userId,
            ...userDoc.data()
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
      }
    },
  
    // Get all users 
    async getAllUsers() {
      try {
        const usersSnapshot = await getDocs(collection(chatDb, 'users'));
        const users: any[] = [];
        
        usersSnapshot.forEach((doc) => {
          users.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        return users;
      } catch (error) {
        console.error('Error getting all users:', error);
        return [];
      }
    },
  
    // Search users by name or ID 
    async searchUsers(searchTerm: string, currentUserId: string) {
      try {
        const users = await this.getAllUsers();
        
        return users.filter(user => 
          user.id !== currentUserId && 
          (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      } catch (error) {
        console.error('Error searching users:', error);
        return [];
      }
    }
  };