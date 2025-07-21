import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // Navigate using the router hook
    router.replace('/auth');
  }, []);

  return null; // no visible content needed here
}