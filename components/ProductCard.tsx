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

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <ImageWithFallback 
        source={{ uri: product.images[0] }}
        style={styles.image}
        fallbackText="Food image unavailable"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.price}>€{product.price.toFixed(2)}</Text>
        
        <View style={styles.sellerInfo}>
          <View style={styles.rating}>
            <Star size={14} color="#ffc847" fill="#ffc847" strokeWidth={0} />
            <Text style={styles.ratingText}>{product.seller.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.sellerName}>{product.seller.name}</Text>
        </View>
        
        <View style={styles.location}>
          <MapPin size={12} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.locationText}>{product.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flex: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 12,
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
});