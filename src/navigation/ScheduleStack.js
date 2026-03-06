import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentScheduleScreen from '../screens/student/StudentScheduleScreen';
import SessionDetailScreen from '../screens/student/SessionDetailScreen';

const Stack = createNativeStackNavigator();

export default function ScheduleStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WeeklySchedule" component={StudentScheduleScreen} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
    </Stack.Navigator>
  );
}
