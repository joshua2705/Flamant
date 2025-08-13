import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return null;   

  return <Redirect href={user ? '/(tabs)' : '/auth'} />;
}