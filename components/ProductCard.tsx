import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import ImageWithFallback from './ImageWithFallback';
import { Product } from '@/types';
import { useRouter } from 'expo-router';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handlePress = React.useCallback(() => {
    // Only allow navigation if product is available
    if (product.isAvailable !== false) {
      router.push({
        pathname: `/product/[id]`,
        params: {
          id: product.id,
          product: JSON.stringify(product), // Serialize product to string
        },
      });
    }
  }, [router, product]);

  const isSold = product.isAvailable === false;

  return (
    <TouchableOpacity 
      style={[styles.container, isSold && styles.soldContainer]} 
      onPress={handlePress} 
      activeOpacity={isSold ? 1 : 0.85}
      accessibilityRole="button"
      accessibilityLabel={
        isSold 
          ? `${product.title} - Sold out` 
          : `View details for ${product.title}`
      }
      disabled={isSold}
    >
      {/* Main Content */}
      <ImageWithFallback
        source={{ uri: product.images[0] }}
        style={[styles.image, isSold && styles.soldImage]}
        fallbackText="Food image unavailable"
      />
      <View style={[styles.content, isSold && styles.soldContent]}>
        <Text style={[styles.title, isSold && styles.soldText]} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={[styles.price, isSold && styles.soldText]}>€{product.price.toFixed(2)}</Text>

        <View style={styles.sellerInfo}>
          <View style={styles.rating}>
            <Star size={14} color="#ffc847" fill="#ffc847" strokeWidth={0} />
            <Text style={[styles.ratingText, isSold && styles.soldText]}>{product.seller.rating}</Text>
          </View>
          <Text style={[styles.sellerName, isSold && styles.soldText]}>{product.seller.name}</Text>
        </View>
      </View>

      {/* Sold Overlay */}
      {isSold && (
        <View style={styles.soldOverlay}>
          <View style={styles.soldInfo}>
            <Text style={styles.soldInfoText}>This item has been marked as sold</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flex: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  soldContainer: {
    opacity: 0.8,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  soldImage: {
    opacity: 0.5,
  },
  content: {
    padding: 12,
  },
  soldContent: {
    opacity: 0.6,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ee5899',
    marginBottom: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  sellerName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    flex: 1,
  },
  soldText: {
    color: '#9CA3AF',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    flex: 1,
  },
  // Sold Overlay Styles
  soldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  soldInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '100%',
    padding: 16,
    marginHorizontal: 20,
  },
  soldInfoText: {
    color: '#374151',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});
