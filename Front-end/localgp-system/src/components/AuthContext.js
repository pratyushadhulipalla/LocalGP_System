import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: null,
        user: null,
        
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Load user and token from local storage if available
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        

        try {
            const parsedUser = user ? JSON.parse(user) : null;
            if (token && parsedUser) {
                setAuthState({ token, user: parsedUser });
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
        }
    }, []);

    const login = (token, user) => {
        console.log(user)
        setAuthState({ token, user });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('roles',user.roles);
        localStorage.setItem('userId', JSON.stringify(user.id));
        
        
        setAuthState({ token, user });

        // Redirect based on user role
        if (user.roles.includes('Admin')) {
            navigate('/admin');
        } else if (user.roles.includes('Doctor')) {
            navigate('/doctor');
        } else if (user.roles.includes('Patient')) {
            navigate('/patient');
        } else {
            navigate('/login');
        }
    };

    const logout = () => {
        setAuthState({ token: null, user: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({ token: null, user: null });
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
