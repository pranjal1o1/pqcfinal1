// ========================================
// src/pages/Settings.jsx
// ========================================
import React from 'react';
import { Settings as SettingsIcon, User, Bell, Lock } from 'lucide-react';
import Card from '../components/common/Card';

const Settings = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-slate-400">Manage your application preferences</p>
            </div>

            <Card title="Profile">
                <div className="flex items-center gap-4 mb-4">
                    <User className="w-12 h-12 text-slate-400" />
                    <div>
                        <p className="font-medium text-white">User Account</p>
                        <p className="text-sm text-slate-400">admin@example.com</p>
                    </div>
                </div>
            </Card>

            <Card title="Notifications">
                <div className="space-y-3">
                    <label className="flex items-center justify-between">
                        <span className="text-slate-300">Email notifications</span>
                        <input type="checkbox" className="w-4 h-4" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                        <span className="text-slate-300">Scan completion alerts</span>
                        <input type="checkbox" className="w-4 h-4" defaultChecked />
                    </label>
                </div>
            </Card>

            <Card title="Security">
                <div className="space-y-4">
                    <button className="flex items-center gap-3 text-blue-400 hover:text-blue-300">
                        <Lock className="w-4 h-4" />
                        Change Password
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default Settings;