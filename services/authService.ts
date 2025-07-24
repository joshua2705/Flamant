import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

// Modified useGoogleSignIn to accept an onSignInSuccess callback
export function useGoogleSignIn(onSignInSuccess?: () => void) { // <--- THIS LINE IS CRUCIAL
  const extra = Constants.expoConfig?.extra;

  const redirectUri = AuthSession.makeRedirectUri({
    // @ts-expect-error
    useProxy: true,
  });
  console.log('🔁 Redirect URI used:', redirectUri); // This must exactly match the one in Google Console

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: extra?.webClientId,
    androidClientId: extra?.androidClientId,
    iosClientId: extra?.iosClientId,
    redirectUri,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    console.log('Google Auth Response Effect Triggered:', response); // Log the response for any type

    if (response?.type === 'success') {
      console.log('Google Auth Success Response:', response); // Log success response

      // Extract idToken from response.authentication (preferred) or response.params (fallback)
      const idToken = response.authentication?.idToken || response.params?.id_token;

      console.log('Extracted ID Token:', idToken); // Check if idToken is undefined/null

      if (!idToken) {
        console.error('ID Token is missing from Google authentication response.');
        // You might want to show an alert to the user here instead of crashing
        // Alert.alert('Authentication Error', 'Failed to get ID token from Google. Please try again.');
        return; // Prevent further execution if idToken is missing
      }

      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(idToken);

      signInWithCredential(auth, credential)
        .then(userCred => {
          console.log('Firebase Google sign-in successful:', userCred.user.email);
          // --- NEW: Call the success callback after Firebase sign-in ---
          if (onSignInSuccess) {
            onSignInSuccess();
          }
          // --- END NEW ---
        })
        .catch(err => {
          console.error('Firebase sign-in failed:', err);
          // Alert.alert('Firebase Error', `Failed to sign in with Firebase: ${err.message}`);
        });
    } else if (response?.type === 'error') {
      console.error('Google Auth Error Response:', response); // Log error response
      // Alert.alert('Google Sign-In Error', `Authentication failed: ${response.error?.message || 'Unknown error'}`);
    }
  }, [response, onSignInSuccess]); // Added onSignInSuccess to dependency array

  return { request, promptAsync };
}
