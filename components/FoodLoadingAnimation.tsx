import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

export default function FoodLoadingAnimation() {
  return (
    <View style={styles.container}>
      <View style={styles.animationWrapper}>
        <LottieView
          source={require('../assets/animations/food-loader.json')}
          autoPlay
          loop
          resizeMode="contain"
          style={styles.animation}
        />
      </View>
      <Text style={styles.loadingText}>Loading up the neighborhood’s secret recipes...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  animationWrapper: {
    width: 150,         // ⬅️ final visible size
    height: 150,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 300,         // ⬅️ large internal size
    height: 300,
    transform: [{ scale: 0.5 }],  // ⬅️ scales it down to fit
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ee5899',
    textAlign: 'center',
  },
});
