import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your pages
import Auth from './pages/Auth/Auth.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import StudentDashboard from './pages/Student/StudentDashboard.jsx';

// Global CSS
import './App.css';

/**
 * ProtectedRoute Component
 * Updated to ensure real-time role checking.
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  // Retrieve user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    // Redirect to login if no session exists
    return <Navigate to="/auth" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Role-based redirection to prevent unauthorized access
    const targetPath = user.role === 'Admin' ? "/admin-dashboard" : "/student-dashboard";
    return <Navigate to={targetPath} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected Admin Route 
            Access restricted to Admin role for system management.
        */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Student Route 
            Provides the profile and notification context for the Student user.
        */}
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect to login for safety */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;