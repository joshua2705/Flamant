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

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const handleRegister = async () => {
    if (!email || !password || !name || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await signUp(email, password, name);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.formScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Static Logo */}
      <View style={styles.logoSection}>
        <Image
          source={require('../../assets/images/flamant-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* Animated Form */}
      <Animated.View
        style={[
          styles.loginContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.loginTitle}>Create Account</Text>
        <Text style={styles.loginSubtitle}>Sign up to get started</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor="#6b7280"
          />
        </View>

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
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor="#6b7280"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Already a member? </Text>
          <TouchableOpacity onPress={() => router.replace('/auth/login')}>
            <Text style={styles.signupLink}>Sign in</Text>
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
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
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
