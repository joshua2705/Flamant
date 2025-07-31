import { FormError } from "@/types";
import { isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';

export const validateForm = (email:string, password:string) => {
        const newErrors: FormError = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        return newErrors;
    };

export const validateSignUpForm = (name:string, email:string, password:string, confirmPassword:string) => {
        const newErrors: FormError = {};
    
        if (!name.trim()) {
          newErrors.name = 'Name is required';
        } else if (name.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        }
    
        if (!email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          newErrors.email = 'Please enter a valid email';
        }
    
        if (!password) {
          newErrors.password = 'Password is required';
        } else if (password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        }
    
        if (!confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
    
        return newErrors;
      };

export const handleAuthError = (error:any) => {
    let errorMessage = 'Authentication failed. Please try again.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Mismatch in credentials.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }

      return errorMessage;
}

export const handleSsoError = (error:any) => {

    let errorMessage = "Sign-in error during Google SSO";

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            errorMessage = "Operation (eg. sign in) already in progress";
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage = "Android only, play services not available or outdated";
            break;
        }
      }
    return errorMessage;
}