// ========================================
// src/components/layout/Sidebar.jsx
// ========================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Scan,
    Shield,
    FileText,
    Brain,
    Settings
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { to: '/scan/new', icon: Scan, label: 'New Scan' },
        { to: '/reports', icon: FileText, label: 'Reports' },
    ];

    return (
        <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                            )
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-semibold text-white">AI Powered</span>
                    </div>
                    <p className="text-xs text-slate-400">
                        Groq AI integration enabled for advanced insights
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;