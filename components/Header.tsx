import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User as UserIcon, Heart, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title?: string;
  showFavorites?: boolean;
  showProfile?: boolean;
  showBackButton?: boolean;
  showLogo?: boolean;
  onBackPress?: () => void;
  onFavoritesPress?: () => void;
}

export default function Header({
  title,
  showLogo = true,
  showFavorites = false,
  showProfile = true,
  showBackButton = false,
  onBackPress,
  onFavoritesPress,
}: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) onBackPress();
    else router.back();
  };

  const handleFavoritesPress = () => {
    if (onFavoritesPress) onFavoritesPress();
    else console.log('Navigate to favorites');
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
        )}
        {showLogo && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require('../assets/images/flamant-logo.png')}
              style={styles.logo}
              accessible
              accessibilityRole="image"
              accessibilityLabel="App Logo"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Title centered */}
      <View style={styles.titleContainer} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.actions}>
        {showFavorites && (
          <TouchableOpacity
            style={styles.favoritesButton}
            onPress={handleFavoritesPress}
            accessibilityRole="button"
            accessibilityLabel="View favorites"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Heart size={24} color="#ee5899" strokeWidth={2} />
          </TouchableOpacity>
        )}
        {showProfile && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Go to profile"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <UserIcon size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 38,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.055,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 70,
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    marginRight: 10,
    padding: 8,
  },
  logo: {
    width: 48,
    height: 48,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 38,
    bottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 21,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 12,
  },
  favoritesButton: {
    width: 38,
    height: 38,
    borderRadius: 18,
    backgroundColor: '#FEF3F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    shadowColor: '#ee5899',
    shadowOpacity: 0.11,
    shadowRadius: 7,
    elevation: 1,
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#ee5899',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ee5899',
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 2,
  },
});
