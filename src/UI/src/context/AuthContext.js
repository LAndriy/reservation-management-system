import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Notification from '../components/Notification';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authService.getCurrentUser()
                .then(userData => {
                    setUser(userData);
                    updateLastActivity();
                })
                .catch(() => {
                    setError('Sesja wygasła. Zaloguj się ponownie.');
                    handleLogout();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({
            show: true,
            message,
            type
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, show: false }));
    };

    const updateLastActivity = () => {
        localStorage.setItem('lastActivity', Date.now().toString());
    };

    const handleLogin = async (userData, token) => {
        try {
            localStorage.setItem('token', token);
            setUser(userData);
            updateLastActivity();
            setError(null);
            showNotification(`Witaj ${userData.firstName || userData.email}!`);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('lastActivity');
        setUser(null);
        setError(null);
        showNotification('Wylogowano pomyślnie');
    };

    const handleUpdateUserData = (userData) => {
        // Zachowujemy token i aktualizujemy tylko dane użytkownika
        setUser(prevUser => ({
            ...prevUser,
            ...userData
        }));
        updateLastActivity();
    };

    const handleDeleteAccount = async () => {
        try {
            await authService.deleteAccount();
            handleLogout();
            showNotification('Konto zostało usunięte');
            return true;
        } catch (err) {
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login: handleLogin,
        logout: handleLogout,
        updateUserData: handleUpdateUserData,
        deleteAccount: handleDeleteAccount
    };

    return (
        <AuthContext.Provider value={value}>
            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={handleCloseNotification}
            />
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
