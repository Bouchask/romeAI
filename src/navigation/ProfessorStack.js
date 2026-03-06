import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfessorDashboardScreen from '../screens/professor/ProfessorDashboardScreen';
import AttendanceManagementScreen from '../screens/professor/AttendanceManagementScreen';
import RequestBookingScreen from '../screens/professor/RequestBookingScreen';
import ModifySessionScreen from '../screens/professor/ModifySessionScreen';
import SessionDetailScreen from '../screens/student/SessionDetailScreen';
import ModuleSessionsScreen from '../screens/professor/ModuleSessionsScreen';

const Stack = createNativeStackNavigator();

export default function ProfessorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfessorDashboard" component={ProfessorDashboardScreen} />
      <Stack.Screen name="AttendanceManagement" component={AttendanceManagementScreen} />
      <Stack.Screen name="RequestBooking" component={RequestBookingScreen} />
      <Stack.Screen name="ModifySession" component={ModifySessionScreen} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
      <Stack.Screen name="ModuleSessions" component={ModuleSessionsScreen} />
    </Stack.Navigator>
  );
}
