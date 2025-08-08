import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView, // Re-added ScrollView for the main content
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Star, MapPin, User, MessageCircle } from 'lucide-react-native';
import Header from '@/components/Header';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockData'; 
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { chatUserService } from '@/services/chatUserService';
import { productService } from '@/services/productService';
import FoodLoadingAnimation from '@/components/FoodLoadingAnimation';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, userProfile } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // --- ADDED: State for quantity
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const foundProduct = await productService.getProductById(id);
      setProduct(foundProduct || null);
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to contact the seller');
      return;
    }
    
    if (!product) {
      Alert.alert('Error', 'Product information not available');
      return;
    }
    
    // Check if user is trying to contact themselves (for real users vs mock sellers)
    // Since sellers are mock data, we'll allow all interactions for now
    
    try {
      console.log('Starting chat with seller:', product.seller);
      
      // First, ensure current user is synced to chat Firebase
      const effectiveUserProfile = userProfile || {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
      };
      
      await chatUserService.syncUserToChatFirebase(user, effectiveUserProfile);
      
      // Create chat between buyer (current user) and seller (product owner)
      const chatId = await chatService.createChatRoomWithProduct(
        user.uid,           // buyerId (real Firebase user)
        product.sellerId,   // sellerId (mock user ID like "user1")
        product.id,         // productId
        {
          title: product.title,
          price: product.price,
          image: product.images[0],
        }
      );
      
      // Navigate to chat
      router.push({
        pathname: '/chat/[id]',
        params: {
          id: chatId,
          otherUserId: product.sellerId,
          otherUserName: product.seller.name,
          productTitle: product.title,
        }
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat with seller');
    }
  };

  const handleContactSeller = async () => {
    await handlePlaceOrder();
  };

  const adjustQuantity = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Product not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.fullscreen}>
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.fullscreen}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        showBackButton={true} // Re-enabled back button for navigation
        showSearch={false}
        title="Product Details" // Added the requested header title
        onLogoPress={() => router.push('/')}
      />
      <ScrollView style={styles.scrollViewContent}>
        <View style={styles.detailsCard}>
          <View style={styles.imageWrapper}>
            <ImageWithFallback
              source={{ uri: product.images[0] }}
              style={styles.productImage}
              fallbackText="Food image unavailable"
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            <Text style={styles.productPrice}>€{product.price.toFixed(2)}</Text>
            <View style={styles.metaData}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Servings</Text>
                <Text style={styles.metaValue}>{product.servings || 'N/A'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Chef</Text>
                <Text style={styles.metaValue}>{product.seller.name}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Location</Text>
                <Text style={styles.metaValue}>{product.location}</Text>
              </View>
            </View>

            {/* --- ADDED: Quantity Selector UI --- */}
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => adjustQuantity(-1)}
                  disabled={quantity === 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => adjustQuantity(1)}
                  disabled={quantity >= (product.servings || 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* --- END: Quantity Selector UI --- */}

            <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
              <Text style={styles.orderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

            <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
              <Text style={styles.orderButtonText}>Contact Seller</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  fullscreen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ee5899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  scrollViewContent: {
    flex: 1,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    padding: 30,
    marginHorizontal: 24,
    marginVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    alignSelf: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '70%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 12,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  productTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ee5899',
    marginBottom: 24,
  },
  metaData: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  metaValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    maxWidth: '60%',
    textAlign: 'right',
  },
  // --- ADDED: Styles for the new quantity selector
  quantityContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ee5899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  quantityText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  // --- END: Styles for the new quantity selector
  orderButton: {
    backgroundColor: '#ee5899',
    borderRadius: 30,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});