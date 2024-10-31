import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoginPage from "./pages/Login"; 
import TicketPage from "./pages/TicketPage"; 
import ProfilePage from "./pages/Profile"
import SettingsPage from './pages/Settings';
import AdminRegister from './pages/AdminRegister';
import { AuthProvider, useAuth } from './utils/authContext';

const App = () => {
    const { token } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // Store the current route in sessionStorage when the location changes
        if (token) {
            sessionStorage.setItem('currentRoute', location.pathname);
        }
    }, [location, token]);

    // Get the route from sessionStorage
    const storedRoute = sessionStorage.getItem('currentRoute') || '/users/login';

    return (
        <Routes>
            <Route path="*" element={token ? <Navigate to={storedRoute} /> : <Navigate to="/users/login" />} />
            <Route path="/tickets" element={token ? <TicketPage /> : <Navigate to="/users/login" />} />
            <Route path="/users/login" element={<LoginPage />} />
            <Route path="/settings" element={token ? <SettingsPage /> : <Navigate to="/users/login" />} />
            <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/users/login" />} />
            <Route path="/admin/registration" element={token ? <AdminRegister /> : <Navigate to="/users/login" />} />
        </Routes>
    );
};

export default App;
