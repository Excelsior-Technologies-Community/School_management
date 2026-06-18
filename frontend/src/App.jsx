import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import SetupPassword from './pages/SetupPassword';
import SuperAdminDash from './pages/SuperAdminDash';
import SchoolAdminDash from './pages/SchoolAdminDash';
import { ToastContainer } from 'react-toastify';
import StudentDashboard from './pages/StudentDashboard';

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

        {/*  Allow BOTH school_admin and staff_member to enter this workspace component */}
        <Route
          path="/school-dashboard"
          element={
            <ProtectedRoute allowedRoles={['school_admin', 'staff_member']}>
              <SchoolAdminDash />
            </ProtectedRoute>
          }
        />

        {/* If any staff user manually hits old endpoint, seamlessly redirect them over */}
        <Route path="/staff-dashboard" element={<Navigate to="/school-dashboard" replace />} />

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}