import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from "./pages/Login"; 
import TicketPage from "./pages/TicketPage"; 
import { AuthProvider, useAuth } from './utils/authContext'; // Import useAuth

const App = () => {
    const { token } = useAuth();

    return (
        <Routes>
            {/* Redirect to tickets if logged in, otherwise go to login */}
            <Route path="/" element={token ? <Navigate to="/tickets" /> : <Navigate to="/users/login" />} />
            <Route path="/tickets" element={token ? <TicketPage /> : <Navigate to="/users/login" />} />
            <Route path="/users/login" element={<LoginPage />} />
            {/* Add other routes here */}
        </Routes>
    );
};

export default App;
