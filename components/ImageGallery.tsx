import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
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

  const handleImagePress = (index: number) => {
    setSelectedIndex(index);
    if (enableFullscreen) {
      setIsFullscreenVisible(true);
    }
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setSelectedIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Main Image */}
      <TouchableOpacity
        onPress={() => handleImagePress(selectedIndex)}
        disabled={!enableFullscreen}
      >
        <ImageWithFallback
          source={{ uri: images[selectedIndex] }}
          style={[styles.mainImage, imageStyle]}
          fallbackText="Image unavailable"
        />
      </TouchableOpacity>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <ScrollView
          horizontal
          style={styles.thumbnailContainer}
          showsHorizontalScrollIndicator={false}
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

          <View style={styles.fullscreenImageContainer}>
            <ImageWithFallback
              source={{ uri: images[selectedIndex] }}
              style={styles.fullscreenImage}
              fallbackText="Image unavailable"
            />
          </View>

          {images.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={() => navigateImage('prev')}
              >
                <ChevronLeft size={24} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={() => navigateImage('next')}
              >
                <ChevronRight size={24} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>
            </>
          )}

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {selectedIndex + 1} / {images.length}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
  },
  mainImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  thumbnailContainer: {
    marginTop: 8,
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
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  fullscreenImageContainer: {
    width: screenWidth,
    height: screenHeight * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 12,
    zIndex: 10,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 50,
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
});