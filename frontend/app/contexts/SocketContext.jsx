"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

// Create a context for the socket
const SocketContext = createContext(null);

// Custom hook to use the socket context easily
export const useSocket = () => useContext(SocketContext);

// The provider component that will wrap our application
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // Only establish a socket connection if the user is authenticated
        if (isAuthenticated) {
            // Connect to the backend socket server using the URL from environment variables
            const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
                // Optional: You can pass the auth token here if your socket server needs it for authentication
                // auth: { token: localStorage.getItem('token') }
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
            });
            
            setSocket(newSocket);

            // Clean up the connection when the component unmounts or the user's auth state changes
            return () => {
                console.log('Closing socket connection...');
                newSocket.close();
            };
        } else if (socket) {
            // If the user logs out and a socket connection exists, disconnect it
            socket.disconnect();
            setSocket(null);
        }
    }, [isAuthenticated]); // This effect re-runs whenever the user's authentication state changes

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
