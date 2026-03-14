import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentExamScheduleScreen from '../screens/student/StudentExamScheduleScreen';
import SessionDetailScreen from '../screens/student/SessionDetailScreen';

const Stack = createNativeStackNavigator();

export default function StudentExamsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExamSchedule" component={StudentExamScheduleScreen} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
    </Stack.Navigator>
  );
}
