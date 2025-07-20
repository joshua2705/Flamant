import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Easing,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current; // start slightly below

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.formScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View style={[styles.logoSection]}>
        <Image
          source={require('../../assets/images/flamant-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* Animated Login Form */}
      <Animated.View
        style={[
          styles.loginContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.loginTitle}>Welcome Back</Text>
        <Text style={styles.loginSubtitle}>Sign in to continue</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input]}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#6b7280"
            secureTextEntry
          />
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>New member? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupLink}>Register now</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.ssoButton}>
          <Text style={styles.ssoButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formScroll: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  logoSection: {
    marginTop: 102,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    backgroundColor: '#ffffff',
  },
  logo: { width: 150, height: 150, marginBottom: 8 },
  loginContainer: {
    paddingHorizontal: 24,
    paddingTop: 1,
  },
  loginTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 28,
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'WorkSans-Regular',
    color: '#111827',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontFamily: 'WorkSans-Medium',
    fontSize: 14,
    color: '#ff6f91',
  },
  button: {
    backgroundColor: '#ff6f91',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'WorkSans-Bold',
    fontSize: 16,
  },
  ssoButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#fafafa',
  },
  ssoButtonText: {
    fontFamily: 'WorkSans-Medium',
    fontSize: 16,
    color: '#374151',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 16,
    color: '#6b7280',
  },
  signupLink: {
    fontFamily: 'WorkSans-Medium',
    fontSize: 16,
    color: '#ff6f91',
  },
});
