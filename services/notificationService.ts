import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { chatDb } from '../config/chatFirebase';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }) as Notifications.NotificationBehavior,
});

export interface NotificationData {
  chatId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  type: 'chat_message' | 'product_inquiry';
  productId?: string;
  [key: string]: any;
}

export const notificationService = {
  // Register for push notifications and get token
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      console.log('Push token:', tokenData.data);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('chat-messages', {
          name: 'Chat Messages',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#ee5899',
          sound: 'default',
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  // Save user's push token to Firebase
  async saveUserPushToken(userId: string, pushToken: string) {
    try {
      const userRef = doc(chatDb, 'users', userId);
      await setDoc(userRef, {
        pushToken,
        lastTokenUpdate: serverTimestamp(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        }
      }, { merge: true });

      console.log('Push token saved for user:', userId);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  },

  // Queue notification to be sent (store in Firebase for backend processing)
  async queueNotification(
    recipientId: string,
    senderId: string,
    chatId: string,
    messageText: string,
    senderName: string,
    type: 'chat_message' | 'product_inquiry' = 'chat_message',
    productId?: string
  ) {
    try {
      const notificationData = {
        recipientId,
        senderId,
        senderName,
        chatId,
        messageText: messageText.length > 100 ? messageText.substring(0, 97) + '...' : messageText,
        type,
        productId,
        createdAt: serverTimestamp(),
        status: 'pending'
      };

      await addDoc(collection(chatDb, 'notifications'), notificationData);
      console.log('Notification queued for:', recipientId);
    } catch (error) {
      console.error('Error queueing notification:', error);
    }
  },

  // Handle notification received while app is open
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  // Handle notification tapped/clicked
  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  // Get last notification response (for when app was closed and opened by notification)
  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return await Notifications.getLastNotificationResponseAsync();
  },

  // Clear all notifications
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  // Clear notifications for specific chat
  async clearChatNotifications(chatId: string) {
    try {
      const notifications = await Notifications.getPresentedNotificationsAsync();
      const chatNotifications = notifications.filter(
        notif => (notif.request.content.data as NotificationData)?.chatId === chatId
      );
      
      for (const notif of chatNotifications) {
        await Notifications.dismissNotificationAsync(notif.request.identifier);
      }
    } catch (error) {
      console.error('Error clearing chat notifications:', error);
    }
  },

  // Set badge count
  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  },

  // Schedule local notification (for testing) - FINAL FIXED VERSION
  async scheduleLocalNotification(
    title: string, 
    body: string, 
    data: NotificationData,
    seconds: number = 1
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data as Record<string, unknown>,
          sound: 'default',
        },
        trigger: { seconds } as any, // Type assertion to bypass the type error
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }
};