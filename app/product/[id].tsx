import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import Header from '@/components/Header';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { chatUserService } from '@/services/chatUserService';
import { productService } from '@/services/productService';
import FoodLoadingAnimation from '@/components/FoodLoadingAnimation';
import Carousel from 'react-native-reanimated-carousel';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id, product: productParam } = useLocalSearchParams<{ id: string; product?: string }>();

  const { user, userProfile } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Parse product from params on mount
  useEffect(() => {
    if (productParam) {
      try {
        const parsedProduct: Product = JSON.parse(productParam);
        setProduct(parsedProduct);
        setLoading(false);
      } catch {
        // Fail silently and fallback to fetch
        loadProduct();
      }
    } else {
      // No product passed - fetch by id
      loadProduct();
    }
  }, [id, productParam]);

  useEffect(() => {
    if (product) {
      console.log('Image URL:', product.images);
    }
  }, [product]);

  // Load product from API (fallback)
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

  const handleContactSeller = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to contact the seller');
      return;
    }
    if (!product) {
      Alert.alert('Error', 'Product information not available');
      return;
    }
    try {
      const effectiveUserProfile = userProfile || {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
      };
      await chatUserService.syncUserToChatFirebase(user, effectiveUserProfile);
      const chatId = await chatService.createChatRoomWithProduct(
        user.uid,
        product.sellerId,
        product.id,
        {
          title: product.title,
          price: product.price,
        }
      );
      router.push({
        pathname: '/chat/[id]',
        params: {
          id: chatId,
          otherUserId: product.sellerId,
          otherUserName: product.seller.name,
          productTitle: product.title,
        },
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat with seller');
    }
  };

  const encodeLastSlash = (path: string): string => {
    console.log("path", path);
    if (!path) return path;
    const lastSlashIndex = path.lastIndexOf('/');
    if (lastSlashIndex === -1) return path; // no slash to replace
    return (
      path.substring(0, lastSlashIndex) +
      '%2F' +
      path.substring(lastSlashIndex + 1)
    );
  }



  // ...Rest of your component UI rendering (loading, error, product display, quantity adjustment, etc.)

  if (loading) {
    return (
      <View style={styles.fullscreen}>
        <FoodLoadingAnimation />
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

  const displayImages = product.images?.length > 0 ? product.images : ['empty'];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        showBackButton={true}
        showLogo={false}
        title="Details"
      />

      <View style={{ flex: 1 }}>
        <ScrollView style={styles.detailsCard} contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={styles.imageWrapper}>
            <Carousel
              width={screenWidth}
              height={screenWidth / 2}
              data={displayImages}
              onSnapToItem={(index) => setCurrentIndex(index)}
              loop={false}
              renderItem={({ item }) => (
                <ImageWithFallback source={{ uri: encodeLastSlash(item) }} style={styles.productImage} />
              )}
            />
            <View style={styles.pagination}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentIndex === index && styles.activeDot
                  ]}
                />
              ))}
            </View>
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
          </View>
        </ScrollView>
        <View style={styles.orderSection}>
          <TouchableOpacity style={styles.orderButton} onPress={handleContactSeller}>
            <Text style={styles.orderButtonText}>Contact Seller</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    position: 'absolute',
    bottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#ccc',
  },
  activeDot: {
    backgroundColor: '#ee5899',
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
    width: '100%',
    height: '100%',
    padding: 30,
    marginHorizontal: 24,
    alignSelf: 'center',
  },
  imageWrapper: {
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  orderSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    bottom: 0,
    width: '100%',
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
});