import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (token && !socket) {
            // 1. Connect to Chat Service (Port 4000)
            const newSocket = io('http://localhost:4000', {
                auth: { token }, // Send JWT for handshake auth
                transports: ['websocket'], // Force WebSocket (faster)
            });

            newSocket.on('connect', () => {
                console.log("🟢 Connected to Chat Service");
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log("🔴 Disconnected from Chat Service");
                setIsConnected(false);
            });

            setSocket(newSocket);
        }

        // Cleanup on logout
        if (!token && socket) {
            socket.disconnect();
            setSocket(null);
        }
        
        return () => {
            if (socket) socket.off();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);