import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, MapPin, User, MessageCircle } from 'lucide-react-native';
import ImageGallery from '@/components/ImageGallery';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { chatUserService } from '@/services/chatUserService';
// import { productService } from '@/services/productService';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, userProfile } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      // const fetchedProduct = await productService.getProductById(id);
      // setProduct(fetchedProduct);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const foundProduct = mockProducts.find(p => p.id === id);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <ImageGallery 
          images={product.images}
          imageStyle={styles.productImage}
          enableFullscreen={false}
          showThumbnails={product.images.length > 1}
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>€{product.price.toFixed(2)}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.locationText}>{product.location}</Text>
          </View>

          <View style={styles.servingsContainer}>
            <Text style={styles.servingsLabel}>Servings: </Text>
            <Text style={styles.servingsValue}>{product.servings || 'Not specified'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{product.notes || 'No additional notes'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chef</Text>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatar}>
                <User size={24} color="#ee5899" strokeWidth={2} />
              </View>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{product.seller.name}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#ffc847" fill="#ffc847" strokeWidth={0} />
                  <Text style={styles.ratingText}>{product.seller.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({product.seller.reviewCount} reviews)</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
                <MessageCircle size={20} color="#ee5899" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => adjustQuantity(-1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => adjustQuantity(1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.orderSection}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>€{(product.price * quantity).toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
          <Text style={styles.orderButtonText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    backgroundColor: '#ffffff',
    padding: 20,
  },
  productTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ee5899',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  servingsLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  servingsValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ee5899',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
  },
  notes: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF3F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  contactButton: {
    padding: 12,
    backgroundColor: '#FEF3F2',
    borderRadius: 12,
  },
  quantityContainer: {
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
    color: '#ffffff',
  },
  quantityText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    minWidth: 30,
    textAlign: 'center',
  },
  orderSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  totalPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ee5899',
  },
  orderButton: {
    backgroundColor: '#ee5899',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    color: '#ffffff',
  },
});