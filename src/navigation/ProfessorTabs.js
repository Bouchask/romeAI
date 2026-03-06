import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProfessorStack from './ProfessorStack';
import CreateSessionScreen from '../screens/professor/CreateSessionScreen';
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
            DashboardStack: 'home',
            CreateSession: 'add-circle',
            Rooms: 'business',
            Sessions: 'calendar',
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
      <Tab.Screen 
        name="DashboardStack" 
        component={ProfessorStack} 
        options={{ title: 'Home', tabBarLabel: 'Home' }} 
      />
      <Tab.Screen name="CreateSession" component={CreateSessionScreen} options={{ title: 'Create Session', tabBarLabel: 'New' }} />
      <Tab.Screen name="Rooms" component={AvailableClassroomsScreen} options={{ title: 'Classrooms' }} />
      <Tab.Screen name="Sessions" component={SessionManagementScreen} options={{ title: 'My Sessions' }} />
      <Tab.Screen name="Profile" component={ProfessorProfileScreen} />
    </Tab.Navigator>
  );
}
