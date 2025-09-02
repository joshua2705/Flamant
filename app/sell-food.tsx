import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, X } from 'lucide-react-native';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { productService } from '@/services/productService';
import Header from '@/components/Header';
import { Dimensions } from 'react-native';
const screenWidth = Dimensions.get('window').width;

export default function SellFoodScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [servings, setServings] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera roll permissions to add photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera permissions to take a photo');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleAddPhoto = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!userProfile) {
      Alert.alert('Authentication required', 'Please sign in to post food items');
      return;
    }
    if (!title || !description || !price) {
      Alert.alert('Missing information', 'Please fill in all required fields');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid price', 'Please enter a valid price');
      return;
    }
    setLoading(true);
    try {
      const newProduct = {
        title,
        description,
        price: priceNum,
        images,
        category: '', // Removed from UI but keeping for compatibility
        sellerId: userProfile.id,
        seller: {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          avatar: userProfile.avatar || '',
          rating: userProfile.rating || 0,
          reviewCount: userProfile.reviewCount || 0,
          isVerified: userProfile.isVerified || false,
          location: userProfile.location || '',
          createdAt: userProfile.createdAt || new Date(),
        },
        location,
        isAvailable: true,
        tags: [],
        servings: servings ? parseInt(servings) : undefined,
        notes: notes || '',
      };
      await productService.createProduct(newProduct, images);
      setTitle('');
      setDescription('');
      setPrice('');
      setLocation('');
      setServings('');
      setNotes('');
      setImages([]);
      router.push('/sell');
    } catch (error) {
      Alert.alert('Error', 'Failed to post your food item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Sell Food"
        showBackButton
        showLogo={false}
        onBackPress={() => router.back()}
      />
      <View style={styles.content} >
        <View style={styles.photoSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <ImageWithFallback source={{ uri }} style={styles.image} fallbackText="Preview unavailable" />
                <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                  <X size={14} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageButton} onPress={handleAddPhoto}>
              <Camera size={24} color="#9CA3AF" strokeWidth={2} />
              <Text style={styles.addImageText}>Add Photo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Title (e.g. Homemade Pasta Bolognese) *"
          value={title}
          onChangeText={setTitle}
          autoCorrect={false}
          autoCapitalize="sentences"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description *"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex1]}
            placeholder="Price (€) *"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[styles.input, styles.flex1, styles.marginLeft]}
            placeholder="Servings"
            value={servings}
            onChangeText={setServings}
            keyboardType="number-pad"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Pickup Location (e.g. Building A, Floor 2)"
          value={location}
          onChangeText={setLocation}
          autoCorrect={false}
          autoCapitalize="sentences"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notes (dietary restrictions, ingredients, etc.)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>{loading ? 'Posting...' : 'Post Food Item'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { display: 'flex', flexDirection: 'column', flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  photoSection: {
    flexGrow: 5,
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  textArea: { height: 80 },
  row: {
    flexDirection: 'row',
  },
  flex1: { flex: 1 },
  marginLeft: { marginLeft: 12 },
  imageScroll: {
    flexDirection: 'row',
  },
  imageWrapper: {
    width: screenWidth-90,
    position: 'relative',
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    flex:1,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4, 
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  addImageButton: {
    width: screenWidth - 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  addImageText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#ee5899',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#ee5899',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});
