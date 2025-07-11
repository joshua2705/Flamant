import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, ImageProps } from 'react-native';
import { ImageOff, RefreshCw } from 'lucide-react-native';

interface ImageWithFallbackProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  fallbackText?: string;
  containerStyle?: any;
}

export default function ImageWithFallback({
  source,
  style,
  fallbackText = "Image unavailable",
  containerStyle,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <View style={[style, styles.fallbackContainer, containerStyle]}>
        <View style={styles.fallbackContent}>
          <ImageOff size={32} color="#9CA3AF" strokeWidth={1.5} />
          <Text style={styles.fallbackText}>{fallbackText}</Text>
        </View>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      onError={handleError}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  fallbackContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  fallbackText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});