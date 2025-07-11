import { useState, useEffect } from 'react';
import { Image } from 'react-native';

interface UseImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

interface ImageLoadState {
  [key: string]: 'loading' | 'loaded' | 'error';
}

export function useImagePreloader({ images, priority = false }: UseImagePreloaderProps) {
  const [loadStates, setLoadStates] = useState<ImageLoadState>({});
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    if (!images || images.length === 0) {
      setAllLoaded(true);
      return;
    }

    // Initialize loading states
    const initialStates: ImageLoadState = {};
    images.forEach(uri => {
      initialStates[uri] = 'loading';
    });
    setLoadStates(initialStates);

    // Preload images
    const preloadPromises = images.map(uri => {
      return new Promise<void>((resolve) => {
        Image.prefetch(uri)
          .then(() => {
            setLoadStates(prev => ({ ...prev, [uri]: 'loaded' }));
            resolve();
          })
          .catch(() => {
            setLoadStates(prev => ({ ...prev, [uri]: 'error' }));
            resolve();
          });
      });
    });

    // Wait for all images to finish loading (success or failure)
    Promise.all(preloadPromises).then(() => {
      setAllLoaded(true);
    });
  }, [images]);

  const getImageState = (uri: string) => loadStates[uri] || 'loading';
  const isImageLoaded = (uri: string) => loadStates[uri] === 'loaded';
  const hasImageError = (uri: string) => loadStates[uri] === 'error';

  return {
    loadStates,
    allLoaded,
    getImageState,
    isImageLoaded,
    hasImageError,
  };
}