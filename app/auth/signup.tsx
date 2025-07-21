import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Easing,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const { height } = Dimensions.get('window');

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

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

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch (error: any) {
      let errorMessage = 'Sign up failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage =
          'Password is too weak. Please choose a stronger password.';
      }

      Alert.alert('Sign Up Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.formScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/images/flamant-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

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

          <View
            style={[styles.inputContainer, errors.name && styles.inputError]}
          >
            <TextInput
              style={styles.input}
              value={name}
              placeholder="Full Name"
              placeholderTextColor="#6b7280"
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View
            style={[styles.inputContainer, errors.email && styles.inputError]}
          >
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="Email"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View
            style={[
              styles.inputContainer,
              errors.password && styles.inputError,
            ]}
          >
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                value={password}
                placeholder="Password"
                placeholderTextColor="#6b7280"
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors({ ...errors, password: undefined });
                }}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" strokeWidth={2} />
                ) : (
                  <Eye size={20} color="#9CA3AF" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <View
            style={[
              styles.inputContainer,
              errors.confirmPassword && styles.inputError,
            ]}
          >
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                value={confirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor="#6b7280"
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: undefined });
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" strokeWidth={2} />
                ) : (
                  <Eye size={20} color="#9CA3AF" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputFlex: {
    flex: 1,
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
  signUpButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
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
  inputError: {
    borderColor: '#ff6f91',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'WorkSans-Regular',
    color: '#ff6f91',
    marginTop: 4,
  },
});
