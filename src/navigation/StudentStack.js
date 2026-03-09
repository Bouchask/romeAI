import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import SessionDetailScreen from '../screens/student/SessionDetailScreen';
import ModuleHistoryScreen from '../screens/student/ModuleHistoryScreen';

const Stack = createNativeStackNavigator();

const StudentHomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
    <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
    <Stack.Screen name="ModuleHistory" component={ModuleHistoryScreen} />
  </Stack.Navigator>
);

export default StudentHomeStack;
