import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchUser } from "./api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    const isTokenValid = () => {
        const expirationTime = localStorage.getItem('tokenExpiration');
        if (!token || !expirationTime) return false;
        return new Date().getTime() < expirationTime; // Valid if current time is less than expiration time
    };

    useEffect(() => {
        const loadUser = async () => {
            if (token && isTokenValid()) {
                try {
                    const userData = await fetchUser(token);
                    setUser(userData);
                } catch (err) {
                    console.error('Error fetching user:', err);
                    logout();
                }
            } else {
                console.log("Token is not valid or does not exist.");
                logout();
            }
        };
        loadUser();
    }, [token]);

    const login = (token, userData) => {
        const expirationTime = new Date().getTime() + 60 * 60 * 1000; // Token expires in 1 hour
        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiration', expirationTime);
        setToken(token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiration');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
