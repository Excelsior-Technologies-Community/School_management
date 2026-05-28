import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import SetupPassword from './pages/SetupPassword';
import SuperAdminDash from './pages/SuperAdminDash';
import SchoolAdminDash from './pages/SchoolAdminDash';
import { ToastContainer } from 'react-toastify';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function App() {
  return (
    <AuthProvider>
       <ToastContainer />
        <Routes>
      
          <Route path="/login" element={<Login />} />
          <Route path="/setup-password" element={<SetupPassword />} />

          <Route 
            path="/super-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminDash />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/school-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['school_admin']}>
                <SchoolAdminDash />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </AuthProvider>
  );
}