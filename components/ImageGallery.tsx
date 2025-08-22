import React, { useState, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Modal, Dimensions, PanResponder, Text, Animated } from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import ImageWithFallback from './ImageWithFallback';


interface ImageGalleryProps {
  images: string[];
  style?: any;
  imageStyle?: any;
  showThumbnails?: boolean;
  enableFullscreen?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ImageGallery({
  images,
  style,
  imageStyle,
  showThumbnails = true,
  enableFullscreen = true,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);
  
  // Animation values for carousel
  const translateX = useRef(new Animated.Value(0)).current;
  const fullscreenTranslateX = useRef(new Animated.Value(0)).current;

  if (!images || images.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <ImageWithFallback
          source={{ uri: '' }}
          style={[styles.mainImage, imageStyle]}
          fallbackText="No images available"
        />
      </View>
    );
  }

  const handleSwipe = (direction: 'left' | 'right', isFullscreen = false) => {
    const currentTranslate = isFullscreen ? fullscreenTranslateX : translateX;
    
    if (direction === 'left' && selectedIndex < images.length - 1) {
      setSelectedIndex(prev => prev + 1);
    } else if (direction === 'right' && selectedIndex > 0) {
      setSelectedIndex(prev => prev - 1);
    } else if (direction === 'left' && selectedIndex === images.length - 1) {
      // Loop to first image
      setSelectedIndex(0);
    } else if (direction === 'right' && selectedIndex === 0) {
      // Loop to last image
      setSelectedIndex(images.length - 1);
    }
    
    // Reset animation
    Animated.spring(currentTranslate, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const createPanResponder = (isFullscreen = false) => {
    const currentTranslate = isFullscreen ? fullscreenTranslateX : translateX;
    
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        currentTranslate.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = screenWidth * 0.25; // 25% of screen width
        
        if (Math.abs(gestureState.dx) > swipeThreshold) {
          if (gestureState.dx > 0) {
            handleSwipe('right', isFullscreen);
          } else {
            handleSwipe('left', isFullscreen);
          }
        } else {
          // Snap back to center
          Animated.spring(currentTranslate, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  };

  const mainPanResponder = createPanResponder(false);
  const fullscreenPanResponder = createPanResponder(true);

  const handleImagePress = () => {
    if (enableFullscreen) {
      setIsFullscreenVisible(true);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Main Image Carousel */}
      <View style={styles.carouselContainer} {...mainPanResponder.panHandlers}>
        <Animated.View
          style={[
            styles.imageWrapper,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleImagePress}
            disabled={!enableFullscreen}
            activeOpacity={0.9}
          >
            <ImageWithFallback
              source={{ uri: images[selectedIndex] }}
              style={[styles.mainImage, imageStyle]}
              fallbackText="Image unavailable"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Page Indicators */}
      {images.length > 1 && (
        <View style={styles.indicatorContainer}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedIndex(index)}
              style={[
                styles.indicator,
                selectedIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      )}

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <ScrollView
          horizontal
          style={styles.thumbnailContainer}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailContent}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedIndex(index)}
              style={[
                styles.thumbnail,
                selectedIndex === index && styles.selectedThumbnail,
              ]}
            >
              <ImageWithFallback
                source={{ uri: image }}
                style={styles.thumbnailImage}
                fallbackText=""
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Swipe Hint Text */}
      {images.length > 1 && (
        <Text style={styles.swipeHint}>Swipe left or right to browse images</Text>
      )}

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreenVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFullscreenVisible(false)}
      >
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFullscreenVisible(false)}
          >
            <X size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.fullscreenImageContainer} {...fullscreenPanResponder.panHandlers}>
            <Animated.View
              style={[
                styles.fullscreenImageWrapper,
                {
                  transform: [{ translateX: fullscreenTranslateX }],
                },
              ]}
            >
              <ImageWithFallback
                source={{ uri: images[selectedIndex] }}
                style={styles.fullscreenImage}
                fallbackText="Image unavailable"
              />
            </Animated.View>
          </View>

          {/* Fullscreen Image Counter */}
          <View style={styles.imageCounter}>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {selectedIndex + 1} / {images.length}
              </Text>
            </View>
          </View>

          {/* Fullscreen Indicators */}
          {images.length > 1 && (
            <View style={styles.fullscreenIndicatorContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.fullscreenIndicator,
                    selectedIndex === index && styles.activeFullscreenIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
  },
  carouselContainer: {
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
  },
  mainImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#ee5899',
    width: 24,
    borderRadius: 4,
  },
  thumbnailContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  thumbnailContent: {
    paddingHorizontal: 4,
  },
  thumbnail: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#ee5899',
  },
  thumbnailImage: {
    width: 60,
    height: 60,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  fullscreenImageContainer: {
    width: screenWidth,
    height: screenHeight * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  counterBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  fullscreenIndicatorContainer: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 3,
  },
  activeFullscreenIndicator: {
    backgroundColor: '#ffffff',
    width: 20,
    borderRadius: 3,
  },
});
