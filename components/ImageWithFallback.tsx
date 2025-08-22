import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (
      // Check if source has uri and it is "[]"
      typeof source === "object" &&
      source !== null &&
      "uri" in source &&
      (source.uri === "empty" || !source.uri)
    ) {
      setHasError(true);
    } else {
      // Reset error if source changes to valid URI
      setHasError(false);
    }
  }, [source]);

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
  },
  fallbackText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});