import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchUser } from "./api.js";
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

        loadUser(); // Call loadUser when the component mounts
    }, [token]);

    const login = (token, userData) => {
        const expirationTime = new Date().getTime() + 60 * 60 * 1000; // Token expires in 1 hour
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
        navigate("/users/login"); // Redirect to login on logout
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);