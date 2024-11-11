import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoginPage from "./pages/Login"; 
import TicketPage from "./pages/TicketPage"; 
import ProfilePage from "./pages/Profile"
import SettingsPage from './pages/Settings';
import AdminRegister from './pages/AdminRegister';
import PassReset from './pages/PassReset';
import { AuthProvider, useAuth } from './utils/authContext';

const App = () => {
    const { token } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (token) {
            sessionStorage.setItem('currentRoute', location.pathname);
        }
    }, [location, token]);

    const storedRoute = sessionStorage.getItem('currentRoute') || '/users/login';

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/users/login" element={<LoginPage />} />
            <Route path="/users/reset_password" element={<PassReset />} />

            {/* Protected Routes */}
            <Route path="/tickets" element={token ? <TicketPage /> : <Navigate to="/users/login" />} />
            <Route path="/settings" element={token ? <SettingsPage /> : <Navigate to="/users/login" />} />
            <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/users/login" />} />
            <Route path="/admin/registration" element={token ? <AdminRegister /> : <Navigate to="/users/login" />} />
            
            {/* Catch-all route */}
            <Route path="*" element={token ? <Navigate to={storedRoute} /> : <Navigate to="/users/login" />} />
        </Routes>
    );
};

export default App;
