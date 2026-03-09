import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { ApiService } from '../services/api';

// Fallback for AsyncStorage if not installed (works on Web)
const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    // If you need mobile, you MUST eventually install @react-native-async-storage/async-storage
    // For now, let's use a dummy to prevent bundling crash
    return null; 
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') localStorage.removeItem(key);
  }
};

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const authDataSerialized = await storage.getItem('@CampusManager:user');
      if (authDataSerialized) {
        setUser(JSON.parse(authDataSerialized));
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email, password, role) => {
    try {
      const userData = await ApiService.login(email, role, password);
      setUser(userData);
      await storage.setItem('@CampusManager:user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    await storage.removeItem('@CampusManager:user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
