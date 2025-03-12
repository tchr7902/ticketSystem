import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/Login';
import TicketPage from './pages/TicketPage';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';  
import AdminRegister from './pages/AdminRegister';
import PassReset from './pages/PassReset';
import GuidesPage from './pages/Guides';
import Analytics from './pages/Analytics'
import { AuthProvider, useAuth } from './utils/authContext';

const AdminRoute = ({ element: Component }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If user isn't loaded but token exists, decode the token to extract the role
  let role = user?.role;
  if (!role && token) {
    try {
      const decoded = jwt_decode(token);
      role = decoded.role;
    } catch (error) {
      console.error("Token decoding failed:", error);
    }
  }

  if (!token || role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return Component;
};

const App = () => {
  const { token } = useAuth();
  const location = useLocation();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); 
  }, [theme]);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('currentRoute', location.pathname);
    }
  }, [location, token]);

  const storedRoute = sessionStorage.getItem('currentRoute') || '/login';

  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/reset_password/*" element={<PassReset />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/home" element={token ? <TicketPage /> : <Navigate to="/login" />} />
        <Route
          path="/settings"
          element={<SettingsPage toggleTheme={toggleTheme} theme={theme} />}
        />
        <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/guides" element={token ? <GuidesPage /> : <Navigate to="/login" />} />
        <Route path="/admin" element={<AdminRoute element={<AdminRegister />} />} />
        <Route path="/analytics" element={<AdminRoute element={<Analytics />} />} />

        {/* Catch-all route */}
        <Route path="/*" element={token ? <Navigate to={storedRoute} /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
