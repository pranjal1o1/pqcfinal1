// ========================================
// src/components/dashboard/StatsGrid.jsx
// ========================================
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

const StatsGrid = ({ stats }) => {
    if (!stats) return null;

    const statCards = [
        {
            label: 'Total Scans',
            value: formatNumber(stats.total_scans || 0),
            icon: Shield,
            color: 'blue',
        },
        {
            label: 'Critical Issues',
            value: formatNumber(stats.critical_count || 0),
            icon: AlertTriangle,
            color: 'red',
        },
        {
            label: 'Resolved',
            value: formatNumber(stats.resolved_count || 0),
            icon: CheckCircle,
            color: 'green',
        },
        {
            label: 'Risk Score',
            value: stats.avg_risk_score?.toFixed(1) || 'N/A',
            icon: TrendingUp,
            color: 'orange',
        },
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-500/10 text-blue-400',
            red: 'bg-red-500/10 text-red-400',
            green: 'bg-green-500/10 text-green-400',
            orange: 'bg-orange-500/10 text-orange-400',
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;