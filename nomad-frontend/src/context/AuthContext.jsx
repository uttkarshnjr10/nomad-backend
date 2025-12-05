import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('nomad_token'));

    useEffect(() => {
        if (token) {
            // In a real app, you might validate the token here
            // For now, we assume if token exists, user is logged in
            setUser({ token });
        } else {
            setUser(null);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await authService.login({ email, password });
            
            // Extract data
            const { token, username, userId } = res.data;
            
            // Save to storage and state
            localStorage.setItem('nomad_token', token);
            setToken(token);
            setUser({ username, userId });
            
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('nomad_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;