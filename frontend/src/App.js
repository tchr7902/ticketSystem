import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from "./pages/Login"; 
import TicketPage from "./pages/TicketPage"; 
import { AuthProvider, useAuth } from './utils/authContext'; // Import useAuth

function AuthRoutes() {
    const { user } = useAuth(); // Access user from context

    return (
        <Routes>
            <Route path="/" element={user ? <Navigate to="/tickets" /> : <Navigate to="/users/login" />} />
            <Route path="/tickets" element={user ? <TicketPage /> : <Navigate to="/users/login" />} />
            <Route path="/users/login" element={<LoginPage />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AuthRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
