import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Package, Star, MapPin } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockData';

// Get screen dimensions for responsive layout
const { width: screenWidth } = Dimensions.get('window');

// Calculate number of columns based on screen width
const getColumns = () => {
  if (screenWidth >= 1200) return 3; // Desktop monitors
  if (screenWidth >= 768) return 2;  // Tablets
  return 1; // Mobile phones
};

export default function SellScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(getColumns());

  // Update columns when screen size changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const newColumns = window.width >= 1200 ? 3 : window.width >= 768 ? 2 : 1;
      setColumns(newColumns);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadUserProducts();
  }, [user]);

  const loadUserProducts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, show some products as if they belong to the current user
      // In a real app, this would filter by the actual user ID
      const userOwnedProducts = mockProducts.slice(0, 8).map(product => ({
        ...product,
        sellerId: user.uid,
        seller: {
          ...product.seller,
          id: user.uid,
          name: user.displayName || 'You',
          email: user.email || '',
        }
      }));
      
      const filteredProducts = userOwnedProducts;
      setUserProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading user products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserProducts();
    setRefreshing(false);
  };

  const handleCreateListing = () => {
    router.push('/sell-food');
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Package size={64} color="#D1D5DB" strokeWidth={1} />
      </View>
      <Text style={styles.emptyTitle}>No listings yet</Text>
      <Text style={styles.emptySubtitle}>
        Start sharing your delicious homemade food with the community
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleCreateListing}>
        <Plus size={20} color="#ffffff" strokeWidth={2} />
        <Text style={styles.emptyButtonText}>Create Your First Listing</Text>
      </TouchableOpacity>
    </View>
  );

  const StatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Your Performance</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProducts.length}</Text>
          <Text style={styles.statLabel}>Active Listings</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>23</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="My Listings" showProfile />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Listings" showProfile />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {userProducts.length > 0 && <StatsCard />}
        
        {userProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={styles.listingsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Food Listings</Text>
              <Text style={styles.sectionSubtitle}>
                {userProducts.length} active listing{userProducts.length !== 1 ? 's' : ''} • Earning potential: €{userProducts.reduce((sum, product) => sum + product.price, 0).toFixed(2)}
              </Text>
            </View>
            
            <View style={[styles.gridContainer, { paddingHorizontal: 20 }]}>
              {userProducts.map(product => (
                <View 
                  key={product.id} 
                  style={[
                    styles.gridItem,
                    { width: `${100 / columns}%` }
                  ]}
                >
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateListing}>
        <Plus size={24} color="#ffffff" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
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
  statsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ee5899',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  listingsContainer: {
    paddingBottom: 100, // Space for FAB
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#ee5899',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ee5899',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#ee5899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ee5899',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ee5899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    paddingHorizontal: 5,
    marginBottom: 10,
  },
});