import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchUser, changeUserPassword, changeUserEmail, fetchArchivedTickets } from "./api.js";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem('token') || null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            if (window.location.pathname.startsWith('/users/reset_password')) {
                return;
            }
    
            const expirationTime = sessionStorage.getItem('tokenExpiration');
            if (token && expirationTime && new Date().getTime() < expirationTime) {
                try {
                    const userData = await fetchUser(token);
                    setUser(userData);
                } catch (err) {
                    console.error('Error fetching user:', err);
                    logout();
                }
            } else {
                logout();
            }
        };
    
        loadUser(); 
    }, [token, navigate]); 
    

    const login = (token, userData) => {
        const expirationTime = new Date().getTime() + 12 * 60 * 60 * 1000;
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('tokenExpiration', expirationTime);
        setToken(token);
        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('tokenExpiration');
        setToken(null);
        setUser(null);
        navigate("/users/login");
    };

    const changePassword = async (currentPassword, newPassword) => {
        if (!user) {
            throw new Error("User not authenticated.");
        }

        try {
            const response = await changeUserPassword(user.email, currentPassword, newPassword);
            return response;
        } catch (err) {
            console.error("Failed to change password:", err);
            throw new Error("Failed to change password. Please try again.");
        }
    };

    const changeEmail = async (currentEmail, newEmail) => {
        if (!user) {
            throw new Error("User not authenticated.");
        }

        try {
            const response = await changeUserEmail(currentEmail, newEmail);
            return response;
        } catch (err) {
            console.error("Failed to change email:", err);
            throw new Error("Failed to change email. Please try again.");
        }
    };

    const archiveTicket = async (ticketId, notes) => {
        try {
            const response = await axios.post(`/tickets/${ticketId}/archive`, { notes }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error archiving ticket:', error);
            throw new Error('Failed to archive ticket. Please try again.');
        }
    };

    const getArchivedTickets = async (userId) => {
        try {
            const data = await fetchArchivedTickets(userId);
            return data;
        } catch (error) {
            console.error('Error fetching archived tickets:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, changePassword, changeEmail, archiveTicket, getArchivedTickets }}>
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);
