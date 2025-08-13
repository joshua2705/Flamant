import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import { Product, User } from '@/types';
import { productService } from '@/services/productService';
import FoodLoadingAnimation from '@/components/FoodLoadingAnimation';
import { useNavigation } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const getColumns = () => {
  if (screenWidth >= 1200) return 4;
  if (screenWidth >= 768) return 3;
  return 2;
};

export default function HomeScreen() {
  const { user, userProfile } = useAuth();
  console.log('User Profile Name:', userProfile?.name);
  //console.log('Current user object:', JSON.stringify(user, null, 2));
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState(getColumns());

  const getFirstName = (fullName: string) => fullName.split(' ')[0];

  const toProperCase = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
  const headerTitle = React.useMemo(() => {
    if (userProfile?.name) {
      const firstName = getFirstName(userProfile.name);
      return `Welcome, ${toProperCase(firstName)}`;
    }
    return 'Flamant Food';
  }, [userProfile]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const newColumns = window.width >= 1200 ? 4 : window.width >= 768 ? 3 : 2;
      setColumns(newColumns);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setProducts(products);
    setFilteredProducts(products);
  }, []);

  const navigation = useNavigation();

useEffect(() => {
  navigation.setOptions({
    headerShown: false,
    tabBarStyle: loading && products.length === 0 ? { display: 'none' } : undefined,
  });
}, [loading, products]);



  const loadProducts = async () => {
    if (!user) return;
    try {
      setError(null);
      setLoading(true);
      const productsList = await productService.getAllProducts();
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
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
        {/* <Header title="FlamingoFood"  showFavorites /> */}
        {/* <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading delicious food...</Text>
        </View> */}
        <FoodLoadingAnimation/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={headerTitle} showFavorites />
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
            <Text style={styles.emptySubtext}>
              Try adjusting your search or check back later
            </Text>
          </View>
        ) : (
          <View style={[styles.gridContainer, { paddingHorizontal: 20 }]}>
            {filteredProducts.map((product) => (
              <View
                key={product.id}
                style={[styles.gridItem, { width: `${100 / columns}%` }]}
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
