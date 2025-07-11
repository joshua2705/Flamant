import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockData';
// import { productService } from '@/services/productService';

// Get screen dimensions for responsive layout
const { width: screenWidth } = Dimensions.get('window');

// Calculate number of columns based on screen width
const getColumns = () => {
  if (screenWidth >= 1200) return 4; // Desktop monitors
  if (screenWidth >= 768) return 3;  // Tablets
  return 2; // Mobile phones
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState(getColumns());

  // Update columns when screen size changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const newColumns = window.width >= 1200 ? 4 : window.width >= 768 ? 3 : 2;
      setColumns(newColumns);
    });

    return () => subscription?.remove();
  }, []);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    // const unsubscribe = productService.subscribeToProducts((newProducts) => {
    //   setProducts(newProducts);
    //   setFilteredProducts(newProducts);
    //   setLoading(false);
    // });
    // return unsubscribe;
    // Simulate loading dummy data
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const loadProducts = async () => {
    try {
      setError(null);
      setLoading(true);
      // const fetchedProducts = await productService.getAllProducts();
      // setProducts(fetchedProducts);
      // setFilteredProducts(fetchedProducts);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (query: string) => {
    if (query.trim() === '') {
      setFilteredProducts(products);
    } else {
      // Local filtering for demo
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProducts();
    } catch (err) {
      setError('Failed to refresh products.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="FlamingoFood" showSearch />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading delicious food...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="FlamingoFood" showFavorites />
      <SearchBar onSearch={handleSearch} />
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredProducts.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No food items found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or check back later</Text>
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
      </ScrollView>
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
  errorContainer: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
  },
  gridItem: {
    paddingHorizontal: 5,
    marginBottom: 10,
  },
});