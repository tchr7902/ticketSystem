import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchUser, changeUserPassword } from "./api.js";
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem('token') || null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            const expirationTime = sessionStorage.getItem('tokenExpiration');
            if (token && expirationTime && new Date().getTime() < expirationTime) {
                try {
                    console.log("Loading user with valid token.");
                    const userData = await fetchUser(token);
                    setUser(userData);
                } catch (err) {
                    console.error('Error fetching user:', err);
                    logout();
                }
            } else {
                console.log("Token is not valid or has expired.");
                logout();
            }
        };

        loadUser(); 
    }, [token]);

    const login = (token, userData) => {
        const expirationTime = new Date().getTime() + 5 * 60 * 60 * 1000;
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

    return (
        <AuthContext.Provider value={{ user, token, login, logout, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
