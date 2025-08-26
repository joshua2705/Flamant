import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Package, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { productService } from '@/services/productService';

// Get screen dimensions for responsive layout
const { width: screenWidth } = Dimensions.get('window');

// Calculate number of columns based on screen width
const getColumns = () => {
  if (screenWidth >= 1200) return 3; // Desktop monitors
  if (screenWidth >= 768) return 2;  // Tablets
  return 1; // Mobile phones
};

export default function SellScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(getColumns());
  const [showSoldItems, setShowSoldItems] = useState(true); // Toggle state for sold items

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
  }, [userProfile]);

  const loadUserProducts = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      console.log("Getting listings by user with id", userProfile.id);
      const userOwnedProducts = await productService.getProductsBySeller(userProfile.id);
      console.log("Listings obtained");
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

  // Filter products based on toggle state
  const filteredProducts = showSoldItems 
    ? userProducts 
    : userProducts.filter(product => product.isAvailable !== false);

  // Calculate stats
  const activeProducts = userProducts.filter(product => product.isAvailable !== false);
  const soldProducts = userProducts.filter(product => product.isAvailable === false);

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
          <Text style={styles.statNumber}>{activeProducts.length}</Text>
          <Text style={styles.statLabel}>Active Listings</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{soldProducts.length}</Text>
          <Text style={styles.statLabel}>Sold Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>
    </View>
  );

  // Custom Toggle Component
  const SoldItemsToggle = () => {
    const toggleAnimation = new Animated.Value(showSoldItems ? 1 : 0);

    const handleToggle = () => {
      const toValue = showSoldItems ? 0 : 1;
      Animated.timing(toggleAnimation, {
        toValue,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setShowSoldItems(!showSoldItems);
    };

    const translateX = toggleAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 22],
    });

    const backgroundColor = toggleAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#E5E7EB', '#ee5899'],
    });

    return (
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          {showSoldItems ? 'Hide' : 'Show'} sold items ({soldProducts.length})
        </Text>
        <TouchableOpacity style={styles.toggleWrapper} onPress={handleToggle}>
          <Animated.View style={[styles.toggleTrack, { backgroundColor }]}>
            <Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]}>
              {showSoldItems ? (
                <Eye size={12} color="#ee5899" />
              ) : (
                <EyeOff size={12} color="#9CA3AF" />
              )}
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

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
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Your Food Listings</Text>
                <Text style={styles.sectionSubtitle}>
                  {filteredProducts.length} listing{filteredProducts.length !== 1 ? 's' : ''} shown • 
                  Active earning potential: €{activeProducts.reduce((sum, product) => sum + product.price, 0).toFixed(2)}
                </Text>
              </View>
              
              {/* Toggle for showing/hiding sold items */}
              {soldProducts.length > 0 && <SoldItemsToggle />}
            </View>
            
            {filteredProducts.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <EyeOff size={48} color="#9CA3AF" />
                <Text style={styles.noResultsTitle}>No items to show</Text>
                <Text style={styles.noResultsSubtitle}>
                  All your items are currently sold. Toggle "Show sold items" to see them.
                </Text>
              </View>
            ) : (
              <View style={[styles.gridContainer, { paddingHorizontal: 20 }]}>
                {filteredProducts.map(product => (
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
            )}
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
  sectionTitleContainer: {
    marginBottom: 16,
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
  // Toggle Styles
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  toggleWrapper: {
    marginLeft: 12,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // No Results Styles
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
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
