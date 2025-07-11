import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { User } from '@/types';

const USERS_COLLECTION = 'users';

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Convert User data from Firestore
const convertUserData = (doc: any): User => {
  const data = doc.data();
  return {
    id: doc.id,
    email: data.email,
    name: data.name,
    avatar: data.avatar,
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    isVerified: data.isVerified || false,
    location: data.location,
    createdAt: convertTimestamp(data.createdAt),
  };
};

export const userService = {
  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertUserData(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      // Return null instead of throwing to handle gracefully
      return null;
    }
  },

  // Create or update user profile
  async createOrUpdateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const existingUser = await getDoc(docRef);

      if (existingUser.exists()) {
        // Update existing user
        await updateDoc(docRef, {
          ...userData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new user
        await setDoc(docRef, {
          ...userData,
          rating: 0,
          reviewCount: 0,
          isVerified: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  },

  // Update user rating
  async updateUserRating(userId: string, newRating: number, reviewCount: number): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(docRef, {
        rating: newRating,
        reviewCount,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user rating:', error);
      throw error;
    }
  },
};