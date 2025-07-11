import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import ImageWithFallback from './ImageWithFallback';

interface LoadingImageProps {
  source: { uri: string };
  style?: any;
  fallbackText?: string;
  showLoadingIndicator?: boolean;
}

export default function LoadingImage({
  source,
  style,
  fallbackText = "Image unavailable",
  showLoadingIndicator = true,
}: LoadingImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[style, styles.container]}>
      <ImageWithFallback
        source={source}
        style={style}
        fallbackText={fallbackText}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      
      {isLoading && showLoadingIndicator && !hasError && (
        <View style={[styles.loadingOverlay, style]}>
          <ActivityIndicator size="small" color="#ee5899" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});