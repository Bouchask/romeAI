import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { ROLES } from '../constants/roles';
import { ApiService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password, role) => {
    try {
      // Role is validated on backend by choosing the table
      const userData = await ApiService.login(email.toLowerCase(), role.toLowerCase());
      
      setUser(userData);
      return true;
    } catch (error) {
      // Display the specific error message from backend if available
      const message = error.response?.data?.message || error;
      Alert.alert('Login Error', typeof message === 'string' ? message : 'Check your email or account type');
      return false;
    }
  };

  const register = async (email, password, name, role, extra = {}) => {
    try {
      let newUser;
      if (role === ROLES.STUDENT) {
        newUser = await ApiService.addStudent({ name, email, ...extra });
      } else if (role === ROLES.PROFESSOR) {
        newUser = await ApiService.addProfessor({ name, email });
      } else if (role === ROLES.ADMIN) {
        newUser = await ApiService.addAdmin({ name, email });
      }

      setUser({ ...newUser, role });
      return true;
    } catch (error) {
      Alert.alert('Registration Error', typeof error === 'string' ? error : 'Failed to register');
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
