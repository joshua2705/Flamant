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
  ActivityIndicator,
  Modal
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Send, ArrowLeft } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';
import { Picker } from '@react-native-picker/picker';

import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { orderService } from '@/services/orderService';
import { productService } from '@/services/productService';

import SoldBanner from '@/components/SoldBanner';

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
  const [chatMeta, setChatMeta] = useState<any>(null);
  const [showSoldSheet, setShowSoldSheet] = useState(false);

  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  // Fetch seller's active listings
  useEffect(() => {
    if (!user) return;
    productService.getProductsBySeller(user.uid).then((products) => {
      // Filter products where isAvailable is explicitly true or is not defined
      setSellerProducts(products.filter(p => p.isAvailable === true || p.isAvailable === undefined));
    });
  }, [user]);

  // Subscribe to chat metadata
  useEffect(() => {
    if (!user || !chatId) return;
    const unsub = chatService.subscribeToUserChats(user.uid, (chats) => {
      const currentChat = chats.find((c) => c.id === chatId);
      if (currentChat) {
        setChatMeta(currentChat);
      }
    });
    return unsub;
  }, [chatId, user]);

  // Subscribe to messages
  useEffect(() => {
    if (!user || !chatId) return;
    const unsub = chatService.subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setInitialLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [chatId, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || loading || !user) return;
    const text = newMessage.trim();
    setNewMessage('');
    setLoading(true);
    try {
      await chatService.sendMessage(chatId, user.uid, text);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message.');
      setNewMessage(text);
    } finally {
      setLoading(false);
    }
  };

  // Role & product status
  const isSeller = user?.uid && chatMeta?.sellerId && user.uid === chatMeta.sellerId;
  const isBuyer = user?.uid && chatMeta?.buyerId && user.uid === chatMeta.buyerId;
  const isSold = chatMeta?.productInfo?.isAvailable === false;
  const productTitle = chatMeta?.productInfo?.title || '';
  const productPrice = chatMeta?.productInfo?.price;
  const productId = chatMeta?.productId || '';

  const renderMessage = ({ item }: { item: Message }) => {
    const myMsg = item.senderId === user?.uid;
    return (
      <View style={[styles.messageContainer, myMsg ? styles.myMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, myMsg ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, myMsg ? styles.myText : styles.otherText]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, myMsg ? styles.myTime : styles.otherTime]}>
            {item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#fff" size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(i) => i.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Start your conversation with {otherUserName}
            </Text>
          </View>
        }
      />

      {/* Seller product & quantity selection strip */}
      {isSeller && !isSold && (
        <View style={styles.selectionStrip}>
          {/* Product Picker */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedProductId}
              onValueChange={(itemValue: string) => setSelectedProductId(itemValue)}
            >
              <Picker.Item label="Select product" value="" enabled={false} />
              {sellerProducts.map((product) => (
                <Picker.Item
                  key={product.id}
                  label={`${product.title} (€${product.price})`}
                  value={product.id}
                />
              ))}
            </Picker>
          </View>

          {/* Quantity Picker */}
          <View style={[styles.pickerWrapper, { flex: 0.4 }]}>
            <Picker
              selectedValue={selectedQuantity}
              enabled={!!selectedProductId}
              onValueChange={(itemValue: number) => setSelectedQuantity(itemValue)}
            >
              <Picker.Item label="Select quantity" value={0} enabled={false} />
              {sellerProducts.find(p => p.id === selectedProductId)?.servings &&
                Array.from({ length: sellerProducts.find(p => p.id === selectedProductId).servings }, (_, i) => i + 1)
                  .map(qty => <Picker.Item key={qty} label={`${qty}`} value={qty} />)
              }
            </Picker>
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (!selectedProductId || selectedQuantity === 0) && { backgroundColor: '#ccc' }
            ]}
            disabled={!selectedProductId || selectedQuantity === 0}
            onPress={async () => {
              setShowSoldSheet(true);
              try {
                const buyerId = chatMeta?.buyerId || otherUserId;
                const product = sellerProducts.find(p => p.id === selectedProductId);
                await orderService.markProductAsSold(
                  buyerId,
                  user.uid,
                  selectedProductId,
                  product?.price ?? 0,
                  selectedQuantity // Pass the selected quantity here
                );
              } catch {
                Alert.alert('Error', 'Could not mark product as sold.');
              }
            }}
          >
            <Text style={styles.confirmBtnText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SOLD banner */}
      {(isSold && (isSeller || isBuyer)) && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.actionContainer}>
          <SoldBanner />
        </Animated.View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            style={styles.textInput}
            multiline
            editable={!loading}
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || loading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || loading}
          >
            <Send color="#fff" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirmation Bottom Sheet */}
      <Modal
        visible={showSoldSheet}
        transparent
        animationType="none"
        onRequestClose={() => setShowSoldSheet(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={SlideInDown.springify().damping(16)}
            exiting={SlideOutDown}
            style={styles.modalSheet}
          >
            <Text style={styles.modalTitle}>Order Confirmed!</Text>
            <Text style={styles.modalDesc}>
              Your product has been marked as sold.
            </Text>
            <View style={styles.modalBox}>
              <Text style={styles.modalLabel}>
                Product: <Text style={styles.modalValue}>
                  {sellerProducts.find(p => p.id === selectedProductId)?.title || productTitle}
                </Text>
              </Text>
              <Text style={styles.modalLabel}>
                Buyer: <Text style={styles.modalValue}>{otherUserName}</Text>
              </Text>
              <Text style={styles.modalLabel}>
                Quantity: <Text style={styles.modalValue}>{selectedQuantity}</Text>
              </Text>
              <Text style={styles.modalLabel}>
                Date: <Text style={styles.modalValue}>{new Date().toLocaleDateString()}</Text>
              </Text>
              {!!productPrice && (
                <Text style={styles.modalLabel}>
                  Amount: <Text style={styles.modalValue}>
                    {sellerProducts.find(p => p.id === selectedProductId)?.price ?? productPrice} Euro
                  </Text>
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setShowSoldSheet(false)}
            >
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontFamily: 'Inter-Regular', color: '#666' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#ee5899', paddingTop: Platform.OS === 'ios' ? 60 : 16 },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, textAlign: 'center', fontFamily: 'Inter-SemiBold' },
  messagesList: { flex: 1 },
  messagesContainer: { padding: 16 },
  messageContainer: { marginVertical: 2 },
  myMessage: { alignItems: 'flex-end' },
  otherMessage: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  myBubble: { backgroundColor: '#ee5899', borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16, marginBottom: 4, fontFamily: 'Inter-Regular' },
  myText: { color: '#fff' },
  otherText: { color: '#000' },
  timestamp: { fontSize: 11, alignSelf: 'flex-end', fontFamily: 'Inter-Regular' },
  myTime: { color: 'rgba(255,255,255,0.7)' },
  otherTime: { color: '#999' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily: 'Inter-Regular', color: '#999' },
  selectionStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  pickerWrapper: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginRight: 8, backgroundColor: '#fff' },
  confirmBtn: { backgroundColor: '#ee5899', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  confirmBtnText: { color: '#fff', fontFamily: 'Inter-SemiBold' },
  actionContainer: { alignItems: 'center', backgroundColor: '#fff', paddingVertical: 10 },
  inputContainer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', padding: 12, paddingBottom: Platform.OS === 'ios' ? 34 : 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end' },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, marginRight: 8, maxHeight: 100, backgroundColor: '#f9f9f9', fontFamily: 'Inter-Regular' },
  sendButton: { backgroundColor: '#ee5899', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#e0e0e0' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 28, alignItems: 'center' },
  modalTitle: { fontFamily: 'Inter-Bold', fontSize: 22, color: '#ee5899', marginBottom: 6 },
  modalDesc: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#374151', marginBottom: 18, textAlign: 'center' },
  modalBox: { backgroundColor: '#f8e1ef', borderRadius: 12, width: '100%', padding: 16, marginBottom: 18 },
  modalLabel: { fontFamily: 'Inter-Medium', fontSize: 15, color: '#888' },
  modalValue: { fontFamily: 'Inter-Bold', color: '#111' },
  modalBtn: { backgroundColor: '#ee5899', borderRadius: 8, paddingHorizontal: 32, paddingVertical: 12 },
  modalBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#fff' }
});
