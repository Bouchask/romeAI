import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthStack from './src/navigation/AuthStack';
import StudentTabs from './src/navigation/StudentTabs';
import ProfessorTabs from './src/navigation/ProfessorTabs';
import AdminTabs from './src/navigation/AdminTabs';
import { ROLES } from './src/constants/roles';
import { ErrorBoundary } from './src/components/ErrorBoundary';

function RootNavigator() {
  const { isAuthenticated, user } = useAuth();
  
  // Debug logging
  useEffect(() => {
    console.log('RootNavigator state:', { isAuthenticated, userRole: user?.role });
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return <AuthStack />;
  }

  switch (user.role) {
    case ROLES.STUDENT:
      return <StudentTabs />;
    case ROLES.PROFESSOR:
      return <ProfessorTabs />;
    case ROLES.ADMIN:
      return <AdminTabs />;
    default:
      console.warn('Unknown user role:', user.role);
      return <AuthStack />;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  rootWeb: {
    display: 'flex',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  }
});

import { initDatabase } from './src/database/initDatabase';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('Initializing database...');
        await initDatabase();
        setDbLoaded(true);
      } catch (e) {
        console.warn('Database failed to load', e);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (dbLoaded) {
      console.log('App and DB ready, Platform:', Platform.OS);
      // ... rest of web styling logic
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [dbLoaded]);

  if (!isReady || !dbLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Initializing Database...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={[styles.root, Platform.OS === 'web' && styles.rootWeb]}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics} style={{ flex: 1 }}>
          <AuthProvider>
            <View style={styles.root}>
              <NavigationContainer fallback={<Text>Loading Navigation...</Text>}>
                <StatusBar style="dark" />
                <RootNavigator />
              </NavigationContainer>
            </View>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
