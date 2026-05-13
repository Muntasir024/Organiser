import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { colors } from '../theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 16,
          elevation: 8,
          paddingHorizontal: 16,
          marginHorizontal: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="checkmark-circle-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="bookmark-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="person-outline" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? '#EEF2FF' : 'transparent',
      }}
    >
      <Ionicons name={name} size={24} color={color} />
    </View>
  );
}
