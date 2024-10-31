import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from "./pages/Login"; 
import TicketPage from "./pages/TicketPage"; 
import ProfilePage from "./pages/Profile"
import SettingsPage from './pages/Settings';
import AdminRegister from './pages/AdminRegister';
import { AuthProvider, useAuth } from './utils/authContext';


const App = () => {
    const { token, verifyToken } = useAuth();

    return (
        <Routes>
            <Route path="/" element={token ? <Navigate to="/tickets" /> : <Navigate to="/users/login" />} />
            <Route path="/tickets" element={token ? <TicketPage /> : <Navigate to="/users/login" />} />
            <Route path="/users/login" element={<LoginPage />} />
            <Route path="/settings" element={token ? <SettingsPage /> : <Navigate to="/users/login" />} />
            <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/users/login" />} />
            <Route path="/admin/registration" element={token ? <AdminRegister /> : <Navigate to="/users/login" />} />
            <Route path="*" element={<Navigate to="/users/login" />} />
        </Routes>
    );
};

export default App;
