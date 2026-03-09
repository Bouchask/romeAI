import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ProfessorHomeStack, ProfessorSessionStack } from './ProfessorStack';
import AvailableClassroomsScreen from '../screens/professor/AvailableClassroomsScreen';
import SessionManagementScreen from '../screens/professor/SessionManagementScreen';
import ProfessorProfileScreen from '../screens/professor/ProfessorProfileScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();

export default function ProfessorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: 'home',
            NewSession: 'add-circle',
            Rooms: 'business',
            Sessions: 'calendar',
            Profile: 'person',
          };
          const iconName = icons[route.name] || 'help';
          return <Ionicons name={focused ? iconName : `${iconName}-outline`} size={22} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { 
          backgroundColor: theme.colors.card, 
          borderTopColor: theme.colors.border,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={ProfessorHomeStack} />
      <Tab.Screen name="NewSession" component={ProfessorSessionStack} options={{ title: 'Schedule' }} />
      <Tab.Screen name="Rooms" component={AvailableClassroomsScreen} options={{ title: 'Assets' }} />
      <Tab.Screen name="Sessions" component={SessionManagementScreen} options={{ title: 'Schedule' }} />
      <Tab.Screen name="Profile" component={ProfessorProfileScreen} />
    </Tab.Navigator>
  );
}
