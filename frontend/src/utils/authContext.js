import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchUser } from "./api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser ] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const userData = await fetchUser(token);
                    setUser(userData);
                } catch(err) {
                    console.error('Error fetching user:', err);
                    logout();
                }
            }
        }
        loadUser();
    }, [token]);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setToken(token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);