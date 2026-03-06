import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import { theme } from '../theme';
import { HomeStack, RoomsStack, ExamsStack } from './AdminStack';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: 'home',
            Rooms: 'business',
            Exams: 'document-text',
            Users: 'people',
            Profile: 'person',
          };
          const iconName = icons[route.name] || 'help';
          return <Ionicons name={focused ? iconName : `${iconName}-outline`} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { 
          backgroundColor: theme.colors.card, 
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Rooms" component={RoomsStack} />
      <Tab.Screen name="Exams" component={ExamsStack} />
      <Tab.Screen name="Users" component={UserManagementScreen} options={{ title: 'Users' }} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
}
