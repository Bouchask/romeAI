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

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('App mounting, Platform:', Platform.OS);
    
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        document.body.style.backgroundColor = '#F8FAFC';
        document.body.style.height = '100vh';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        
        const root = document.getElementById('root');
        if (root) {
          root.style.height = '100vh';
          root.style.display = 'flex';
          root.style.flexDirection = 'column';
        }
      } catch (e) {
        console.error('Web styling error:', e);
      }
    }
    
    // Artificial delay to ensure providers are ready
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading App...</Text>
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
