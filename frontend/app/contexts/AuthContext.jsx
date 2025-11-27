"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                // Check if token is expired
                const isExpired = decodedUser.exp * 1000 < Date.now();
                if (isExpired) {
                    localStorage.removeItem('token');
                } else {
                    setUser(decodedUser);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // Helper to handle authentication response (used by login, register, and googleLogin)
    const handleAuthResponse = (data) => {
        const { token } = data;
        localStorage.setItem('token', token);
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const login = async (email, password) => {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { email, password });
        handleAuthResponse(res.data);
    };

    const register = async (username, email, password) => {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, { username, email, password });
        handleAuthResponse(res.data);
    };

    // NEW: Handle Google Login
    const googleLogin = async (credential) => {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, { credential });
        handleAuthResponse(res.data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        googleLogin, // Export this function so it can be used in the Login page
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};