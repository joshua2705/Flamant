import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  showFavorites?: boolean;
  showProfile?: boolean;
  onFavoritesPress?: () => void;
}

export default function Header({ title, showFavorites = false, showProfile = true, onFavoritesPress }: HeaderProps) {
  const router = useRouter();

  const handleFavoritesPress = () => {
    if (onFavoritesPress) {
      onFavoritesPress();
    } else {
      // TODO: Navigate to favorites screen
      console.log('Navigate to favorites');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actions}>
        {showFavorites && (
          <TouchableOpacity style={styles.favoritesButton} onPress={handleFavoritesPress}>
            <Heart size={24} color="#ee5899" strokeWidth={2} />
          </TouchableOpacity>
        )}
        {showProfile && (
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => router.push('/profile')}
          >
            <User size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoritesButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ee5899',
    justifyContent: 'center',
    alignItems: 'center',
  },
});