import React, { createContext, useContext, useState } from 'react';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password, role) => {
    // Demo: accept any email/password and set role for UI
    setUser({
      id: '1',
      email,
      name: role === ROLES.STUDENT ? 'Alex Student' : role === ROLES.PROFESSOR ? 'Dr. Jane Professor' : 'Admin User',
      role,
      ...(role === ROLES.STUDENT && { field: 'Computer Science' }),
      ...(role === ROLES.PROFESSOR && { modules: ['Algorithms', 'Database Systems'] }),
    });
  };

  const register = (email, password, name, role, extra = {}) => {
    setUser({
      id: '1',
      email,
      name: name || email.split('@')[0],
      role,
      ...extra,
    });
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
