import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfessorDashboardScreen from '../screens/professor/ProfessorDashboardScreen';
import ProfessorFilieresScreen from '../screens/professor/ProfessorFilieresScreen';
import ModuleSessionsScreen from '../screens/professor/ModuleSessionsScreen';
import ProfessorModuleDetailScreen from '../screens/professor/ProfessorModuleDetailScreen';
import AttendanceManagementScreen from '../screens/professor/AttendanceManagementScreen';
import CreateSessionScreen from '../screens/professor/CreateSessionScreen';
import ModifySessionScreen from '../screens/professor/ModifySessionScreen';

const Stack = createNativeStackNavigator();

export const ProfessorHomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfessorDashboard" component={ProfessorDashboardScreen} />
    <Stack.Screen name="ProfessorFilieres" component={ProfessorFilieresScreen} />
    <Stack.Screen name="ModuleSessions" component={ModuleSessionsScreen} />
    <Stack.Screen name="ProfessorModuleDetail" component={ProfessorModuleDetailScreen} />
    <Stack.Screen name="AttendanceManagement" component={AttendanceManagementScreen} />
    <Stack.Screen name="ModifySession" component={ModifySessionScreen} />
  </Stack.Navigator>
);

export const ProfessorSessionStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
    <Stack.Screen name="ModifySession" component={ModifySessionScreen} />
  </Stack.Navigator>
);
