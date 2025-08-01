import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MessageCircle, User, Search, ShoppingBag, DollarSign } from 'lucide-react-native';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { chatUserService } from '@/services/chatUserService';

interface ChatWithUser {
  id: string;
  participants: string[];
  lastMessage: string | null;
  lastMessageTime: Date | null;
  productId?: string;
  productInfo?: {
    title: string;
    price: number;
    image?: string;
  };
  buyerId?: string;
  sellerId?: string;
  userRole: 'buyer' | 'seller';
  isProductChat: boolean;
  otherUser: {
    id: string;
    name: string;
    email?: string;
  };
  unread: boolean;
}

type TabType = 'purchases' | 'sales';

export default function ChatScreen() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('purchases');
  const [purchaseChats, setPurchaseChats] = useState<ChatWithUser[]>([]);
  const [salesChats, setSalesChats] = useState<ChatWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSynced, setUserSynced] = useState(false);

  useEffect(() => {
    console.log('=================');
    console.log('Debug: user =', user);
    console.log('Debug: userProfile =', userProfile);
    
    if (!user) {
      console.log('Missing user - not logged in');
      setLoading(false);
      return;
    }

    // Create userProfile from auth user if it doesn't exist
    const effectiveUserProfile = userProfile || {
      id: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
    };

    console.log('Using effectiveUserProfile:', effectiveUserProfile);

    // Sync user from main Firebase to chat Firebase
    const syncUser = async () => {
      try {
        console.log('Starting sync to chat Firebase...');
        await chatUserService.syncUserToChatFirebase(user, effectiveUserProfile);
        console.log('User synced successfully!');
        setUserSynced(true);
      } catch (error: any) {
        console.error('❌ Error syncing user:', error);
        setLoading(false);
      }
    };

    syncUser();
  }, [user, userProfile]);

  useEffect(() => {
    if (!user || !userSynced) return;

    console.log('🔍 Setting up chat subscriptions for user:', user.uid);
    
    // Subscribe to purchase chats (where user is buyer)
    const unsubscribePurchases = chatService.subscribeToUserPurchases(user.uid, async (userPurchaseChats) => {
      console.log('Received purchase chats:', userPurchaseChats.length);
      
      const chatsWithUserData = await Promise.all(
        userPurchaseChats.map(async (chat) => {
          // For purchases, the other user is the seller
          const otherUserId = chat.sellerId;
          const otherUser = await chatUserService.getUserById(otherUserId);
          
          return {
            ...chat,
            otherUser: otherUser || { id: otherUserId, name: 'Unknown Seller' },
            unread: false,
          };
        })
      );
      
      // Sort by last message time
      chatsWithUserData.sort((a, b) => {
        const timeA = a.lastMessageTime || a.createdAt;
        const timeB = b.lastMessageTime || b.createdAt;
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
      
      setPurchaseChats(chatsWithUserData);
    });

    // Subscribe to sales chats (where user is seller)
    const unsubscribeSales = chatService.subscribeToUserSales(user.uid, async (userSalesChats) => {
      console.log('Received sales chats:', userSalesChats.length);
      
      const chatsWithUserData = await Promise.all(
        userSalesChats.map(async (chat) => {
          // For sales, the other user is the buyer
          const otherUserId = chat.buyerId;
          const otherUser = await chatUserService.getUserById(otherUserId);
          
          return {
            ...chat,
            otherUser: otherUser || { id: otherUserId, name: 'Unknown Buyer' },
            unread: false,
          };
        })
      );
      
      // Sort by last message time
      chatsWithUserData.sort((a, b) => {
        const timeA = a.lastMessageTime || a.createdAt;
        const timeB = b.lastMessageTime || b.createdAt;
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
      
      setSalesChats(chatsWithUserData);
    });

    setLoading(false);

    return () => {
      unsubscribePurchases();
      unsubscribeSales();
    };
  }, [user, userSynced]);

  const handleChatPress = (chat: ChatWithUser) => {
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: chat.id,
        otherUserId: chat.otherUser.id,
        otherUserName: chat.otherUser.name,
      }
    });
  };

  const handleSearchPress = () => {
    router.push('/chat/search');
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / (24 * 60));
      return `${days}d ago`;
    }
  };

  const ChatItem = ({ chat }: { chat: ChatWithUser }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(chat)}>
      <View style={styles.avatar}>
        <User size={24} color="#ee5899" strokeWidth={2} />
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{chat.otherUser.name}</Text>
          <Text style={styles.chatTime}>
            {formatTime(chat.lastMessageTime)}
          </Text>
        </View>
        
        {/* Show product info if it's a product chat */}
        {chat.isProductChat && chat.productInfo && (
          <Text style={styles.productTitle} numberOfLines={1}>
            {chat.productInfo.title} - €{chat.productInfo.price.toFixed(2)}
          </Text>
        )}
        
        <Text 
          style={[
            styles.lastMessage,
            chat.unread && styles.unreadMessage
          ]}
          numberOfLines={1}
        >
          {chat.lastMessage || 'No messages yet'}
        </Text>
      </View>
      
      {chat.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const TabButton = ({ tab, title, icon }: { tab: TabType; title: string; icon: any }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const EmptyState = ({ type }: { type: TabType }) => (
    <View style={styles.emptyState}>
      {type === 'purchases' ? (
        <ShoppingBag size={64} color="#D1D5DB" strokeWidth={1} />
      ) : (
        <DollarSign size={64} color="#D1D5DB" strokeWidth={1} />
      )}
      <Text style={styles.emptyTitle}>
        {type === 'purchases' ? 'No purchases yet' : 'No sales yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {type === 'purchases' 
          ? 'Start browsing products and contact sellers' 
          : 'List your products to start receiving inquiries'
        }
      </Text>
      <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
        <Search size={20} color="#fff" strokeWidth={2} />
        <Text style={styles.searchButtonText}>Find Users to Chat</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading while syncing user or if not logged in
  if (loading || !userSynced) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ee5899" />
        <Text style={styles.loadingText}>
          {!user ? 'Please log in to use chat' : 'Setting up chat...'}
        </Text>
      </View>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <View style={styles.container}>
        <Header title="Messages" showProfile />
        <View style={styles.emptyState}>
          <MessageCircle size={64} color="#D1D5DB" strokeWidth={1} />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptySubtitle}>
            Please log in to access chat features
          </Text>
        </View>
      </View>
    );
  }

  const currentChats = activeTab === 'purchases' ? purchaseChats : salesChats;

  return (
    <View style={styles.container}>
      <Header title="Messages" showProfile />
      
      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.currentUser}>
          👋 Hi, {userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User'}!
        </Text>
        <Text style={styles.currentUserId}>Chat ID: {user?.uid}</Text>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton 
          tab="purchases" 
          title={`My Purchases (${purchaseChats.length})`} 
          icon={<ShoppingBag size={20} color={activeTab === 'purchases' ? '#fff' : '#6B7280'} strokeWidth={2} />}
        />
        <TabButton 
          tab="sales" 
          title={`My Sales (${salesChats.length})`} 
          icon={<DollarSign size={20} color={activeTab === 'sales' ? '#fff' : '#6B7280'} strokeWidth={2} />}
        />
      </View>
      
      {/* Chat List */}
      {currentChats.length === 0 ? (
        <EmptyState type={activeTab} />
      ) : (
        <FlatList
          data={currentChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatItem chat={item} />}
          style={styles.chatList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  userInfo: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  currentUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
  },
  currentUserId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: '#F9FAFB',
  },
  activeTab: {
    backgroundColor: '#ee5899',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#fff',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF3F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  chatTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  productTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#ee5899',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  unreadMessage: {
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ee5899',
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ee5899',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});