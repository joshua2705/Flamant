import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const { height } = Dimensions.get('window');

export default function AuthIndex() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, user } = useAuth();

  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const loginTranslateY = useRef(new Animated.Value(height)).current;
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const dotsOpacity = useRef(new Animated.Value(1)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dotsOpacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(logoTranslateY, {
            toValue: -height * 0.25,
            duration: 800,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(loginTranslateY, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(formOpacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 2500);

    return () => clearTimeout(timer);
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
      {/* Logo & Splash */}
      <Animated.View
        style={[
          styles.logoSection,
          {
            transform: [{ translateY: logoTranslateY }],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/flamant-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Animated.View style={{ opacity: titleOpacity }}>
          <Text style={styles.title}>Flamant</Text>
        </Animated.View>
        <Animated.View style={[styles.dotsContainer, { opacity: dotsOpacity }]}>
          {[1, 2, 3].map((dot) => (
            <View key={dot} style={styles.dot} />
          ))}
        </Animated.View>
      </Animated.View>

      {/* Sliding Login */}
      <Animated.View
        style={[
          styles.loginContainer,
          {
            transform: [{ translateY: loginTranslateY }],
            opacity: formOpacity,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.formScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.loginTitle}>Welcome Back</Text>
          <Text style={styles.loginSubtitle}>Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
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
        </ScrollView>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    pointerEvents: 'none',
    backgroundColor: '#ffffff',
  },
  logo: { width: 150, height: 150 },
  title: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 32,
    color: '#ff6f91',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: '#ff6f91',
    borderRadius: 5,
  },
  loginContainer: {
    position: 'absolute',
    bottom: 0,
    height: height * 0.72,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    zIndex: 1,
  },
  formScroll: {
    flexGrow: 1,
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
