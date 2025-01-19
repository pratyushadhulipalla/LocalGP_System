import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ requiredRole }) => {
    const { authState } = useContext(AuthContext);
    
    if (!authState.token) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && !authState.user.roles.includes(requiredRole)) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default PrivateRoute;
