import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyTokens from './pages/company/CompanyTokens';
import UserDashboard from './pages/user/UserDashboard';
import CompanyDetails from './pages/user/CompanyDetails';
import MyTokens from './pages/user/MyTokens';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  return children;
};

// Role Route Component
const RoleRoute = ({ children, allowedRole }) => {
  const { currentUser, role } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (role !== allowedRole) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      
      {/* Company Routes */}
      <Route path="/company" element={
        <RoleRoute allowedRole="company">
          <CompanyDashboard />
        </RoleRoute>
      } />
      <Route path="/company/tokens/:id" element={
        <RoleRoute allowedRole="company">
          <CompanyTokens />
        </RoleRoute>
      } />
      
      {/* User Routes */}
      <Route path="/user" element={
        <RoleRoute allowedRole="user">
          <UserDashboard />
        </RoleRoute>
      } />
      <Route path="/user/company/:id" element={
        <RoleRoute allowedRole="user">
          <CompanyDetails />
        </RoleRoute>
      } />
      <Route path="/user/my-tokens" element={
        <RoleRoute allowedRole="user">
          <MyTokens />
        </RoleRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(12px)'
          }
        }} />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;