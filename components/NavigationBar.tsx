import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ShoppingBag, CookingPot, MessageSquare } from 'lucide-react-native';

const TAB_CONFIG = [
  { name: 'index', label: 'Food', Icon: ShoppingBag },
  { name: 'sell', label: 'Feed', Icon: CookingPot },
  { name: 'chat', label: 'Folks', Icon: MessageSquare },
];

export default function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Create Animated values for each tab
  const animatedValues = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  const animateIcon = (index: number) => {
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 1.2,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route, idx) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === idx;
        const tabConfig = TAB_CONFIG.find(tab => tab.name === route.name);

        const onPress = () => {
          animateIcon(idx);

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {tabConfig?.Icon && (
              <Animated.View style={{ transform: [{ scale: animatedValues[idx] }] }}>
                <tabConfig.Icon
                  size={24}
                  color={isFocused ? '#ee5899' : '#9CA3AF'}
                  strokeWidth={2}
                />
              </Animated.View>
            )}
            <Text style={[
              styles.tabBarLabel,
              { color: isFocused ? '#ee5899' : '#9CA3AF' }
            ]}>
              {tabConfig?.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 0.5,
    height: 70,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingTop: 25,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 2,
  },
});
