
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { Search, User, MessageCircle, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { chatUserService } from '@/services/chatUserService';
import { chatService } from '@/services/chatService';

interface ChatUser {
  id: string;
  name: string;
  email: string;
}

export default function SearchUsersScreen() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await chatUserService.searchUsers(term, user?.uid || '');
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const startChat = async (otherUser: ChatUser) => {
    if (!user) return;
    
    try {
      console.log('Starting chat with:', otherUser);
      const chatId = await chatService.createChatRoom(user.uid, otherUser.id);
      
      router.replace({
        pathname: '/chat/[id]',
        params: {
          id: chatId,
          otherUserId: otherUser.id,
          otherUserName: otherUser.name,
        }
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const renderUserItem = ({ item }: { item: ChatUser }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => startChat(item)}
    >
      <View style={styles.avatar}>
        <User size={24} color="#ee5899" strokeWidth={2} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <MessageCircle size={20} color="#ee5899" strokeWidth={2} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Users</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#999" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text);
              searchUsers(text);
            }}
            autoFocus
          />
        </View>
      </View>

      {/* Search Results */}
      {searchLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#ee5899" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchTerm ? (
              <View style={styles.emptyState}>
                <Search size={48} color="#D1D5DB" strokeWidth={1} />
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptySubtitle}>Try a different search term</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <User size={48} color="#D1D5DB" strokeWidth={1} />
                <Text style={styles.emptyTitle}>Search for users</Text>
                <Text style={styles.emptySubtitle}>Start typing to find other users to chat with</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#ee5899',
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    color: '#fff', 
    fontSize: 18, 
    fontFamily: 'Inter-SemiBold' 
  },
  headerSpacer: { width: 40 },
  searchContainer: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  searchInputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  loadingText: { 
    marginLeft: 8, 
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  userItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#FEF3F2', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  userInfo: { flex: 1 },
  userName: { 
    fontSize: 16, 
    fontFamily: 'Inter-SemiBold', 
    color: '#111827', 
    marginBottom: 2 
  },
  userEmail: { 
    fontSize: 14, 
    fontFamily: 'Inter-Regular', 
    color: '#6B7280' 
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingTop: 100 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontFamily: 'Inter-SemiBold', 
    color: '#374151', 
    marginTop: 20, 
    marginBottom: 8 
  },
  emptySubtitle: { 
    fontSize: 16, 
    fontFamily: 'Inter-Regular', 
    color: '#9CA3AF', 
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});