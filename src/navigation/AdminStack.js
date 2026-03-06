import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import RoomManagementScreen from '../screens/admin/RoomManagementScreen';
import ModifyRoomScreen from '../screens/admin/ModifyRoomScreen';
import ExamManagementScreen from '../screens/admin/ExamManagementScreen';
import ExamDetailScreen from '../screens/admin/ExamDetailScreen';
import CreateExamScreen from '../screens/admin/CreateExamScreen';

const Stack = createNativeStackNavigator();

export const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
  </Stack.Navigator>
);

export const RoomsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RoomList" component={RoomManagementScreen} />
    <Stack.Screen name="ModifyRoom" component={ModifyRoomScreen} />
  </Stack.Navigator>
);

export const ExamsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExamList" component={ExamManagementScreen} />
    <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
    <Stack.Screen name="CreateExam" component={CreateExamScreen} />
  </Stack.Navigator>
);
