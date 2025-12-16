// ========================================
// src/components/layout/Layout.jsx
// ========================================
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { ScanProvider } from '../../context/ScanContext';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Layout = () => {
    const { notifications, removeNotification } = useApp();

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'success': return 'bg-green-500/10 border-green-500/30';
            case 'error': return 'bg-red-500/10 border-red-500/30';
            default: return 'bg-blue-500/10 border-blue-500/30';
        }
    };

    return (
        <ScanProvider>
            <div className="min-h-screen bg-slate-900 flex flex-col">
                <Header />
                <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex-1 overflow-auto">
                        <div className="p-8">
                            <Outlet />
                        </div>
                    </main>
                </div>

                {/* Notifications */}
                <div className="fixed bottom-4 right-4 space-y-2 z-50">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm ${getBgColor(notification.type)} animate-in slide-in-from-right`}
                        >
                            {getIcon(notification.type)}
                            <p className="text-sm text-white flex-1">{notification.message}</p>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </ScanProvider>
    );
};

export default Layout;