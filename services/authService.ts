import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { userService } from './userService';

export const authService = {
  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await userService.createOrUpdateUser(user.uid, {
        email: user.email || '',
        name: user.displayName || '',
        avatar: user.photoURL || '',
      });

      console.log('✅ Google sign-in successful');
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      throw error;
    }
  },
};
