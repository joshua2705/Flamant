
import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useAuth } from './AuthContext';
import { notificationService, NotificationData } from '@/services/notificationService';

interface NotificationContextType {
  initializeNotifications: () => Promise<void>;
  clearChatNotifications: (chatId: string) => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
}

// Create context with default values
const NotificationContext = createContext<NotificationContextType>({
  initializeNotifications: async () => {
    console.log('Default initializeNotifications called');
  },
  clearChatNotifications: async (chatId: string) => {
    console.log('Default clearChatNotifications called for:', chatId);
  },
  setBadgeCount: async (count: number) => {
    console.log('Default setBadgeCount called with:', count);
  },
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (user) {
      initializeNotifications();
    }

    return () => {
      // Cleanup listeners
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  const initializeNotifications = async () => {
    try {
      console.log('🔔 Initializing notifications...');
      
      // Register for push notifications
      const pushToken = await notificationService.registerForPushNotifications();
      
      if (pushToken && user) {
        // Save token to Firebase
        await notificationService.saveUserPushToken(user.uid, pushToken);
        console.log('✅ Push token saved for user:', user.uid);
      }

      // Handle notifications received while app is in foreground
      notificationListener.current = notificationService.addNotificationReceivedListener(
        (notification) => {
          console.log('📱 Notification received while app open:', notification);
        }
      );

      // Handle notification taps
      responseListener.current = notificationService.addNotificationResponseReceivedListener(
        (response) => {
          console.log('👆 Notification tapped:', response);
          const data = response.notification.request.content.data as NotificationData;
          handleNotificationTap(data);
        }
      );

      // Check if app was opened by tapping a notification
      const lastNotificationResponse = await notificationService.getLastNotificationResponse();
      if (lastNotificationResponse) {
        console.log('🚀 App opened from notification:', lastNotificationResponse);
        const data = lastNotificationResponse.notification.request.content.data as NotificationData;
        handleNotificationTap(data);
      }

    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const handleNotificationTap = (data: NotificationData | null) => {
    if (!data?.chatId) {
      console.log(' No chat ID in notification data');
      return;
    }

    console.log('Navigating to chat:', data.chatId);
    
    try {
      // Navigate to the specific chat
      router.push({
        pathname: '/chat/[id]' as const,
        params: {
          id: data.chatId,
          otherUserId: data.senderId,
          otherUserName: data.senderName,
        },
      });

      // Clear notifications for this chat
      notificationService.clearChatNotifications(data.chatId);
    } catch (error) {
      console.error('Error navigating to chat:', error);
    }
  };

  const clearChatNotifications = async (chatId: string) => {
    try {
      await notificationService.clearChatNotifications(chatId);
      console.log('Cleared notifications for chat:', chatId);
    } catch (error) {
      console.error('Error clearing chat notifications:', error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      await notificationService.setBadgeCount(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  };

  const contextValue: NotificationContextType = {
    initializeNotifications,
    clearChatNotifications,
    setBadgeCount,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};