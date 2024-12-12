import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/Login';
import TicketPage from './pages/TicketPage';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';  
import AdminRegister from './pages/AdminRegister';
import PassReset from './pages/PassReset';
import GuidesPage from './pages/Guides';
import { AuthProvider, useAuth } from './utils/authContext';

const AdminRoute = ({ element: Component }) => {
  const { user, token } = useAuth();

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/home" />;
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

        {/* Catch-all route */}
        <Route path="/*" element={token ? <Navigate to={storedRoute} /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
