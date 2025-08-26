import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

export default function SoldBanner() {
  return (
    <Animated.View
      entering={FadeInDown.duration(350)}
      exiting={FadeOutUp.duration(250)}
      style={styles.container}
    >
      <Text style={styles.text}>SOLD</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ee5899',
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#ee5899',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
    letterSpacing: 2,
  },
});
