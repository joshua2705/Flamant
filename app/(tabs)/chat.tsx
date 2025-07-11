import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle, User, ShoppingBag, Package } from 'lucide-react-native';
import Header from '@/components/Header';
import { Chat, User as UserType } from '@/types';

// Mock data for buying chats (user is the buyer)
const mockBuyingChats: Chat[] = [
  {
    id: 'buy1',
    participants: ['currentUser', 'user1'],
    lastMessage: {
      id: 'msg1',
      chatId: 'buy1',
      senderId: 'user1',
      receiverId: 'currentUser',
      message: 'The pasta is still available! When would you like to pick it up?',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      isRead: false,
    },
    updatedAt: new Date(Date.now() - 15 * 60 * 1000),
    productId: '1',
    productTitle: 'Homemade Pasta Bolognese',
    sellerName: 'Marie Dubois',
  },
  {
    id: 'buy2',
    participants: ['currentUser', 'user3'],
    lastMessage: {
      id: 'msg2',
      chatId: 'buy2',
      senderId: 'currentUser',
      receiverId: 'user3',
      message: 'Perfect! I\'ll be there at 2 PM to pick up the curry.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      isRead: true,
    },
    updatedAt: new Date(Date.now() - 45 * 60 * 1000),
    productId: '3',
    productTitle: 'Spicy Thai Green Curry',
    sellerName: 'Sophie Chen',
  },
  {
    id: 'buy3',
    participants: ['currentUser', 'user5'],
    lastMessage: {
      id: 'msg3',
      chatId: 'buy3',
      senderId: 'user5',
      receiverId: 'currentUser',
      message: 'Hi! The butter chicken is ready. Building D, Floor 2, room 205.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: true,
    },
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    productId: '5',
    productTitle: 'Indian Butter Chicken & Naan',
    sellerName: 'Priya Patel',
  },
];

// Mock data for selling chats (user is the seller)
const mockSellingChats: Chat[] = [
  {
    id: 'sell1',
    participants: ['currentUser', 'buyer1'],
    lastMessage: {
      id: 'msg4',
      chatId: 'sell1',
      senderId: 'buyer1',
      receiverId: 'currentUser',
      message: 'Is the apple pie still available? I\'d love to try it!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false,
    },
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    productId: '8',
    productTitle: 'Homemade Apple Pie',
    buyerName: 'James Wilson',
  },
  {
    id: 'sell2',
    participants: ['currentUser', 'buyer2'],
    lastMessage: {
      id: 'msg5',
      chatId: 'sell2',
      senderId: 'currentUser',
      receiverId: 'buyer2',
      message: 'Great! The bento box will be ready by noon. I\'ll let you know when it\'s done.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isRead: true,
    },
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    productId: '6',
    productTitle: 'Japanese Bento Box',
    buyerName: 'Emma Thompson',
  },
  {
    id: 'sell3',
    participants: ['currentUser', 'buyer3'],
    lastMessage: {
      id: 'msg6',
      chatId: 'sell3',
      senderId: 'buyer3',
      receiverId: 'currentUser',
      message: 'Thank you so much! The croissants were absolutely delicious 😊',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      isRead: true,
    },
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    productId: '2',
    productTitle: 'Fresh Croissants & Pain au Chocolat',
    buyerName: 'Lucas Martin',
  },
  {
    id: 'sell4',
    participants: ['currentUser', 'buyer4'],
    lastMessage: {
      id: 'msg7',
      chatId: 'sell4',
      senderId: 'buyer4',
      receiverId: 'currentUser',
      message: 'Hi! I saw your mezze platter listing. Is it still available for tonight?',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      isRead: false,
    },
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    productId: '7',
    productTitle: 'Mediterranean Mezze Platter',
    buyerName: 'Anna Rodriguez',
  },
];

type TabType = 'buying' | 'selling';

interface ChatItemProps {
  chat: Chat;
  onPress: () => void;
  type: TabType;
}

function ChatItem({ chat, onPress, type }: ChatItemProps) {
  const formatTime = (date: Date) => {
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

  const getDisplayName = () => {
    if (type === 'buying') {
      return (chat as any).sellerName || 'Seller';
    } else {
      return (chat as any).buyerName || 'Buyer';
    }
  };

  const getProductTitle = () => {
    return (chat as any).productTitle || 'Food Item';
  };

  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <View style={styles.avatar}>
        <User size={24} color="#ee5899" strokeWidth={2} />
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.chatName}>{getDisplayName()}</Text>
            <View style={[styles.typeBadge, type === 'buying' ? styles.buyingBadge : styles.sellingBadge]}>
              {type === 'buying' ? (
                <ShoppingBag size={12} color="#ffffff" strokeWidth={2} />
              ) : (
                <Package size={12} color="#ffffff" strokeWidth={2} />
              )}
              <Text style={styles.typeBadgeText}>{type === 'buying' ? 'Buying' : 'Selling'}</Text>
            </View>
          </View>
          <Text style={styles.chatTime}>
            {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}
          </Text>
        </View>
        
        <Text style={styles.productTitle} numberOfLines={1}>
          {getProductTitle()}
        </Text>
        
        <Text 
          style={[
            styles.lastMessage,
            !chat.lastMessage?.isRead && styles.unreadMessage
          ]}
          numberOfLines={1}
        >
          {chat.lastMessage?.message || 'No messages yet'}
        </Text>
      </View>
      
      {!chat.lastMessage?.isRead && (
        <View style={styles.unreadDot} />
      )}
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('buying');
  const [buyingChats] = useState<Chat[]>(mockBuyingChats);
  const [sellingChats] = useState<Chat[]>(mockSellingChats);

  const handleChatPress = (chatId: string) => {
    // TODO: Navigate to chat detail screen
    console.log('Open chat:', chatId);
  };

  const getActiveChats = () => {
    return activeTab === 'buying' ? buyingChats : sellingChats;
  };

  const getUnreadCount = (chats: Chat[]) => {
    return chats.filter(chat => !chat.lastMessage?.isRead).length;
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MessageCircle size={64} color="#D1D5DB" strokeWidth={1} />
      <Text style={styles.emptyTitle}>
        {activeTab === 'buying' ? 'No buying conversations' : 'No selling conversations'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'buying' 
          ? 'Start chatting with sellers about their food items'
          : 'Your selling conversations will appear here when buyers contact you'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Messages" showProfile />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buying' && styles.activeTab]}
          onPress={() => setActiveTab('buying')}
        >
          <ShoppingBag size={20} color={activeTab === 'buying' ? '#ee5899' : '#9CA3AF'} strokeWidth={2} />
          <Text style={[styles.tabText, activeTab === 'buying' && styles.activeTabText]}>
            Buying
          </Text>
          {getUnreadCount(buyingChats) > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{getUnreadCount(buyingChats)}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'selling' && styles.activeTab]}
          onPress={() => setActiveTab('selling')}
        >
          <Package size={20} color={activeTab === 'selling' ? '#ee5899' : '#9CA3AF'} strokeWidth={2} />
          <Text style={[styles.tabText, activeTab === 'selling' && styles.activeTabText]}>
            Selling
          </Text>
          {getUnreadCount(sellingChats) > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{getUnreadCount(sellingChats)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Chat List */}
      {getActiveChats().length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={getActiveChats()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatItem
              chat={item}
              type={activeTab}
              onPress={() => handleChatPress(item.id)}
            />
          )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#ee5899',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#ee5899',
  },
  tabBadge: {
    backgroundColor: '#ee5899',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
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
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  buyingBadge: {
    backgroundColor: '#4fcf88',
  },
  sellingBadge: {
    backgroundColor: '#ff691f',
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  chatTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  productTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
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
  },
});