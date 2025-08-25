import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Only configure notifications on physical devices
if (Device.isDevice && Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async (notification: Notifications.Notification) => {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });
}

export const notificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      // Make sure you have EXPO_PUBLIC_PROJECT_ID in your environment
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

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

  async saveUserPushToken(userId: string, pushToken: string) {
    try {
      const userRef = doc(db, 'users', userId);
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

      await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Notification queued for:', recipientId);
    } catch (error) {
      console.error('Error queueing notification:', error);
    }
  },

  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  addNotificationResponseReceivedListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return await Notifications.getLastNotificationResponseAsync();
  },

  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  async clearChatNotifications(chatId: string) {
    try {
      const notifications = await Notifications.getPresentedNotificationsAsync();
      const chatNotifications = notifications.filter(
        (notif: any) =>
          notif.request.content.data?.chatId === chatId
      );

      for (const notif of chatNotifications) {
        await Notifications.dismissNotificationAsync(notif.request.identifier);
      }
    } catch (error) {
      console.error('Error clearing chat notifications:', error);
    }
  },

  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
};