import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const { height } = Dimensions.get('window');

export default function AuthIndex() {
  const [showLogin, setShowLogin] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoPosition = new Animated.Value(0);
  const loginPosition = new Animated.Value(height);
  const backgroundOpacity = new Animated.Value(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(true);
      
      // Animate logo up and login screen up
      Animated.parallel([
        Animated.timing(logoPosition, {
          toValue: -height * 0.25,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loginPosition, {
          toValue: height * 0.25,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Navigate to login after animation
        router.push('/auth/login');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background overlay during transition */}
      <Animated.View 
        style={[
          styles.backgroundOverlay,
          { opacity: backgroundOpacity }
        ]} 
      />

      {/* Logo Section */}
      <Animated.View 
        style={[
          styles.logoContainer,
          { transform: [{ translateY: logoPosition }] }
        ]}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/images/flamant-logo.png')}
            style={styles.logo}
            onLoad={() => setLogoLoaded(true)}
            contentFit="contain"
          />
        </View>

        {!showLogin && (
          <Animated.View style={styles.textContainer}>
            <Text style={styles.title}>Flamant</Text>
            <Text style={styles.subtitle}>Welcome to your journey</Text>
          </Animated.View>
        )}

        {!showLogin && (
          <View style={styles.dotsContainer}>
            {[1, 2, 3].map((dot) => (
              <View key={dot} style={styles.dot} />
            ))}
          </View>
        )}
      </Animated.View>

      {/* Login Screen Placeholder */}
      <Animated.View 
        style={[
          styles.loginContainer,
          { transform: [{ translateY: loginPosition }] }
        ]}
      >
        <View style={styles.loginPlaceholder}>
          <Text style={styles.loginText}>Loading...</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f9fafb',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logo: {
    width: 128,
    height: 128,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 36,
    color: '#ff6f91',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 16,
    position: 'absolute',
    bottom: 120,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff6f91',
  },
  loginContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.75,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  loginPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'WorkSans-Medium',
    fontSize: 18,
    color: '#6b7280',
  },
});