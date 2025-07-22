
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Send, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
}

export default function ChatDetailScreen() {
  const { id: chatId, otherUserId, otherUserName } = useLocalSearchParams<{
    id: string;
    otherUserId: string;
    otherUserName: string;
  }>();
  
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user || !chatId) return;

    console.log('Setting up message subscription for chat:', chatId);
    
    const unsubscribe = chatService.subscribeToMessages(chatId, (newMessages) => {
      console.log('Received messages:', newMessages.length);
      setMessages(newMessages);
      setInitialLoading(false);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return unsubscribe;
  }, [chatId, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || loading || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      await chatService.sendMessage(chatId, user.uid, messageText);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setNewMessage(messageText);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: Date) => {
    if (!timestamp) return '';
    
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === user?.uid;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            isMyMessage ? styles.myTimestamp : styles.otherTimestamp
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ee5899" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Start your conversation with {otherUserName}
            </Text>
          </View>
        }
      />
      
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={`Message ${otherUserName}...`}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              (!newMessage.trim() || loading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: { 
    marginTop: 10, 
    color: '#666', 
    fontSize: 16,
    fontFamily: 'Inter-Regular'
  },
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
  messagesList: { flex: 1 },
  messagesContainer: { padding: 16 },
  messageContainer: { marginVertical: 2 },
  myMessage: { alignItems: 'flex-end' },
  otherMessage: { alignItems: 'flex-start' },
  messageBubble: { 
    maxWidth: '80%', 
    padding: 12, 
    borderRadius: 16, 
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myMessageBubble: { backgroundColor: '#ee5899', borderBottomRightRadius: 4 },
  otherMessageBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  messageText: { 
    fontSize: 16, 
    lineHeight: 20, 
    marginBottom: 4,
    fontFamily: 'Inter-Regular'
  },
  myMessageText: { color: '#fff' },
  otherMessageText: { color: '#000' },
  timestamp: { 
    fontSize: 11, 
    alignSelf: 'flex-end',
    fontFamily: 'Inter-Regular'
  },
  myTimestamp: { color: 'rgba(255, 255, 255, 0.7)' },
  otherTimestamp: { color: '#999' },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 40 
  },
  emptyStateText: { 
    fontSize: 16, 
    color: '#999', 
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  inputContainer: { 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#e0e0e0', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end' },
  textInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    marginRight: 8, 
    maxHeight: 100, 
    fontSize: 16, 
    backgroundColor: '#f9f9f9',
    fontFamily: 'Inter-Regular',
  },
  sendButton: { 
    backgroundColor: '#ee5899', 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendButtonDisabled: { 
    backgroundColor: '#e0e0e0', 
    elevation: 0, 
    shadowOpacity: 0 
  },
});