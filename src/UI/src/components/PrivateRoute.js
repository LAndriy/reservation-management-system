import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (roles && !roles.some(role => user?.roles?.includes(role))) {
        return <Navigate to="/" />;
    }
    
    return children;
};

export default PrivateRoute;
