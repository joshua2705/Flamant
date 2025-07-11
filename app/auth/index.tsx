import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChefHat, Users, Star } from 'lucide-react-native';
import ImageWithFallback from '@/components/ImageWithFallback';

export default function AuthWelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <ChefHat size={48} color="#ee5899" strokeWidth={2} />
          <Text style={styles.logoText}>FlamingoFood</Text>
        </View>
        <Text style={styles.subtitle}>Share delicious homemade food with your community</Text>
      </View>

      <View style={styles.heroSection}>
        <ImageWithFallback 
          source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
          style={styles.heroImage}
          fallbackText="Welcome image unavailable"
        />
        
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Users size={24} color="#4fcf88" strokeWidth={2} />
            <Text style={styles.featureText}>Connect with local food lovers</Text>
          </View>
          <View style={styles.feature}>
            <Star size={24} color="#ffc847" strokeWidth={2} />
            <Text style={styles.featureText}>Discover amazing homemade dishes</Text>
          </View>
          <View style={styles.feature}>
            <ChefHat size={24} color="#ff691f" strokeWidth={2} />
            <Text style={styles.featureText}>Share your culinary creations</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
  },
  heroSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 32,
  },
  featuresContainer: {
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#ee5899',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#ee5899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
});