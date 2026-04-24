import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null); // 'company' or 'user'

  // Mock Login
  function loginWithFacebook() {
    setLoading(true);
    setTimeout(() => {
      setCurrentUser({
        uid: 'mock-user-123',
        displayName: 'John Doe',
        email: 'john@example.com',
        photoURL: 'https://i.pravatar.cc/150?img=11'
      });
      setLoading(false);
    }, 1000);
  }

  function logout() {
    setCurrentUser(null);
    setRole(null);
  }

  function selectRole(selectedRole) {
    setRole(selectedRole);
    // In real app, save role to Firestore user document
  }

  const value = {
    currentUser,
    role,
    loginWithFacebook,
    logout,
    selectRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}