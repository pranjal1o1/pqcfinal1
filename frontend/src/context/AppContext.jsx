// ========================================
// src/context/AppContext.jsx
// ========================================
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { NOTIFICATION_DURATION } from '../utils/constants';

const AppContext = createContext(null);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('dark');

    // Auto-remove notifications after duration
    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                setNotifications((prev) => prev.slice(1));
            }, NOTIFICATION_DURATION);

            return () => clearTimeout(timer);
        }
    }, [notifications]);

    // Add notification
    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setNotifications((prev) => [...prev, { id, message, type }]);
    }, []);

    // Remove specific notification
    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    // Success notification
    const showSuccess = useCallback((message) => {
        addNotification(message, 'success');
    }, [addNotification]);

    // Error notification
    const showError = useCallback((message) => {
        addNotification(message, 'error');
    }, [addNotification]);

    // Info notification
    const showInfo = useCallback((message) => {
        addNotification(message, 'info');
    }, [addNotification]);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Set global loading state
    const setGlobalLoading = useCallback((isLoading) => {
        setLoading(isLoading);
    }, []);

    // Update user
    const updateUser = useCallback((userData) => {
        setUser(userData);
    }, []);

    // Logout
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('auth_token');
        showSuccess('Logged out successfully');
    }, [showSuccess]);

    // Toggle theme
    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    const value = {
        // State
        notifications,
        loading,
        user,
        theme,

        // Notification methods
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showInfo,
        clearNotifications,

        // Global methods
        setGlobalLoading,
        updateUser,
        logout,
        toggleTheme,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};