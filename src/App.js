import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Compose from './pages/Compose';
import UserDashboard from './pages/UserDashboard';
import UserArchive from './pages/UserArchive';
import Login from './pages/Login';
import CircularDetail from './pages/CircularDetail';
import Archive from './pages/Archive';
import Users from './pages/Users';
import { AuthProvider } from './context/AuthContext';
import HiddenCirculars from './pages/HiddenCirculars';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'admin') {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/user-dashboard" />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Default → redirect to login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Protected Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>

            {/* Admin only routes */}
            <Route path="dashboard" element={
              <ProtectedRoute allowedRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="compose" element={
              <ProtectedRoute allowedRole="admin">
                <Compose />
              </ProtectedRoute>
            } />
            <Route path="circular" element={
              <ProtectedRoute allowedRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="memorandum" element={
              <ProtectedRoute allowedRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="policy" element={
              <ProtectedRoute allowedRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="archive" element={
              <ProtectedRoute allowedRole="admin">
                <Archive />
              </ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute allowedRole="admin">
                <Users />
              </ProtectedRoute>
            } />

            {/* Circular Detail - both admin and user */}
            <Route path="circular/:id" element={
              <ProtectedRoute>
                <CircularDetail />
              </ProtectedRoute>
            } />

            {/* User only routes */}
            <Route path="user-dashboard" element={
              <ProtectedRoute allowedRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="user-circular" element={
              <ProtectedRoute allowedRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="user-memorandum" element={
              <ProtectedRoute allowedRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="user-policy" element={
              <ProtectedRoute allowedRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="user-archive" element={
              <ProtectedRoute allowedRole="user">
                <UserArchive />
              </ProtectedRoute>
            } />
            <Route path="hidden" element={
  <ProtectedRoute allowedRole="admin">
    <HiddenCirculars />
  </ProtectedRoute>
} />

          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;