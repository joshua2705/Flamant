// components/MarkAsSoldButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

interface Props {
  onPress: () => void;
  isAvailable: boolean;
}

export default function MarkAsSoldButton({ onPress, isAvailable }: Props) {
  if (!isAvailable) return null;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconBox}>
        <Check size={22} color="#fff" />
      </View>
      <Text style={styles.text}>Mark as Sold</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: '#ee5899',
    borderRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#ee5899',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ff80b5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.3,
  },
});
