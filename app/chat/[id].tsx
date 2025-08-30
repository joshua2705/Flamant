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
import { SafeAreaView } from 'react-native-safe-area-context';
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
import CustomPicker, { PickerItem } from '@/components/itemPicker';

import SoldBanner from '@/components/SoldBanner';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
}

export default function ChatDetailScreen() {
  console.log('🚀 ChatDetailScreen: Component initializing...');

  // Debug: Check if useLocalSearchParams works
  try {
    const { id: chatId, otherUserId, otherUserName } = useLocalSearchParams<{
      id: string;
      otherUserId: string;
      otherUserName: string;
    }>();
    console.log('✅ useLocalSearchParams successful:', { chatId, otherUserId, otherUserName });
  } catch (error) {
    console.error('❌ useLocalSearchParams failed:', error);
  }

  const { id: chatId, otherUserId, otherUserName } = useLocalSearchParams<{
    id: string;
    otherUserId: string;
    otherUserName: string;
  }>();

  // Debug: Check if useAuth works
  let user;
  try {
    const authResult = useAuth();
    user = authResult.user;
    console.log('✅ useAuth successful, user:', user?.uid || 'No user');
  } catch (error) {
    console.error('❌ useAuth failed:', error);
    // Fallback if useAuth fails
    user = null;
  }

  // Debug: State initialization
  console.log('🔄 Initializing state variables...');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [chatMeta, setChatMeta] = useState<any>(null);
  const [showSoldSheet, setShowSoldSheet] = useState(false);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantities, setSelectedQuantities] = useState<{ [id: string]: number }>({});

  console.log('✅ State variables initialized');

  // Debug: Ref initialization
  console.log('🔄 Initializing refs...');
  const flatListRef = useRef<FlatList>(null);
  console.log('✅ Refs initialized');

  // Debug: First useEffect - Fetch seller's active listings
  useEffect(() => {
    console.log('🔄 useEffect 1: Fetching seller products...');
    console.log('User check:', !!user);

    if (!user) {
      console.log('⚠️ useEffect 1: No user, skipping product fetch');
      return;
    }

    try {
      console.log('📡 Calling productService.getProductsBySeller for user:', user.uid);
      productService.getProductsBySeller(user.uid)
        .then((products) => {
          console.log('✅ Products fetched successfully:', products?.length || 0);
          // Filter products where isAvailable is explicitly true or is not defined
          const filteredProducts = products.filter(p => p.isAvailable === true || p.isAvailable === undefined);
          console.log('✅ Filtered products:', filteredProducts?.length || 0);
          setSellerProducts(filteredProducts);
        })
        .catch((error) => {
          console.error('❌ Error fetching seller products:', error);
        });
    } catch (error) {
      console.error('❌ useEffect 1: Exception in product fetch:', error);
    }
  }, [user]);

  // Debug: Second useEffect - Subscribe to chat metadata
  useEffect(() => {
    console.log('🔄 useEffect 2: Setting up chat metadata subscription...');
    console.log('Parameters check:', { user: !!user, chatId });

    if (!user || !chatId) {
      console.log('⚠️ useEffect 2: Missing user or chatId, skipping subscription');
      return;
    }

    try {
      console.log('📡 Calling chatService.subscribeToUserChats for user:', user.uid);
      const unsub = chatService.subscribeToUserChats(user.uid, (chats) => {
        console.log('📨 Chat subscription callback - received chats:', chats?.length || 0);
        try {
          const currentChat = chats.find((c) => c.id === chatId);
          console.log('🔍 Current chat found:', !!currentChat);
          if (currentChat) {
            console.log('✅ Setting chat meta:', currentChat);
            setChatMeta(currentChat);
          }
        } catch (error) {
          console.error('❌ Error processing chat subscription data:', error);
        }
      });
      console.log('✅ Chat subscription setup complete');
      return unsub;
    } catch (error) {
      console.error('❌ useEffect 2: Exception in chat subscription:', error);
    }
  }, [chatId, user]);

  // Debug: Third useEffect - Subscribe to messages
  useEffect(() => {
    console.log('🔄 useEffect 3: Setting up messages subscription...');
    console.log('Parameters check:', { user: !!user, chatId });

    if (!user || !chatId) {
      console.log('⚠️ useEffect 3: Missing user or chatId, skipping subscription');
      return;
    }

    try {
      console.log('📡 Calling chatService.subscribeToMessages for chat:', chatId);
      const unsub = chatService.subscribeToMessages(chatId, (msgs) => {
        console.log('📨 Messages subscription callback - received messages:', msgs?.length || 0);
        try {
          setMessages(msgs);
          setInitialLoading(false);
          console.log('✅ Messages updated, initial loading set to false');

          // Debug: Scroll to end
          setTimeout(() => {
            console.log('🔄 Attempting to scroll to end...');
            try {
              flatListRef.current?.scrollToEnd({ animated: true });
              console.log('✅ Scroll to end completed');
            } catch (error) {
              console.error('❌ Error scrolling to end:', error);
            }
          }, 100);
        } catch (error) {
          console.error('❌ Error processing messages subscription data:', error);
        }
      });
      console.log('✅ Messages subscription setup complete');
      return unsub;
    } catch (error) {
      console.error('❌ useEffect 3: Exception in messages subscription:', error);
    }
  }, [chatId, user]);

  // Debug: sendMessage function
  const sendMessage = async () => {
    console.log('🔄 sendMessage called');
    console.log('Message check:', {
      messageExists: !!newMessage.trim(),
      loading,
      user: !!user
    });

    if (!newMessage.trim() || loading || !user) {
      console.log('⚠️ sendMessage: Validation failed, aborting');
      return;
    }

    const text = newMessage.trim();
    console.log('📝 Sending message:', text);

    setNewMessage('');
    setLoading(true);

    try {
      console.log('📡 Calling chatService.sendMessage...');
      await chatService.sendMessage(chatId, user.uid, text);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message.');
      setNewMessage(text);
    } finally {
      setLoading(false);
      console.log('✅ sendMessage completed');
    }
  };

  // Debug: Role calculations
  console.log('🔄 Calculating user roles...');
  let isSeller, isBuyer, isSold, productTitle, productPrice, productId;

  try {
    isSeller = user?.uid && chatMeta?.sellerId && user.uid === chatMeta.sellerId;
    isBuyer = user?.uid && chatMeta?.buyerId && user.uid === chatMeta.buyerId;
    isSold = chatMeta?.productInfo?.isAvailable === false;
    productTitle = chatMeta?.productInfo?.title || '';
    productPrice = chatMeta?.productInfo?.price;
    productId = chatMeta?.productId || '';

    console.log('✅ Role calculations:', {
      isSeller,
      isBuyer,
      isSold,
      productTitle,
      productPrice,
      productId
    });
  } catch (error) {
    console.error('❌ Error calculating roles:', error);
    // Set fallback values
    isSeller = false;
    isBuyer = false;
    isSold = false;
    productTitle = '';
    productPrice = null;
    productId = '';
  }

  // Debug: renderMessage function
  const renderMessage = ({ item }: { item: Message }) => {
    console.log('🔄 Rendering message:', item?.id);

    try {
      const myMsg = item.senderId === user?.uid;
      console.log('✅ Message render data:', { myMsg, senderId: item.senderId, userId: user?.uid });

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
    } catch (error) {
      console.error('❌ Error rendering message:', error);
      return (
        <View>
          <Text>Error rendering message</Text>
        </View>
      );
    }
  };

  // Debug: Loading state
  if (initialLoading) {
    console.log('⏳ Showing loading screen...');
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ee5899" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Debug: Main render
  console.log('🔄 Rendering main ChatDetailScreen...');
  console.log('Render state:', {
    messagesCount: messages?.length || 0,
    isSeller,
    isSold,
    sellerProductsCount: sellerProducts?.length || 0
  });

  try {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              console.log('🔄 Back button pressed');
              try {
                router.back();
              } catch (error) {
                console.error('❌ Error navigating back:', error);
              }
            }} style={styles.backButton}>
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
            keyExtractor={(i) => {
              console.log('🔑 Extracting key for message:', i?.id);
              return i.id;
            }}
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
              <View style={styles.orderButtonWrapper}>
                <TouchableOpacity style={styles.denyOrderButton} >
                  <Text style={styles.denyOrderButtonText}>
                    Deny Sale
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.orderButtonWrapper}>
                <CustomPicker
                  items={sellerProducts.map((product): PickerItem => ({
                    label: `${product.title} (€${product.price})`,
                    value: product.id,
                  }))}
                  selectedValue={selectedProductId}
                  onValueChange={(value) => {
                    setSelectedProductId(value as string);
                    // Optionally reset quantity for others, but usually not necessary
                  }}
                  showQuantities={true}
                  quantities={selectedQuantities}
                  onQuantityChange={(productId, newQty) => {
                    setSelectedQuantities(q => ({ ...q, [productId]: newQty }));
                  }}
                  availableQuantities={Object.fromEntries(
                    sellerProducts.map(p => [p.id, p.servings])
                  )}
                  placeholder="Proceed Sale"
                  modalTitle="Select Product & Quantity"
                  onConfirm={async () => {
                    console.log('🔄 Confirm button pressed');
                    setShowSoldSheet(true);
                    try {
                      const buyerId = chatMeta?.buyerId || otherUserId;
                      const product = sellerProducts.find(p => p.id === selectedProductId);
                      const selectedQuantity = selectedQuantities[selectedProductId] || 0;
                      console.log('📡 Marking product as sold...');
                      await orderService.markProductAsSold(
                        buyerId,
                        user?.uid || '',
                        selectedProductId,
                        product?.price ?? 0,
                        selectedQuantity
                      );
                      console.log('✅ Product marked as sold');
                    } catch (error) {
                      console.error('❌ Error marking product as sold:', error);
                      Alert.alert('Error', 'Could not mark product as sold.');
                    }
                  }}
                />
              </View>
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
                onChangeText={(text) => {
                  console.log('🔄 Text input changed:', text.length, 'characters');
                  setNewMessage(text);
                }}
                placeholder="Type a message..."
                style={styles.textInput}
                multiline
                editable={!loading}
                placeholderTextColor="#bbb"
              />
              <TouchableOpacity
                style={[styles.sendButton, (!newMessage.trim() || loading) && styles.sendButtonDisabled]}
                onPress={() => {
                  console.log('🔄 Send button pressed');
                  sendMessage();
                }}
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
            onRequestClose={() => {
              console.log('🔄 Modal close requested');
              setShowSoldSheet(false);
            }}
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
                  onPress={() => {
                    console.log('🔄 Modal close button pressed');
                    setShowSoldSheet(false);
                  }}
                >
                  <Text style={styles.modalBtnText}>Close</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('❌ Critical error in main render:', error);
    return (
      <View style={styles.container}>
        <Text>Error: Component crashed during render</Text>
      </View>
    );
  }
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
  orderButtonWrapper: { flex: 1, marginRight: 8 },

  denyOrderButton: { flexDirection: 'row', borderWidth: 1, borderColor: '#ee5899', backgroundColor: '#fff', borderRadius: 8, padding: 12, minHeight: 48 },
  denyOrderButtonText: { fontSize: 16, color: '#ee5899', flex: 1, textAlign: 'center' },

  confirmBtn: { backgroundColor: '#ee5899', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  confirmBtnText: { color: '#fff', fontFamily: 'Inter-SemiBold' },
  actionContainer: { alignItems: 'center', backgroundColor: '#fff', paddingVertical: 10 },
  inputContainer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', padding: 12, paddingBottom: Platform.OS === 'ios' ? 34 : 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end' },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, marginRight: 8, maxHeight: 100, backgroundColor: '#f9f9f9', fontFamily: 'Inter-Regular' },
  sendButton: { backgroundColor: '#ee5899', width: 44, height: 44, borderRadius: 22, justifyContent: 'space-around', alignItems: 'center', transform: [{ rotate: '45deg' }] },
  sendButtonDisabled: { backgroundColor: '#e0e0e0' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 28, alignItems: 'center' },
  modalTitle: { fontFamily: 'Inter-Bold', fontSize: 22, color: '#ee5899', marginBottom: 6 },
  modalDesc: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#374151', marginBottom: 18, textAlign: 'center' },
  modalBox: { backgroundColor: '#f8e1ef', borderRadius: 12, width: '100%', padding: 16, marginBottom: 18 },
  modalLabel: { fontFamily: 'Inter-Medium', fontSize: 15, color: '#888' },
  modalValue: { fontFamily: 'Inter-Bold', color: '#111' },
  modalBtn: { backgroundColor: '#ee5899', borderRadius: 8, paddingHorizontal: 32, paddingVertical: 12 },
  modalBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#fff' },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
