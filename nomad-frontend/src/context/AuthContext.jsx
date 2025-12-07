import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Load User from Storage on boot
    const [token, setToken] = useState(localStorage.getItem('nomad_token'));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('nomad_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem('nomad_token', token);
        } else {
            localStorage.removeItem('nomad_token');
            localStorage.removeItem('nomad_user');
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await authService.login({ email, password });
            
            // Extract all needed data
            const { token, username, userId, email: userEmail } = res.data;
            // Fallback for email if backend doesn't send it in body
            const finalUser = { username, userId, email: userEmail || email };

            // Save to Storage
            localStorage.setItem('nomad_token', token);
            localStorage.setItem('nomad_user', JSON.stringify(finalUser));
            
            setToken(token);
            setUser(finalUser);
            
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const res = await authService.register(userData);
            return { success: true, data: res.data };
        } catch (error) {
            console.error("Registration Error:", error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('nomad_token');
        localStorage.removeItem('nomad_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;