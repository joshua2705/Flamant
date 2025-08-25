//  finalllll-verison
import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './AuthContext';
import { notificationService } from '@/services/notificationService';

interface NotificationContextType {
  initializeNotifications: () => Promise<void>;
  clearChatNotifications: (chatId: string) => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  initializeNotifications: async () => {},
  clearChatNotifications: async () => {},
  setBadgeCount: async () => {},
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
    // Only initialize on physical devices
    if (user && Device.isDevice) {
      initializeNotifications().catch((error) => {
        console.error('Failed to initialize notifications:', error);
      });
    }

    return () => {
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
      console.log(' Initializing notifications...');
      
      // Skip on simulators
      // if (!Device.isDevice) {
      //   console.log('Skipping notifications on simulator');
      //   return;
      // }

      // Skip on web
      // if (Platform.OS === 'web') {
      //   console.log('Skipping notifications on web');
      //   return;
      // }

      const pushToken = await notificationService.registerForPushNotifications();
      
      if (pushToken && user) {
        await notificationService.saveUserPushToken(user.uid, pushToken);
        console.log(' Push token saved for user:', user.uid);
        console.log(' Push token:', pushToken);
      }

      // Add notification listeners only on physical devices
      notificationListener.current = notificationService.addNotificationReceivedListener(
        (notification: any) => {
          console.log('📨 Notification received while app open:', notification);
        }
      );

      responseListener.current = notificationService.addNotificationResponseReceivedListener(
        (response: any) => {
          console.log('👆 Notification tapped:', response);
          const data = response.notification.request.content.data;
          handleNotificationTap(data);
        }
      );

      // Check for notification that opened the app
      const lastNotificationResponse = await notificationService.getLastNotificationResponse();
      if (lastNotificationResponse) {
        console.log('App opened from notification:', lastNotificationResponse);
        const data = lastNotificationResponse.notification.request.content.data;
        handleNotificationTap(data);
      }

    } catch (error) {
      console.error('💥 Error initializing notifications:', error);
      // Don't throw - just log and continue
    }
  };

  const handleNotificationTap = (data: any) => {
    try {
      if (!data?.chatId) {
        console.log('⚠️ No chat ID in notification data');
        return;
      }

      console.log(' Navigating to chat:', data.chatId);
      
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
      console.error(' Error navigating to chat:', error);
    }
  };

  const clearChatNotifications = async (chatId: string) => {
    try {
      await notificationService.clearChatNotifications(chatId);
      console.log('🧹 Cleared notifications for chat:', chatId);
    } catch (error) {
      console.error('Error clearing chat notifications:', error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      await notificationService.setBadgeCount(count);
    } catch (error) {
      console.error('💥 Error setting badge count:', error);
    }
  };

  const contextValue: NotificationContextType = {
    initializeNotifications,
    clearChatNotifications,
    setBadgeCount,
  };

  // Wrap in error boundary
  try {
    return (
      <NotificationContext.Provider value={contextValue}>
        {children}
      </NotificationContext.Provider>
    );
  } catch (error) {
    console.error('NotificationProvider render error:', error);
    // Fallback - return children without notification context
    return <>{children}</>;
  }
};