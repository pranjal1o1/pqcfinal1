// ========================================
// src/components/layout/Header.jsx
// ========================================
import React from 'react';
import { Shield, Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
            <div className="px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <div>
                        <h1 className="text-xl font-bold text-white">Quantum-Resistant Analyzer</h1>
                        <p className="text-xs text-slate-400">Cryptographic Security Scanner</p>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors relative">
                        <Bell className="w-5 h-5 text-slate-400" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <Link
                        to="/settings"
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <Settings className="w-5 h-5 text-slate-400" />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;