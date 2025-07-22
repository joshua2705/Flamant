import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const chatFirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_CHAT_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_CHAT_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_CHAT_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_CHAT_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_CHAT_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_CHAT_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_CHAT_FIREBASE_MEASUREMENT_ID,
};

let chatApp;
try {
  // Check if chat app already exists
  const existingApps = getApps();
  const existingChatApp = existingApps.find(app => app.name === 'chatApp');
  
  if (existingChatApp) {
    console.log('Using existing chat Firebase app');
    chatApp = existingChatApp;
  } else {
    console.log('Creating new chat Firebase app');
    chatApp = initializeApp(chatFirebaseConfig, 'chatApp');
  }
} catch (error) {
  console.log('Fallback: Getting existing chat app');
  try {
    chatApp = getApp('chatApp');
  } catch (fallbackError) {
    console.log('Creating chat app as fallback');
    chatApp = initializeApp(chatFirebaseConfig, 'chatApp');
  }
}

export const chatDb = getFirestore(chatApp);
export default chatApp;