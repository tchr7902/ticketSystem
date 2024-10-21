import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from "./pages/Login"; 
import TicketPage from "./pages/TicketPage"; 
import { AuthContext, AuthProvider } from './utils/authContext';

function App() {
    const { user } = useContext(AuthContext);

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={user ? <TicketPage /> : <Navigate to="/users/login" />} />
                    <Route path="/tickets" element={user ? <TicketPage /> : <Navigate to="/users/login" />} />
                    <Route path="/users/login" element={<LoginPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
