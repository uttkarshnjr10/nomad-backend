import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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

    const login = useCallback(async (email, password) => {
        try {
            const res = await authService.login({ email, password });

            const { token, username, userId, email: userEmail } = res.data;
            const finalUser = { username, userId, email: userEmail || email };

            localStorage.setItem('nomad_token', token);
            localStorage.setItem('nomad_user', JSON.stringify(finalUser));

            setToken(token);
            setUser(finalUser);

            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed'
            };
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            const res = await authService.register(userData);
            return { success: true, data: res.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('nomad_token');
        localStorage.removeItem('nomad_user');
    }, []);

    const value = useMemo(() => ({
        user,
        login,
        logout,
        register,
        token
    }), [user, token, login, register, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
