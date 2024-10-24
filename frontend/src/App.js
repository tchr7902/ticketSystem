import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from "./pages/Login"; 
import TicketPage from "./pages/TicketPage"; 
import ProfilePage from "./pages/Profile"
import SettingsPage from './pages/Settings';
import { AuthProvider, useAuth } from './utils/authContext';


const App = () => {
    const { token } = useAuth();

    return (
        <Routes>
            <Route path="/" element={token ? <Navigate to="/tickets" /> : <Navigate to="/users/login" />} />
            <Route path="/tickets" element={token ? <TicketPage /> : <Navigate to="/users/login" />} />
            <Route path="/users/login" element={<LoginPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Routes>
    );
};

export default App;
