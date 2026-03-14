import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import StudentStack from './StudentStack';
import ScheduleStack from './ScheduleStack';
import StudentExamsStack from './StudentExamsStack';
import StudentNotificationsScreen from '../screens/student/StudentNotificationsScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            DashboardStack: 'home',
            ScheduleStack: 'calendar',
            Exams: 'document-text',
            Notifications: 'notifications',
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
        component={StudentStack} 
        options={{ title: 'Home', tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="ScheduleStack" 
        component={ScheduleStack} 
        options={{ title: 'Schedule', tabBarLabel: 'Schedule' }} 
      />
      <Tab.Screen 
        name="Exams" 
        component={StudentExamsStack} 
        options={{ title: 'Exams', tabBarLabel: 'Exams' }} 
      />
      <Tab.Screen name="Notifications" component={StudentNotificationsScreen} />
      <Tab.Screen name="Profile" component={StudentProfileScreen} />
    </Tab.Navigator>
  );
}
