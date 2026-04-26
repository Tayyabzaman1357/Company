import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Lazy-loaded pages (enables code splitting per route)
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Signup = lazy(() => import('./pages/Signup'));
const CompanyDashboard = lazy(() => import('./pages/company/CompanyDashboard'));
const CompanyTokens = lazy(() => import('./pages/company/CompanyTokens'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const CompanyDetails = lazy(() => import('./pages/user/CompanyDetails'));
const MyTokens = lazy(() => import('./pages/user/MyTokens'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/signup" />;
  return children;
};

// Role Route Component
const RoleRoute = ({ children, allowedRole }) => {
  const { currentUser, role } = useAuth();
  if (!currentUser) return <Navigate to="/signup" />;
  
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : 'user';
  if (normalizedRole !== allowedRole.toLowerCase()) return <Navigate to="/" />;
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
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
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  
  return (
    <Router basename={base}>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(12px)'
          }
        }} />
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
            Loading...
          </div>
        }>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;