import { Tabs } from 'expo-router';
import { ShoppingBag, CookingPot, MessageSquare } from 'lucide-react-native';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 49 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarActiveTintColor: '#ee5899',
        tabBarInactiveTintColor: '#9CA3AF',
        // tabBarLabelStyle is not needed here as we will handle it with a custom component
        tabBarItemStyle: {
          // You can remove flexDirection from here if you wrap it in a View
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Buy',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.tabItem}>
              <ShoppingBag size={size} color={color} strokeWidth={2} />
              <Text style={[styles.tabBarLabel, { color }]}>Buy</Text>
            </View>
          ),
          tabBarLabel: () => null, // Hide the default label
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: 'Sell',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.tabItem}>
              <CookingPot size={size} color={color} strokeWidth={2} />
              <Text style={[styles.tabBarLabel, { color }]}>Sell</Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.tabItem}>
              <MessageSquare size={size} color={color} strokeWidth={2} />
              <Text style={[styles.tabBarLabel, { color }]}>Chat</Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  tabItem: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 2, // Add some space between the icon and the text
  },
});